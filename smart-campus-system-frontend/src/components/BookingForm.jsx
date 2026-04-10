import { useState } from 'react'

function getToday() {
  return new Date().toISOString().split("T")[0];
}

const initialForm = {
  resourceId: "",
  resourceName: "",
  resourceType: "LAB",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: 1,
}

const emptyErrors = {
  resourceId: "",
  resourceName: "",
  bookingDate: "",
  startTime: "",
  endTime: "",
  purpose: "",
  expectedAttendees: "",
}

function validateField(name, value, allValues) {
  switch (name) {
    case "resourceId":
      return value.trim() ? "" : "Resource ID is required"
    case "resourceName":
      return value.trim() ? "" : "Resource name is required"
    case "bookingDate":
      if (!value) return "Booking date is required"
      if (value < getToday()) return "Booking date cannot be in the past"
      return ""
    case "startTime":
      return value ? "" : "Start time is required"
    case "endTime":
      if (!value) return "End time is required"
      if (allValues.startTime && value <= allValues.startTime)
        return "End time must be after start time"
      return ""
    case "purpose":
      if (!value.trim()) return "Purpose is required"
      if (value.trim().length < 5) return "Purpose must be at least 5 characters"
      if (value.trim().length > 200) return "Purpose cannot exceed 200 characters"
      return ""
    case "expectedAttendees":
      return Number(value) >= 1 ? "" : "At least 1 attendee is required"
    default:
      return ""
  }
}

function validateAll(formData) {
  return Object.keys(emptyErrors).reduce((acc, field) => {
    acc[field] = validateField(field, formData[field] ?? "", formData)
    return acc
  }, {})
}

export default function BookingForm({ onSubmit, loading, submitError = "" }) {
  const [formData, setFormData] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState(emptyErrors)
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = {
      ...formData,
      [name]: name === "expectedAttendees" ? Number(value) : value,
    }
    setFormData(updated)

    if (touched[name]) {
      const newErrors = { ...fieldErrors, [name]: validateField(name, value, updated) }
      // also re-validate endTime when startTime changes
      if (name === "startTime") {
        newErrors.endTime = validateField("endTime", updated.endTime, updated)
      }
      setFieldErrors(newErrors)
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, formData),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Touch all fields so errors show
    const allTouched = Object.keys(emptyErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)

    const errors = validateAll(formData)
    setFieldErrors(errors)

    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors) return

    const success = await onSubmit(formData)
    if (success) {
      setFormData(initialForm)
      setFieldErrors(emptyErrors)
      setTouched({})
    }
  }

  const inputCls = (field) =>
    [
      "rounded-2xl border px-4 py-3 text-sm outline-none transition w-full",
      fieldErrors[field]
        ? "border-[#E24B4A] bg-[#fff8f8] focus:border-[#E24B4A]"
        : "border-gray-200 focus:border-[#1D9E75]",
    ].join(" ")

  const purposeLen = formData.purpose.trim().length

  return (
    <form
      className="grid gap-5 rounded-[30px] border border-gray-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900">Create booking request</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the resource details and schedule. Requests go to{" "}
          <span className="font-medium text-gray-700">Pending</span> status until reviewed by admin.
        </p>
      </div>

      {/* API conflict / server error */}
      {submitError && (
        <div className="md:col-span-2 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] px-4 py-3">
          <p className="text-sm font-semibold text-[#A32D2D]">Booking failed</p>
          <p className="mt-0.5 text-sm text-[#A32D2D]">{submitError}</p>
        </div>
      )}

      {/* Resource ID */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Resource ID <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="text"
          name="resourceId"
          value={formData.resourceId}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. lab101"
          className={inputCls("resourceId")}
        />
        {fieldErrors.resourceId && (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.resourceId}</p>
        )}
      </div>

      {/* Resource Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Resource Name <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="text"
          name="resourceName"
          value={formData.resourceName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Computer Lab 101"
          className={inputCls("resourceName")}
        />
        {fieldErrors.resourceName && (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.resourceName}</p>
        )}
      </div>

      {/* Resource Type */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Resource Type</label>
        <select
          name="resourceType"
          value={formData.resourceType}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75] w-full"
        >
          <option value="LAB">Lab</option>
          <option value="ROOM">Room</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
      </div>

      {/* Booking Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Booking Date <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="date"
          name="bookingDate"
          min={getToday()}
          value={formData.bookingDate}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls("bookingDate")}
        />
        {fieldErrors.bookingDate && (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.bookingDate}</p>
        )}
      </div>

      {/* Start Time */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Start Time <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls("startTime")}
        />
        {fieldErrors.startTime && (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.startTime}</p>
        )}
      </div>

      {/* End Time */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          End Time <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls("endTime")}
        />
        {fieldErrors.endTime ? (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.endTime}</p>
        ) : (
          formData.startTime && formData.endTime && (
            <p className="text-xs text-[#1D9E75]">
              {(() => {
                const [sh, sm] = formData.startTime.split(":").map(Number)
                const [eh, em] = formData.endTime.split(":").map(Number)
                const diff = eh * 60 + em - (sh * 60 + sm)
                if (diff <= 0) return null
                const h = Math.floor(diff / 60)
                const m = diff % 60
                return `Duration: ${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim()
              })()}
            </p>
          )
        )}
      </div>

      {/* Purpose */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium text-gray-700">
          Purpose <span className="text-[#E24B4A]">*</span>
        </label>
        <textarea
          name="purpose"
          rows="3"
          value={formData.purpose}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Describe the reason for this booking (5–200 characters)"
          className={`resize-none ${inputCls("purpose")}`}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#E24B4A]">{fieldErrors.purpose}</p>
          <p className={`text-xs ${purposeLen > 200 ? "text-[#E24B4A]" : "text-gray-400"}`}>
            {purposeLen}/200
          </p>
        </div>
      </div>

      {/* Expected Attendees */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Expected Attendees <span className="text-[#E24B4A]">*</span>
        </label>
        <input
          type="number"
          name="expectedAttendees"
          min="1"
          value={formData.expectedAttendees}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputCls("expectedAttendees")}
        />
        {fieldErrors.expectedAttendees && (
          <p className="text-xs text-[#E24B4A]">{fieldErrors.expectedAttendees}</p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-end md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#0F6E56] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#085041] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit booking request"}
        </button>
      </div>
    </form>
  )
}
