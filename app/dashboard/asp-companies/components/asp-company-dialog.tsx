"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateAspCompanyDto, AspCompany, UpdateAspCompanyDto } from "@/lib/api-asp-company"
import { CountryUnit, getCountryUnits } from "@/lib/api-country-unit"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface AspCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aspCompanyToEdit?: AspCompany | null
  onSave: (data: CreateAspCompanyDto | UpdateAspCompanyDto) => Promise<void>
}

export function AspCompanyDialog({ open, onOpenChange, aspCompanyToEdit, onSave }: AspCompanyDialogProps) {
  const [loading, setLoading] = useState(false)
  const [countryUnits, setCountryUnits] = useState<CountryUnit[]>([])
  
  const [formData, setFormData] = useState<CreateAspCompanyDto>({
    code: "",
    name: "",
    countryUnitId: "",
    isActive: true,
  })

  useEffect(() => {
    const fetchCountryUnits = async () => {
      try {
        const data = await getCountryUnits()
        setCountryUnits(data)
      } catch (err) {
        toast.error("Failed to load country units")
      }
    }
    if (open) {
      fetchCountryUnits()
    }
  }, [open])

  useEffect(() => {
    if (aspCompanyToEdit) {
      setFormData({
        code: aspCompanyToEdit.code,
        name: aspCompanyToEdit.name,
        countryUnitId: aspCompanyToEdit.countryUnitId,
        isActive: aspCompanyToEdit.isActive,
      })
    } else {
      setFormData({
        code: "",
        name: "",
        countryUnitId: "",
        isActive: true,
      })
    }
  }, [aspCompanyToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.countryUnitId) {
      toast.error("Please select a Country Unit")
      return
    }
    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{aspCompanyToEdit ? "Edit ASP Company" : "Add New ASP Company"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="countryUnit">Country Unit *</Label>
              <Select 
                value={formData.countryUnitId} 
                onValueChange={(value) => setFormData({ ...formData, countryUnitId: value })}
              >
                <SelectTrigger id="countryUnit">
                  <SelectValue placeholder="Select a country unit" />
                </SelectTrigger>
                <SelectContent>
                  {countryUnits.map((cu) => (
                    <SelectItem key={cu.id} value={cu.id}>
                      {cu.name} ({cu.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">ASP Company Code *</Label>
              <Input
                id="code"
                placeholder="Max 10 chars"
                maxLength={10}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">ASP Company Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Services"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id="isActive"
                checked={Boolean(formData.isActive)}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: Boolean(checked) })}
              />
              <div className="grid gap-1">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">ASP Company is available for selection.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {aspCompanyToEdit ? "Save Changes" : "Create ASP Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
