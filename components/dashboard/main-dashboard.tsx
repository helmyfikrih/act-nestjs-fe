import Link from "next/link"
import { FolderKanban, Users, ClipboardList } from "lucide-react"
import { WelcomeCard } from "@/components/dashboard/welcome-card"

export function MainDashboard() {
  return (
    <div className="space-y-5">
      <WelcomeCard />

      <div className="grid gap-5 md:grid-cols-3">
        <Link href="/projects" className="group rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-brand transition-all">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <FolderKanban className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">My Projects</h3>
              <p className="text-sm text-muted-foreground">View and manage projects</p>
            </div>
          </div>
        </Link>

        <Link href="/users" className="group rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border hover:ring-brand transition-all">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Users className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">Team Members</h3>
              <p className="text-sm text-muted-foreground">Manage user access</p>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-4">
            {/* Right Side (Illustration Placeholder) */}
            <div className="relative lg:w-2/5 flex items-center justify-center">
                <div className="w-full h-48 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 border-dashed">
                    <span className="text-white/40 text-sm font-medium">ACT Illustration</span>
                </div>
            </div>
            <div>
              <h3 className="font-semibold">Activities</h3>
              <p className="text-sm text-muted-foreground">Pending tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-10 shadow-sm ring-1 ring-border text-center space-y-3">
        <h2 className="text-xl font-semibold">Ready to start?</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Select a project from the sidebar or click the button below to see your current assignments and activities.
        </p>
        <div className="pt-2">
            <Link href="/projects">
              <button className="bg-brand text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity">
                Go to Projects
              </button>
            </Link>
        </div>
      </div>
    </div>
  )
}

