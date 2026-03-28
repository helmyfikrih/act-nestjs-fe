"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShieldAlert, MenuSquare, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const managementItems = [
    {
      title: "User Management",
      description: "Manage system users, their profiles, and account status.",
      href: "/dashboard/users",
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Role Management",
      description: "Define system roles and assign permissions to them.",
      href: "/dashboard/roles",
      icon: ShieldAlert,
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Menu Management",
      description: "Configure system navigation menus and their structure.",
      href: "/dashboard/menus",
      icon: MenuSquare,
      color: "bg-orange-500/10 text-orange-500",
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to ACT Admin</h1>
        <p className="text-muted-foreground text-xl max-w-2xl">
          Use the tools below to manage the core infrastructure of your application.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {managementItems.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="h-full border-border/50 hover:shadow-xl hover:border-brand/40 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold">{item.title}</CardTitle>
                <CardDescription className="text-base mt-2 line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 flex items-center text-brand font-semibold text-sm">
                <span>Manage now</span>
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-2" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
