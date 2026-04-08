export default function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#9CA3AF" strokeWidth="1.3" />
          <path
            d="M10 7v3M10 13h.01"
            stroke="#9CA3AF"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
