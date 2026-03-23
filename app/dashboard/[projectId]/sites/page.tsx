"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, Edit2, FileCog, Loader2, Plus, Trash2, Waypoints } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  createSite,
  deleteSite,
  getSites,
  Site,
  updateSite,
  CreateSiteDto,
  UpdateSiteDto,
} from "@/lib/api-site-profile"
import { SiteDialog } from "./components/site-dialog"

export default function SitesPage() {
  const params = useParams()
  const projectId = useMemo(() => String(params?.projectId || ""), [params])

  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null)

  const fetchSites = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const response = await getSites(projectId)
      setSites(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load sites")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [projectId])

  const handleSave = async (data: CreateSiteDto | UpdateSiteDto) => {
    try {
      if (siteToEdit) {
        await updateSite(projectId, siteToEdit.id, data)
        toast.success("Site updated")
      } else {
        await createSite(projectId, data as CreateSiteDto)
        toast.success("Site created")
      }
      await fetchSites()
    } catch (error: any) {
      toast.error(error.message || "Failed to save site")
      throw error
    }
  }

  const handleDelete = async (site: Site) => {
    if (!confirm(`Delete site \"${site.name}\"?`)) return

    try {
      await deleteSite(projectId, site.id)
      toast.success("Site deleted")
      await fetchSites()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete site")
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Manage all site masters and fill their profile data.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/${projectId}/sites/config`}>
              <FileCog className="h-4 w-4 mr-2" /> Configure Profile Fields
            </Link>
          </Button>
          <Button
            className="bg-brand text-white"
            onClick={() => {
              setSiteToEdit(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Site
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Waypoints className="h-5 w-5 text-brand" /> Site List
          </CardTitle>
          <CardDescription>Each site shares project template but has its own profile values.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No sites found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell className="font-medium">{site.code}</TableCell>
                        <TableCell>{site.name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              site.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {site.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600"
                            onClick={() => {
                              setSiteToEdit(site)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(site)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <Button asChild size="sm" className="h-8 bg-brand hover:bg-brand/90 ml-2">
                            <Link href={`/dashboard/${projectId}/sites/${site.id}`}>
                              Detail <ArrowRight className="h-4 w-4 ml-1" />
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

      <SiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        siteToEdit={siteToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
