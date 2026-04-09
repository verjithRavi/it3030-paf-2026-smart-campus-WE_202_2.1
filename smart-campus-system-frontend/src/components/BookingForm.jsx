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

export default function BookingForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialForm)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "expectedAttendees" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')

    if (!formData.resourceId.trim()) {
      setError('Resource ID is required')
      return
    }

    if (!formData.resourceName.trim()) {
      setError('Resource name is required')
      return
    }

    if (!formData.bookingDate) {
      setError('Booking date is required')
      return
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required')
      return
    }

    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time')
      return
    }

    if (!formData.purpose.trim() || formData.purpose.trim().length < 5) {
      setError('Purpose must be at least 5 characters')
      return
    }

    if (formData.expectedAttendees < 1) {
      setError('Expected attendees must be at least 1')
      return
    }

    const success = await onSubmit(formData);

    if (success) {
      setFormData(initialForm)
    }
  }

  return (
    <form
      className="grid gap-5 rounded-[30px] border border-gray-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:grid-cols-2"
      onSubmit={handleSubmit}
    >
      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900">Create booking request</h2>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the resource details and schedule. We&apos;ll send it for review immediately.
        </p>
      </div>

      {error && (
        <p className="md:col-span-2 rounded-2xl border border-[#E24B4A] bg-[#FCEBEB] px-4 py-3 text-sm text-[#A32D2D]">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Resource ID</label>
        <input
          type="text"
          name="resourceId"
          value={formData.resourceId}
          onChange={handleChange}
          placeholder="e.g. lab101"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Resource Name</label>
        <input
          type="text"
          name="resourceName"
          value={formData.resourceName}
          onChange={handleChange}
          placeholder="e.g. Computer Lab 101"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Resource Type</label>
        <select
          name="resourceType"
          value={formData.resourceType}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        >
          <option value="LAB">LAB</option>
          <option value="ROOM">ROOM</option>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Booking Date</label>
        <input
          type="date"
          name="bookingDate"
          min={getToday()}
          value={formData.bookingDate}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Start Time</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">End Time</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-sm font-medium text-gray-700">Purpose</label>
        <textarea
          name="purpose"
          rows="4"
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Enter the reason for the booking"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Expected Attendees</label>
        <input
          type="number"
          name="expectedAttendees"
          min="1"
          value={formData.expectedAttendees}
          onChange={handleChange}
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#1D9E75]"
        />
      </div>

      <div className="flex items-end md:col-span-2">
        <button
          className="rounded-full bg-[#0F6E56] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#085041] disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit booking'}
        </button>
      </div>
    </form>
  )
}
