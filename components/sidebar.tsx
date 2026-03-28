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
} from "lucide-react"
import { logout } from "@/lib/auth"

const defaultItems = [
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/menus", label: "Menus", icon: MenuSquare },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldAlert },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-open")
    if (saved) setOpen(saved === "1")
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebar-open", open ? "1" : "0")
  }, [open])

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
            {open ? "Core Management" : "ACT"}
          </p>
        </div>
      </div>
    </aside>
  )
}

