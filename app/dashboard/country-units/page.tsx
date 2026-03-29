"use client"

import { useState, useEffect } from "react"
import { getCountryUnits, createCountryUnit, updateCountryUnit, deleteCountryUnit, CountryUnit } from "@/lib/api-country-unit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, Flag } from "lucide-react"
import { toast } from "sonner"
import { CountryUnitDialog } from "./components/country-unit-dialog"

export default function CountryUnitPage() {
  const [countryUnits, setCountryUnits] = useState<CountryUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [countryUnitToEdit, setCountryUnitToEdit] = useState<CountryUnit | null>(null)

  const fetchCountryUnits = async () => {
    try {
      setLoading(true)
      const data = await getCountryUnits()
      setCountryUnits(data)
    } catch (err) {
      toast.error("Failed to fetch country units")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountryUnits()
  }, [])

  const handleCreate = () => {
    setCountryUnitToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (countryUnit: CountryUnit) => {
    setCountryUnitToEdit(countryUnit)
    setIsDialogOpen(true)
  }

  const handleDelete = async (countryUnit: CountryUnit) => {
    if (!confirm(`Are you sure you want to delete country unit "${countryUnit.name}"?`)) return
    
    try {
      await deleteCountryUnit(countryUnit.id)
      toast.success("Country unit deleted successfully")
      fetchCountryUnits()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete country unit")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (countryUnitToEdit) {
        await updateCountryUnit(countryUnitToEdit.id, data)
        toast.success("Country unit updated successfully")
      } else {
        await createCountryUnit(data)
        toast.success("Country unit created successfully")
      }
      fetchCountryUnits()
    } catch (err: any) {
      toast.error(err.message || "Failed to save country unit")
      throw err 
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Country Units</h1>
          <p className="text-muted-foreground">Manage country units defined within market areas.</p>
        </div>
        <Button className="bg-brand hover:opacity-90 transition-all shadow-md active:scale-95" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Country Unit
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
            <Flag className="h-5 w-5 text-brand" /> Country Unit Master
          </CardTitle>
          <CardDescription>View and manage all active country units globally.</CardDescription>
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
                    <TableHead className="w-[120px]">CU Code</TableHead>
                    <TableHead>CU Name</TableHead>
                    <TableHead>Market Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-muted-foreground flex items-center justify-center">
                        No country units found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    countryUnits.map((cu) => (
                      <TableRow key={cu.id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="font-mono text-xs font-semibold text-brand">
                          <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">{cu.code}</span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{cu.name}</TableCell>
                        <TableCell className="text-slate-600">
                          {cu.marketArea ? `${cu.marketArea.name} (${cu.marketArea.code})` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={cu.isActive ? "default" : "secondary"}
                            className={cu.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"}
                          >
                            {cu.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-400 text-xs">
                          {new Date(cu.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                              onClick={() => handleEdit(cu)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
                              onClick={() => handleDelete(cu)}
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

      <CountryUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        countryUnitToEdit={countryUnitToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
