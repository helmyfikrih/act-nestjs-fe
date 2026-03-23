"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateMenuDto, UpdateMenuDto, Menu } from "@/lib/api-menu"
import { Loader2 } from "lucide-react"

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuToEdit?: Menu | null
  menus: Menu[]
  onSave: (data: CreateMenuDto | UpdateMenuDto) => Promise<void>
}

export function MenuDialog({ open, onOpenChange, menuToEdit, menus, onSave }: MenuDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateMenuDto>({
    code: "",
    name: "",
    module: "",
    parentId: "root",
    sortOrder: 0,
  })

  useEffect(() => {
    if (menuToEdit) {
      setFormData({
        code: menuToEdit.code,
        name: menuToEdit.name,
        module: menuToEdit.module || "",
        parentId: menuToEdit.parentId || "root",
        sortOrder: menuToEdit.sortOrder || 0,
      })
    } else {
      setFormData({ code: "", name: "", module: "", parentId: "root", sortOrder: 0 })
    }
  }, [menuToEdit, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...formData,
        parentId: formData.parentId === "root" ? undefined : formData.parentId,
        sortOrder: Number(formData.sortOrder),
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  // Flatten menus for select options
  const flattenMenus = (menuList: Menu[], level = 0): { id: string; name: string; level: number }[] => {
    let result: { id: string; name: string; level: number }[] = []
    menuList.forEach((menu) => {
      // Don't allow selecting itself or its children as parent
      if (menuToEdit && menu.id === menuToEdit.id) return
      result.push({ id: menu.id, name: menu.name, level })
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenMenus(menu.children, level + 1))
      }
    })
    return result
  }

  const flattenedMenus = flattenMenus(menus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{menuToEdit ? "Edit Menu" : "Add New Menu"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Menu Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Menu Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="module">Module (Optional)</Label>
              <Input
                id="module"
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parentId">Parent Menu</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">-- Top Level (No Parent) --</SelectItem>
                  {flattenedMenus.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {Array(m.level).fill("\u00A0\u00A0\u00A0").join("")}- {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand hover:opacity-90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {menuToEdit ? "Save Changes" : "Create Menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
