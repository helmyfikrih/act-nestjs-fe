"use client"

import { useState, useEffect } from "react"
import { getMarketAreas, createMarketArea, updateMarketArea, deleteMarketArea, MarketArea } from "@/lib/api-market-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, Globe } from "lucide-react"
import { toast } from "sonner"
import { MarketAreaDialog } from "./components/market-area-dialog"

export default function MarketAreaPage() {
  const [marketAreas, setMarketAreas] = useState<MarketArea[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [marketAreaToEdit, setMarketAreaToEdit] = useState<MarketArea | null>(null)

  const fetchMarketAreas = async () => {
    try {
      setLoading(true)
      const data = await getMarketAreas()
      setMarketAreas(data)
    } catch (err) {
      toast.error("Failed to fetch market areas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketAreas()
  }, [])

  const handleCreate = () => {
    setMarketAreaToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (marketArea: MarketArea) => {
    setMarketAreaToEdit(marketArea)
    setIsDialogOpen(true)
  }

  const handleDelete = async (marketArea: MarketArea) => {
    if (!confirm(`Are you sure you want to delete market area "${marketArea.name}"?`)) return
    
    try {
      await deleteMarketArea(marketArea.id)
      toast.success("Market area deleted successfully")
      fetchMarketAreas()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete market area")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (marketAreaToEdit) {
        await updateMarketArea(marketAreaToEdit.id, data)
        toast.success("Market area updated successfully")
      } else {
        await createMarketArea(data)
        toast.success("Market area created successfully")
      }
      fetchMarketAreas()
    } catch (err: any) {
      toast.error(err.message || "Failed to save market area")
      throw err 
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Market Areas</h1>
          <p className="text-muted-foreground">Manage global market regions and territory definitions.</p>
        </div>
        <Button className="bg-brand hover:opacity-90 transition-all shadow-md active:scale-95" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Market Area
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
            <Globe className="h-5 w-5 text-brand" /> Region Master
          </CardTitle>
          <CardDescription>View and manage all active market regions globally.</CardDescription>
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
                    <TableHead>Market Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketAreas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32 text-muted-foreground flex items-center justify-center">
                        No market areas found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    marketAreas.map((ma) => (
                      <TableRow key={ma.id} className="hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="font-mono text-xs font-semibold text-brand">
                          <span className="px-2 py-1 bg-slate-100 rounded text-slate-700">{ma.code}</span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800">{ma.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={ma.isActive ? "default" : "secondary"}
                            className={ma.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"}
                          >
                            {ma.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-500 max-w-[200px] truncate">
                          {ma.description || "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-400 text-xs">
                          {new Date(ma.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
                              onClick={() => handleEdit(ma)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
                              onClick={() => handleDelete(ma)}
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

      <MarketAreaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        marketAreaToEdit={marketAreaToEdit}
        onSave={handleSave}
      />
    </div>
  )
}
