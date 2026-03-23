"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserRound,
  LogOut,
  ChevronFirst,
  ChevronLast,
  ShieldAlert,
  MenuSquare,
  Settings,
  Circle,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { logout } from "@/lib/auth"
import { getMyProjectMenus } from "@/lib/projects"
import { Menu as ProjectMenu } from "@/lib/types"

// Icon mapping helper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  Users,
  UserRound,
  ShieldAlert,
  MenuSquare,
  Settings,
  Circle,
  HelpCircle,
}

const getIcon = (name?: string) => {
  if (!name) return Circle
  return iconMap[name] || Circle
}

const defaultItems = [
  { href: "/dashboard", label: "All Projects", icon: FolderKanban },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const params = useParams()
  const projectId = params?.projectId as string | undefined

  const [open, setOpen] = useState(true)
  const [projectMenus, setProjectMenus] = useState<ProjectMenu[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved) setOpen(saved === "1")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0")
  }, [open])

  useEffect(() => {
    async function fetchMenus() {
      if (!projectId) {
        setProjectMenus([])
        return
      }
      setLoading(true)
      try {
        const menus = await getMyProjectMenus(projectId)
        setProjectMenus(menus)
      } catch (err) {
        console.error("Failed to fetch project menus:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMenus()
  }, [projectId])

  return (
    <aside
      className={`bg-sidebar-gradient text-white transition-[width] duration-300 rounded-l-3xl flex flex-col h-full  ${
        open ? "w-52" : "w-20"
      }`}
      aria-label="Primary navigation"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-white/20 grid place-items-center font-bold">ACT</div>
            <span className={`${open ? "block" : "hidden"} text-sm font-semibold`}>ACT App</span>
          </Link>
        </div>
        <button
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-white/20 p-1.5 hover:bg-white/30"
        >
          {open ? <ChevronFirst className="size-5" /> : <ChevronLast className="size-5" />}
        </button>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-3">
          {/* Global Items */}
          {defaultItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                    active ? "bg-white text-brand" : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className={`size-5 ${active ? "text-brand" : "text-white"}`} />
                  <span className={`${open ? "block" : "hidden"} text-sm whitespace-nowrap`}>{label}</span>
                </Link>
              </li>
            )
          })}

          <div className="my-2 border-t border-white/10 mx-2" />

          {/* Project Specific Items */}
          {loading ? (
            <li className="px-3 py-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            </li>
          ) : projectId && projectMenus.length > 0 ? (
            <>
               {projectMenus.map((menu) => {
                const Icon = getIcon(menu.code)
                const menuPath = `/${menu.code.toLowerCase().replace(/_/g, '-')}`
                const fullPath = `/dashboard/${projectId}${menuPath}`
                const active = pathname === fullPath || (pathname?.startsWith(fullPath) && menuPath !== "/")
                const hasChildren = menu.children && menu.children.length > 0

                return (
                  <li key={menu.id} className="flex flex-col gap-1">
                    <Link
                      href={fullPath}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        active ? "bg-white text-brand" : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <Icon className={`size-5 ${active ? "text-brand" : "text-white"}`} />
                      <span className={`${open ? "block" : "hidden"} text-sm whitespace-nowrap`}>{menu.name}</span>
                    </Link>

                    {/* Children - only show if sidebar is open */}
                    {open && hasChildren && (
                      <ul className="flex flex-col gap-1 ml-6 mt-1 border-l border-white/10 pl-2">
                        {menu.children?.map((child) => {
                          const childIcon = getIcon(child.code)
                          const childPath = `/${child.code.toLowerCase().replace(/_/g, '-')}`
                          const fullChildPath = `/dashboard/${projectId}${childPath}`
                          const childActive = pathname === fullChildPath
                          return (
                            <li key={child.id}>
                              <Link
                                href={fullChildPath}
                                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                                  childActive ? "text-white font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <Circle className={`size-2 ${childActive ? "fill-white" : ""}`} />
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </>
          ) : projectId ? (


             <li className="px-3 py-4 text-xs text-white/40 italic text-center">
               {open ? "No menus found for this project" : ""}
             </li>
          ) : null}
        </ul>
      </nav>

      <div className="px-3 pb-5 pt-2 space-y-2">
        <button
          onClick={() => logout()}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:bg-white/10 transition-colors"
        >
          <LogOut className="size-5 text-white" />
          <span className={`${open ? "block" : "hidden"} text-sm`}>Logout</span>
        </button>
        <div className={`rounded-2xl bg-white/10 p-3`}>
          <p className="text-xs leading-5">
            {open ? (projectId ? `Project active` : "Site Activity") : "ACT"}
          </p>
        </div>
      </div>
    </aside>
  )
}


