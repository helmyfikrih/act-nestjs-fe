import { getTokenPayload } from "@/lib/auth"

export function WelcomeCard() {
  const payload = getTokenPayload()
  const userName = payload?.name || "User"

  return (
    <section className="relative overflow-hidden rounded-3xl bg-sidebar-gradient p-6 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left Side (Text) */}
        <div className="max-w-xl md:w-3/5">
          <h1 className="text-balance text-3xl font-semibold">Welcome back, {userName}</h1>
          <p className="mt-2 text-sm leading-6 text-white/90">
            Manage your site activities, projects, and team members from one central dashboard.
          </p>
        </div>

        {/* Right Side (Illustration Placeholder) */}
        <div className="relative lg:w-2/5 flex items-center justify-center">
            <div className="w-full h-48 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 border-dashed">
                <span className="text-white/40 text-sm font-medium uppercase tracking-widest">ACT Platform</span>
            </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
    </section>
  )
}
