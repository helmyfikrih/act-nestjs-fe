"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateCountryUnitDto, CountryUnit, UpdateCountryUnitDto } from "@/lib/api-country-unit"
import { MarketArea, getMarketAreas } from "@/lib/api-market-area"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface CountryUnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  countryUnitToEdit?: CountryUnit | null
  onSave: (data: CreateCountryUnitDto | UpdateCountryUnitDto) => Promise<void>
}

export function CountryUnitDialog({ open, onOpenChange, countryUnitToEdit, onSave }: CountryUnitDialogProps) {
  const [loading, setLoading] = useState(false)
  const [marketAreas, setMarketAreas] = useState<MarketArea[]>([])
  
  const [formData, setFormData] = useState<CreateCountryUnitDto>({
    code: "",
    name: "",
    marketAreaId: "",
    isActive: true,
  })

  useEffect(() => {
    const fetchMarketAreas = async () => {
      try {
        const data = await getMarketAreas()
        setMarketAreas(data)
      } catch (err) {
        toast.error("Failed to load market areas")
      }
    }
    if (open) {
      fetchMarketAreas()
    }
  }, [open])

  useEffect(() => {
    if (countryUnitToEdit) {
      setFormData({
        code: countryUnitToEdit.code,
        name: countryUnitToEdit.name,
        marketAreaId: countryUnitToEdit.marketAreaId,
        isActive: countryUnitToEdit.isActive,
      })
    } else {
      setFormData({
        code: "",
        name: "",
        marketAreaId: "",
        isActive: true,
      })
    }
  }, [countryUnitToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.marketAreaId) {
      toast.error("Please select a Market Area")
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
            <DialogTitle>{countryUnitToEdit ? "Edit Country Unit" : "Add New Country Unit"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="marketArea">Market Area *</Label>
              <Select 
                value={formData.marketAreaId} 
                onValueChange={(value) => setFormData({ ...formData, marketAreaId: value })}
              >
                <SelectTrigger id="marketArea">
                  <SelectValue placeholder="Select a market area" />
                </SelectTrigger>
                <SelectContent>
                  {marketAreas.map((ma) => (
                    <SelectItem key={ma.id} value={ma.id}>
                      {ma.name} ({ma.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Country Unit Code *</Label>
              <Input
                id="code"
                placeholder="e.g. ID, IN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Country Unit Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Indonesia, India"
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
                <p className="text-xs text-muted-foreground">Country Unit is available for selection.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {countryUnitToEdit ? "Save Changes" : "Create Country Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
