"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Users,
  UserRound,
  LogOut,
  ChevronFirst,
  ChevronLast,
  ShieldAlert,
  MenuSquare,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Globe,
} from "lucide-react"
import { logout } from "@/lib/auth"
import { useFrontendMode } from "@/hooks/use-frontend-mode"

interface MenuItem {
  href?: string
  label: string
  icon: any
  children?: { href: string; label: string; icon?: any }[]
}

const menuGroups = [
  {
    mode: "default",
    title: "General",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/profile", label: "Profile", icon: UserRound },
    ],
  },
  {
    mode: "root",
    title: "Root Panel",
    items: [
      {
        label: "Master Data",
        icon: ShieldAlert,
        children: [
          { href: "/dashboard/users", label: "Users", icon: Users },
          { href: "/dashboard/menus", label: "Menus", icon: MenuSquare },
          { href: "/dashboard/roles", label: "Roles", icon: ShieldAlert },
          { href: "/dashboard/market-area", label: "Market Area", icon: Globe },
          { href: "/dashboard/country-units", label: "Country Unit", icon: Globe },
        ],
      },
      { href: "/dashboard/profile", label: "Profile", icon: UserRound },
    ],
  },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { mode } = useFrontendMode()
  const [open, setOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "Root Panel": true,
    "Master Data": true,
  })

  const visibleGroups = menuGroups.filter((g) => g.mode === mode)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved) setOpen(saved === "1")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0")
  }, [open])

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  return (
    <aside
      className={`bg-sidebar-gradient text-white transition-[width] duration-300 rounded-l-3xl flex flex-col h-full  ${
        open ? "w-64" : "w-20"
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

      <nav className="mt-2 flex-1 overflow-y-auto px-3 custom-scrollbar">
        {visibleGroups.map((group) => {
          const isGroupExpanded = expandedItems[group.title]
          return (
            <div key={group.title} className="mb-4">
              {open && (
                <button
                  onClick={() => toggleExpand(group.title)}
                  className="w-full flex items-center justify-between px-3 mb-2 group/title"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover/title:text-white/60 transition-colors">
                    {group.title}
                  </p>
                  <div className="transition-transform duration-200">
                    {isGroupExpanded ? (
                      <ChevronDown className="size-3 text-white/30" />
                    ) : (
                      <ChevronRight className="size-3 text-white/30" />
                    )}
                  </div>
                </button>
              )}
              
              <ul className={`flex flex-col gap-1 transition-all duration-300 overflow-hidden ${isGroupExpanded || !open ? "opacity-100 max-h-[1000px]" : "opacity-0 max-h-0"}`}>
                {group.items.map((item) => {
                  const isExpanded = expandedItems[item.label]
                  const hasChildren = item.children && item.children.length > 0
                  const isActive = item.href ? pathname === item.href : item.children?.some(child => pathname === child.href)

                  return (
                    <li key={item.label}>
                      {hasChildren ? (
                        <div>
                          <button
                            onClick={() => toggleExpand(item.label)}
                            className={`w-full group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors ${
                              isActive && !isExpanded ? "bg-white/10" : "text-white/90 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="size-5 text-white" />
                              <span className={`${open ? "block" : "hidden"} text-sm whitespace-nowrap font-medium`}>
                                {item.label}
                              </span>
                            </div>
                            {open && (
                              <div className="transition-transform duration-200">
                                {isExpanded ? (
                                  <ChevronDown className="size-4 text-white/50" />
                                ) : (
                                  <ChevronRight className="size-4 text-white/50" />
                                )}
                              </div>
                            )}
                          </button>

                          {open && isExpanded && (
                            <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-2">
                              {item.children?.map((child) => {
                                const childActive = pathname === child.href
                                const ChildIcon = child.icon || LayoutDashboard
                                return (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                                        childActive ? "bg-white text-brand shadow-sm" : "text-white/80 hover:bg-white/10"
                                      }`}
                                    >
                                      <ChildIcon className={`size-4 ${childActive ? "text-brand" : "text-white/70"}`} />
                                      <span className="text-xs font-medium">{child.label}</span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href!}
                          className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                            isActive ? "bg-white text-brand shadow-sm" : "text-white/90 hover:bg-white/10"
                          }`}
                        >
                          <item.icon className={`size-5 ${isActive ? "text-brand" : "text-white"}`} />
                          <span className={`${open ? "block" : "hidden"} text-sm whitespace-nowrap font-medium`}>
                            {item.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
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
            {open ? "Core Management" : "ACT"}
          </p>
        </div>
      </div>
    </aside>
  )
}


