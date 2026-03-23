"use client"

import { useState, useEffect } from "react"
import { getProjects, createProject, updateProject, deleteProject, Project } from "@/lib/api-project"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, FolderKanban, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { ProjectDialog } from "./components/project-dialog"
import Link from "next/link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      toast.error("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCreate = () => {
    setProjectToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (project: Project) => {
    setProjectToEdit(project)
    setIsDialogOpen(true)
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return
    
    try {
      await deleteProject(project.id)
      toast.success("Project deleted successfully")
      fetchProjects()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, data)
        toast.success("Project updated successfully")
      } else {
        await createProject(data)
        toast.success("Project created successfully")
      }
      fetchProjects()
    } catch (err: any) {
      toast.error(err.message || "Failed to save project")
      throw err // Re-throw to keep the dialog open/loading state
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">Manage organization projects and access assignments.</p>
        </div>
        <Button className="bg-brand hover:opacity-90" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand" /> Organization Projects
          </CardTitle>
          <CardDescription>View all available projects. Click on a project to manage its users, menus, and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No projects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.code}</TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleEdit(project)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(project)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button asChild variant="default" size="sm" className="h-8 bg-brand hover:bg-brand/90 ml-2">
                            <Link href={`/dashboard/projects/details?id=${project.id}`}>
                              Details <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectToEdit={projectToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
