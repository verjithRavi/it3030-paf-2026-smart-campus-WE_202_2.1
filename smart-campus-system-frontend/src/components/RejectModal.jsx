import { useEffect, useState } from 'react'

export default function RejectModal({ open, onClose, onConfirm, loading = false }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setReason('')
      setError('')
    }
  }, [open])

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a rejection reason.')
      return
    }
    onConfirm(reason.trim())
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-[0_32px_80px_rgba(15,23,42,0.20)]">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCEBEB]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6v4M10 14h.01" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="10" r="8" stroke="#E24B4A" strokeWidth="1.6" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E24B4A]">Admin Action</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">Reject Booking</h2>
          <p className="mt-1 text-sm text-gray-500">
            The requester will be notified with the reason you provide.
          </p>
        </div>

        {/* Reason field */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Rejection Reason <span className="text-[#E24B4A]">*</span>
          </label>
          <textarea
            rows="4"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError('') }}
            placeholder="e.g. The resource is under maintenance on this date."
            className={`resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition ${
              error
                ? 'border-[#E24B4A] bg-[#fff8f8] focus:border-[#E24B4A]'
                : 'border-gray-200 focus:border-[#E24B4A]'
            }`}
          />
          {error && <p className="text-xs text-[#E24B4A]">{error}</p>}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-full bg-[#E24B4A] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Rejecting…' : 'Reject Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
