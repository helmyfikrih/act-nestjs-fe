"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CreateRoleDto, UpdateRoleDto, Role } from "@/lib/api-role"
import { Loader2 } from "lucide-react"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleToEdit?: Role | null
  onSave: (data: CreateRoleDto | UpdateRoleDto) => Promise<void>
}

export function RoleDialog({ open, onOpenChange, roleToEdit, onSave }: RoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name,
        description: roleToEdit.description || "",
      })
    } else {
      setFormData({ name: "", description: "" })
    }
  }, [roleToEdit, open])

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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{roleToEdit ? "Edit Role" : "Add New Role"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {roleToEdit ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
