"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateMarketAreaDto, MarketArea, UpdateMarketAreaDto } from "@/lib/api-market-area"
import { Loader2 } from "lucide-react"

interface MarketAreaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketAreaToEdit?: MarketArea | null
  onSave: (data: CreateMarketAreaDto | UpdateMarketAreaDto) => Promise<void>
}

export function MarketAreaDialog({ open, onOpenChange, marketAreaToEdit, onSave }: MarketAreaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateMarketAreaDto>({
    code: "",
    name: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    if (marketAreaToEdit) {
      setFormData({
        code: marketAreaToEdit.code,
        name: marketAreaToEdit.name,
        description: marketAreaToEdit.description || "",
        isActive: marketAreaToEdit.isActive,
      })
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        isActive: true,
      })
    }
  }, [marketAreaToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{marketAreaToEdit ? "Edit Market Area" : "Add New Market Area"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Market Area Code *</Label>
              <Input
                id="code"
                placeholder="e.g. MMEA, MOAI"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Market Area Name *</Label>
              <Input
                id="name"
                placeholder="e.g. South East Asia Oceania & India"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
                <p className="text-xs text-muted-foreground">Market area is available for selection.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {marketAreaToEdit ? "Save Changes" : "Create Market Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
