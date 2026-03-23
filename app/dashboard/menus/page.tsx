"use client"

import { useState, useEffect } from "react"
import { getMenusTree, createMenu, updateMenu, deleteMenu, Menu } from "@/lib/api-menu"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2, FolderTree } from "lucide-react"
import { toast } from "sonner"
import { MenuDialog } from "./components/menu-dialog"

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [menuToEdit, setMenuToEdit] = useState<Menu | null>(null)

  const fetchMenus = async () => {
    try {
      setLoading(true)
      const data = await getMenusTree()
      setMenus(data)
    } catch (err) {
      toast.error("Failed to fetch menus")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  const handleCreate = () => {
    setMenuToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (menu: Menu) => {
    setMenuToEdit(menu)
    setIsDialogOpen(true)
  }

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`Are you sure you want to delete menu "${menu.name}"?`)) return
    
    try {
      await deleteMenu(menu.id)
      toast.success("Menu deleted successfully")
      fetchMenus()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu")
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (menuToEdit) {
        await updateMenu(menuToEdit.id, data)
        toast.success("Menu updated successfully")
      } else {
        await createMenu(data)
        toast.success("Menu created successfully")
      }
      fetchMenus()
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu")
      throw err // Re-throw to keep the dialog open/loading state
    }
  }

  const renderMenuRows = (menuList: Menu[], level: number = 0): React.ReactNode[] => {
    return menuList.flatMap((menu) => [
      <TableRow key={menu.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
            {level > 0 && <span className="text-muted-foreground w-4 border-l-2 border-b-2 h-4 -mt-2 inline-block rounded-bl-sm" />}
            {menu.code}
          </div>
        </TableCell>
        <TableCell>{menu.name}</TableCell>
        <TableCell>{menu.module || "-"}</TableCell>
        <TableCell>{menu.sortOrder}</TableCell>
        <TableCell className="text-right space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleEdit(menu)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(menu)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>,
      ...(menu.children && menu.children.length > 0 ? renderMenuRows(menu.children, level + 1) : []),
    ])
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">Manage system menus and hierarchical structures.</p>
        </div>
        <Button className="bg-brand hover:opacity-90" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Menu
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-brand" /> System Menus
          </CardTitle>
          <CardDescription>View and manage all menus available in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No menus found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    renderMenuRows(menus)
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MenuDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        menuToEdit={menuToEdit}
        menus={menus}
        onSave={handleSave}
      />
    </div>
  )
}
