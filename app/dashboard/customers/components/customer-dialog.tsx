"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateCustomerDto, Customer, UpdateCustomerDto } from "@/lib/api-customer"
import { CountryUnit, getCountryUnits } from "@/lib/api-country-unit"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerToEdit?: Customer | null
  onSave: (data: CreateCustomerDto | UpdateCustomerDto, file?: File) => Promise<void>
}

export function CustomerDialog({ open, onOpenChange, customerToEdit, onSave }: CustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [countryUnits, setCountryUnits] = useState<CountryUnit[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState<CreateCustomerDto>({
    code: "",
    name: "",
    countryUnitId: "",
    logoPath: "",
    countryRegion: "",
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
    if (customerToEdit) {
      setFormData({
        code: customerToEdit.code,
        name: customerToEdit.name,
        countryUnitId: customerToEdit.countryUnitId,
        countryRegion: customerToEdit.countryRegion || "",
        isActive: customerToEdit.isActive,
      })
      setLogoFile(null)
    } else {
      setFormData({
        code: "",
        name: "",
        countryUnitId: "",
        countryRegion: "",
        isActive: true,
      })
      setLogoFile(null)
    }
  }, [customerToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.countryUnitId) {
      toast.error("Please select a Country Unit")
      return
    }
    setLoading(true)
    try {
      await onSave(formData, logoFile || undefined)
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
            <DialogTitle>{customerToEdit ? "Edit Customer" : "Add New Customer"}</DialogTitle>
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
              <Label htmlFor="code">Customer Code *</Label>
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
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Corp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="countryRegion">Country Region</Label>
              <Input
                id="countryRegion"
                placeholder="e.g. APAC, EMEA"
                value={formData.countryRegion}
                onChange={(e) => setFormData({ ...formData, countryRegion: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logoFile">Upload Logo</Label>
              <Input
                id="logoFile"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              {customerToEdit?.logoUrl && !logoFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Current logo:</span>
                  <img src={customerToEdit.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover border" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id="isActive"
                checked={Boolean(formData.isActive)}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: Boolean(checked) })}
              />
              <div className="grid gap-1">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">Customer is available for selection.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customerToEdit ? "Save Changes" : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
