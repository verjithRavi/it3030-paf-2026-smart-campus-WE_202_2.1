import { Link } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  return (
    <header className="rounded-[28px] border border-white/70 bg-white/90 px-6 py-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[linear-gradient(135deg,#0f6e73,#8af7c1)] text-sm font-bold uppercase text-white">
            {user?.name?.slice(0, 2) || 'SC'}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Smart Campus Auth
            </p>
            <h1 className="font-serif text-3xl leading-none text-slate-900">
              Operations Dashboard
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Overview
          </Link>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {user?.role || 'USER'}
          </div>
          <button
            onClick={onLogout}
            className="rounded-full bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(15,94,99,0.24)] transition hover:brightness-105"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
