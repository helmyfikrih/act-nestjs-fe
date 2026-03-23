"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { CreateSiteDto, Site, UpdateSiteDto } from "@/lib/api-site-profile"

interface SiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  siteToEdit?: Site | null
  onSave: (data: CreateSiteDto | UpdateSiteDto) => Promise<void>
}

export function SiteDialog({ open, onOpenChange, siteToEdit, onSave }: SiteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSiteDto>({
    code: "",
    name: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    if (siteToEdit) {
      setFormData({
        code: siteToEdit.code,
        name: siteToEdit.name,
        description: siteToEdit.description || "",
        isActive: siteToEdit.isActive,
      })
      return
    }

    setFormData({
      code: "",
      name: "",
      description: "",
      isActive: true,
    })
  }, [siteToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{siteToEdit ? "Edit Site" : "Create Site"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Site Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Site Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value === "active" }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand text-white" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {siteToEdit ? "Save Changes" : "Create Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
