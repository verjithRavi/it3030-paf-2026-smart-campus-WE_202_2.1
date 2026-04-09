export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0F6E56]">
          Smart Campus
        </p>
        <h1 className="text-[2.2rem] font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
