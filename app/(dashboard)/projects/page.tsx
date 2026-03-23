"use client"

import { useEffect, useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FolderKanban, Plus, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface UserProjectRole {
  id: string
  role: { id: string, name: string }
  project: {
    id: string
    code: string
    name: string
    description: string
    isActive: boolean
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<UserProjectRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await apiFetch<UserProjectRole[]>("/projects/my-projects")
        setProjects(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load projects")
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage and track your assigned site activity projects.</p>
        </div>
        <Button className="bg-brand hover:bg-brand/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-20 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="text-muted-foreground text-sm">You haven&apos;t been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((up) => (
            <Card key={up.id} className="overflow-hidden hover:ring-1 hover:ring-brand transition-all cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant={up.project.isActive ? "default" : "secondary"}>
                    {up.project.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{up.project.code}</span>
                </div>
                <CardTitle className="text-lg">{up.project.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs h-8">
                  {up.project.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand">
                      {up.role.name[0]}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{up.role.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-wider">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
