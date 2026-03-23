"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProject, Project } from "@/lib/api-project"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Settings, Users, MenuSquare, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { MenusTab } from "./components/menus-tab"
import { UsersTab } from "./components/users-tab"
import { PermissionsTab } from "./components/permissions-tab"


function ProjectDetailsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const projectId = searchParams.get("id") as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true)
        const data = await getProject(projectId)
        setProject(data)
      } catch (err) {
        toast.error("Failed to fetch project details")
        router.push("/dashboard/projects")
      } finally {
        setLoading(false)
      }
    }
    if (projectId) {
      fetchDetails()
    }
  }, [projectId, router])

  if (loading || !project) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-mono text-xs uppercase bg-muted px-2 py-0.5 rounded">{project.code}</span>
            {project.description || "Project configuration and assignments."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="menus" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
          <TabsTrigger value="menus" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <MenuSquare className="h-4 w-4 mr-2" /> Menus
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-brand data-[state=active]:text-white">
            <ShieldAlert className="h-4 w-4 mr-2" /> Permissions
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 border rounded-2xl bg-card shadow-sm overflow-hidden">
          <TabsContent value="menus" className="m-0 border-0 p-6 focus-visible:ring-0 focus-visible:outline-none">
            <MenusTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="users" className="m-0 border-0 p-6 focus-visible:ring-0 focus-visible:outline-none">
            <UsersTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="permissions" className="m-0 border-0 p-6 focus-visible:ring-0 focus-visible:outline-none">
            <PermissionsTab projectId={projectId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default function ProjectDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    }>
      <ProjectDetailsContent />
    </Suspense>
  )
}

