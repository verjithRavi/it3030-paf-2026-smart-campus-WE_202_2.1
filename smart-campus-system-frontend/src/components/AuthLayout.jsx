export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between bg-[#0F6E56] p-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20">
              <div className="h-4 w-4 rounded-md bg-white" />
            </div>
            <span className="text-sm font-medium text-white">Smart Campus</span>
          </div>

          <div className="mt-16 max-w-md">
            <h1 className="text-2xl font-medium leading-snug text-white">
              Your campus, all in one place.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Bookings, incidents, approvals — managed securely with role-based
              access and Google OAuth.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/85">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span>Secure JWT + Google OAuth2 authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/85">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span>Role-based access control and approval workflow</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/85">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span>Real-time notifications and admin management</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">Smart Campus System — SLIIT IT3030</p>
      </aside>

      <main className="flex flex-col justify-center bg-white p-8 md:p-12">
        <div className="mx-auto w-full max-w-sm px-6">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h2 className="text-2xl font-medium text-gray-900">{title}</h2>}
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-gray-500">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
