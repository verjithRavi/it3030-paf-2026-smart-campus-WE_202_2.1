import { useNavigate } from 'react-router-dom'

const navigationItems = [
  { key: 'students', label: 'Students', path: '/users/students' },
  { key: 'lecturers', label: 'Lecturers', path: '/users/lecturers' },
  { key: 'technicians', label: 'Technicians', path: '/users/technicians' },
]

function AdminSidebar({ user, sidebarOpen, onClose, activeItem }) {
  const navigate = useNavigate()

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="absolute inset-0 z-20 bg-slate-950/18"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-[320px] border-r border-slate-200 bg-[#f6f8fb] shadow-[0_24px_60px_rgba(15,23,42,0.14)] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f6e73,#8af7c1)] text-sm font-bold uppercase text-white shadow-[0_10px_24px_rgba(15,94,99,0.18)]">
                {user?.name?.slice(0, 2) || 'SC'}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Smart Campus System
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Close navigation menu"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 stroke-current"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="mt-6 space-y-4">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onClose()
                  navigate(item.path)
                }}
                className={`flex w-full items-center rounded-2xl border px-5 py-4 text-left text-[1.05rem] font-semibold transition ${
                  activeItem === item.key
                    ? 'border-[#0f6e73]/25 bg-[#d8ebee] text-[#0b5e63]'
                    : 'border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}

            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/pending-approvals')
                }}
                className={`flex w-full items-center rounded-2xl border px-5 py-4 text-left text-[1.05rem] font-semibold transition ${
                  activeItem === 'pending'
                    ? 'border-amber-300 bg-amber-100 text-amber-900'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Pending Approval</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose()
                navigate('/dashboard')
              }}
              className={`flex w-full items-center rounded-2xl border px-5 py-4 text-left text-[1.05rem] font-semibold transition ${
                activeItem === 'dashboard'
                  ? 'border-[#0f6e73]/25 bg-[#d8ebee] text-[#0b5e63]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Dashboard</span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
