"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getMyProjects } from "@/lib/projects"
import { UserProjectRole } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FolderKanban, Loader2, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<UserProjectRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getMyProjects()
        setProjects(data)
      } catch (err) {
        setError("Failed to load projects. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Select a Project</h1>
        <p className="text-muted-foreground text-lg">
          Choose a project to manage and access its specific menus and tools.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <CardTitle>No projects assigned</CardTitle>
            <CardDescription className="max-w-xs mt-2">
              You don&apos;t have any projects assigned to your account yet. Please contact your administrator.
            </CardDescription>
          </Card>
        ) : (
          projects.map((project) => (
            <Card 
              key={project.projectId} 
              className="group hover:shadow-md transition-all cursor-pointer border-border/50 overflow-hidden"
              onClick={() => router.push(`/dashboard/${project.projectId}`)}
            >
              <CardHeader className="bg-muted/30 pb-4">
                <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center mb-3">
                   <FolderKanban className="h-5 w-5 text-brand" />
                </div>
                <CardTitle className="text-xl">{project.projectName}</CardTitle>
                <CardDescription>
                  Role: <span className="font-medium text-foreground">{project.roleName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex justify-between items-center bg-card">
                <span className="text-sm font-medium text-muted-foreground">Enter Project</span>
                <ArrowRight className="h-4 w-4 text-brand transform transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
