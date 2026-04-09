import { STATUS_BADGE } from '../../constants/theme';

export default function Badge({ status, label }) {
  const cls =
    STATUS_BADGE[status] || 'bg-gray-100 text-gray-600 border border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {label || status}
    </span>
  );
}
