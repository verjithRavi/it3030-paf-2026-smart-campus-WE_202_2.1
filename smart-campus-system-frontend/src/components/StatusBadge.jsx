const statusStyles = {
  PENDING:   'bg-[#fef3c7] text-[#92400e]',
  APPROVED:  'bg-[#dcfce7] text-[#166534]',
  REJECTED:  'bg-[#fee2e2] text-[#991b1b]',
  CANCELLED: 'bg-[#e2e8f0] text-[#334155]',
}

const statusLabels = {
  PENDING:   'Pending',
  APPROVED:  'Approved',
  REJECTED:  'Rejected',
  CANCELLED: 'Cancelled',
}

export default function StatusBadge({ status }) {
  const cls = statusStyles[status] ?? 'bg-gray-100 text-gray-600'
  const label = statusLabels[status] ?? status

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap ${cls}`}>
      {label}
    </span>
  )
}
