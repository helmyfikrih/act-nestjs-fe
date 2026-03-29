"use client"

import { useState, useEffect } from "react"
import { getAspCompanies, createAspCompany, updateAspCompany, deleteAspCompany, AspCompany } from "@/lib/api-asp-company"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"
import { AspCompanyDialog } from "./components/asp-company-dialog"

export default function AspCompanyPage() {
  const [aspCompanies, setAspCompanies] = useState<AspCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [aspCompanyToEdit, setAspCompanyToEdit] = useState<AspCompany | null>(null)

  const fetchAspCompanies = async () => {
    try {
      setLoading(true)
      const data = await getAspCompanies()
      setAspCompanies(data)
    } catch (err) {
      toast.error("Failed to fetch ASP Companies")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAspCompanies()
  }, [])

  const handleCreate = () => {
    setAspCompanyToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (aspCompany: AspCompany) => {
    setAspCompanyToEdit(aspCompany)
    setIsDialogOpen(true)
  }

  const handleDelete = async (aspCompany: AspCompany) => {
    if (!confirm(`Are you sure you want to delete ASP Company "${aspCompany.name}"?`)) return
    
    try {
      await deleteAspCompany(aspCompany.id)
      toast.success("ASP Company deleted successfully")
      fetchAspCompanies()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ASP Company")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (aspCompanyToEdit) {
        await updateAspCompany(aspCompanyToEdit.id, data)
        toast.success("ASP Company updated successfully")
      } else {
        await createAspCompany(data)
        toast.success("ASP Company created successfully")
      }
      fetchAspCompanies()
    } catch (err: any) {
      toast.error(err.message || "Failed to save ASP Company")
      throw err 
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ASP Companies</h1>
          <p className="text-muted-foreground">Manage authorized service provider companies.</p>
        </div>
        <Button className="bg-brand hover:opacity-90 transition-all shadow-md active:scale-95" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add ASP Company
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
            <Building2 className="h-5 w-5 text-brand" /> ASP Company Master
          </CardTitle>
          <CardDescription>View and manage all active ASP companies.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-brand" />
            </div>
          ) : (
            <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[120px]">Code</TableHead>
                    <TableHead>ASP Company Name</TableHead>
                    <TableHead>Country Unit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aspCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-muted-foreground flex items-center justify-center">
                        No ASP companies found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    aspCompanies.map((aspCompany) => (
                      <TableRow key={aspCompany.id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="font-mono text-xs font-semibold text-brand">
                          <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">{aspCompany.code}</span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">
                          {aspCompany.name}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {aspCompany.countryUnit ? aspCompany.countryUnit.name : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={aspCompany.isActive ? "default" : "secondary"}
                            className={aspCompany.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"}
                          >
                            {aspCompany.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-400 text-xs">
                          {new Date(aspCompany.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                              onClick={() => handleEdit(aspCompany)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
                              onClick={() => handleDelete(aspCompany)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <AspCompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        aspCompanyToEdit={aspCompanyToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
