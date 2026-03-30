function AuthLayout({ title, subtitle, children, sideTitle, sideText }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#e9edf3] px-4 py-6 sm:px-6 lg:px-10">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1400px] items-center justify-center overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#0c666b,#0a5158)] shadow-[0_35px_90px_rgba(15,23,42,0.14)]">
        <div className="absolute -left-20 top-[-100px] h-[280px] w-[280px] rounded-full bg-white/12 blur-3xl" />
        <div className="absolute bottom-[-90px] right-[-80px] h-[320px] w-[320px] rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,74,79,0.18),rgba(5,74,79,0.48))]" />

        <div className="relative z-10 grid w-full max-w-[1180px] gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 xl:px-18">
          <section className="hidden self-stretch rounded-[30px] border border-white/10 bg-white/8 p-8 text-white backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">
                Smart Campus Auth
              </div>

              <h1 className="mt-10 max-w-lg font-serif text-6xl leading-[0.96] tracking-[-0.05em]">
                {sideTitle}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/76">
                {sideText}
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] bg-white/95 p-6 text-slate-900 shadow-[0_22px_45px_rgba(15,23,42,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Access Stack
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-slate-50 px-3 py-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Auth
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">JWT</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Social
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Google
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Roles
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">RBAC</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-white/10 px-6 py-5 text-sm leading-6 text-white/75">
                Securely sign in to manage campus services, protected dashboards,
                admin controls, and Google-based access in one place.
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-[470px] rounded-[30px] bg-white/96 p-7 shadow-[0_30px_70px_rgba(15,23,42,0.15)] backdrop-blur sm:p-8">
              <div className="mb-7 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Access Hub
                  </p>
                  <h2 className="mt-4 font-serif text-[2.35rem] leading-none text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    {subtitle}
                  </p>
                </div>

                <div className="h-14 w-14 rounded-full bg-[linear-gradient(135deg,#0f6e73,#89f6bf)] shadow-[0_14px_26px_rgba(15,94,99,0.2)]" />
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
