export default function StatCard({ label, value, sub, valueClass = '' }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight text-gray-900 ${valueClass}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
