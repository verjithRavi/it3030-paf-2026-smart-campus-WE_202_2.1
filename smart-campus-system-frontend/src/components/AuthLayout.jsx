export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.08fr_0.92fr]">
      <aside className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between bg-[linear-gradient(155deg,#092e27_0%,#0f6e56_54%,#14956d_100%)] p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,189,74,0.24),transparent_26%)]" />
        <div className="absolute -left-20 top-28 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#f4bd4a]/20 blur-3xl" />
        <div>
          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20">
              <div className="h-4 w-4 rounded-md bg-white" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-white/90">Smart Campus</span>
          </div>

          <div className="relative mt-16 max-w-lg">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              Campus operations hub
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] text-white">
              Move from sign-in to approvals, bookings, and updates in one calm workspace.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
              A cleaner command center for students, lecturers, technicians, and admins.
              Approvals, booking requests, and notifications all stay visible without the clutter.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[24px] border border-white/14 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-sm font-semibold text-white">Secure sign-in</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  JWT authentication and Google OAuth2 access in a single flow.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/14 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-sm font-semibold text-white">Admin visibility</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Review access requests and booking approvals from one system.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/14 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-sm font-semibold text-white">Clear campus actions</p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Booking workflows, notifications, and profile setup feel fast and guided.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs uppercase tracking-[0.18em] text-white/40">Smart Campus System</p>
      </aside>

      <main className="relative flex flex-col justify-center px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-md">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h2 className="text-3xl font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="mt-3 text-sm leading-7 text-gray-500">{subtitle}</p>}
            </div>
          )}

          <div className="glass-panel rounded-[32px] px-6 py-7 md:px-8 md:py-9">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
