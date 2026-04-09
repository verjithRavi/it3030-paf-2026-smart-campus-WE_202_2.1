import AdminSidebar from './AdminSidebar'
import Navbar from './Navbar'

function AppShell({ user, children, contentClassName = 'w-full max-w-[1320px] px-6 py-6' }) {
  return (
    <div className="flex min-h-screen bg-transparent">
      {user?.role === 'ADMIN' && <AdminSidebar />}
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(15,110,86,0.12),transparent_58%)]" />
          <div className={`mx-auto ${contentClassName}`}>{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
