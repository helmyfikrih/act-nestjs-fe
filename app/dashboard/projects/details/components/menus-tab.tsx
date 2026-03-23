"use client"

import { useState, useEffect } from "react"
import { getProject, assignProjectMenus, removeProjectMenu } from "@/lib/api-project"
import { getMenusTree, Menu } from "@/lib/api-menu"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function MenusTab({ projectId }: { projectId: string }) {
  const [projectMenus, setProjectMenus] = useState<any[]>([])
  const [allMenus, setAllMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMenuToAdd, setSelectedMenuToAdd] = useState<string>("")
  const [assigning, setAssigning] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [proj, menus] = await Promise.all([
        getProject(projectId),
        getMenusTree()
      ])
      setProjectMenus((proj as any).projectMenus || [])
      setAllMenus(menus)
    } catch (err) {
      toast.error("Failed to load menus")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleAddMenu = async () => {
    if (!selectedMenuToAdd) return
    setAssigning(true)
    try {
      await assignProjectMenus(projectId, [selectedMenuToAdd])
      toast.success("Menu assigned successfully")
      setSelectedMenuToAdd("")
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to assign menu")
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveMenu = async (menuId: string, menuName: string) => {
    if (!confirm(`Are you sure you want to remove ${menuName} from this project?`)) return
    try {
      await removeProjectMenu(projectId, menuId)
      toast.success("Menu removed successfully")
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to remove menu")
    }
  }

  // Flatten menus for select options
  const flattenMenus = (menuList: Menu[], level = 0): { id: string; name: string; level: number }[] => {
    let result: { id: string; name: string; level: number }[] = []
    menuList.forEach((menu) => {
      result.push({ id: menu.id, name: menu.name, level })
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenMenus(menu.children, level + 1))
      }
    })
    return result
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
  }

  const flattenedMenus = flattenMenus(allMenus)
  const assignedMenuIds = projectMenus.map(pm => pm.menu.id)
  const availableMenus = flattenedMenus.filter(m => !assignedMenuIds.includes(m.id))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assigned Menus</h3>
        <p className="text-sm text-muted-foreground">Select which menus should be available for this project.</p>
      </div>

      <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/20">
        <div className="flex-1">
          <Select value={selectedMenuToAdd} onValueChange={setSelectedMenuToAdd}>
            <SelectTrigger>
              <SelectValue placeholder="Select a menu to add..." />
            </SelectTrigger>
            <SelectContent>
              {availableMenus.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {Array(m.level).fill("\u00A0\u00A0\u00A0").join("")}- {m.name}
                </SelectItem>
              ))}
              {availableMenus.length === 0 && (
                <SelectItem value="none" disabled>All menus assigned</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddMenu} disabled={!selectedMenuToAdd || assigning} className="bg-brand text-white">
          {assigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Assign Menu
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Menu Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  No menus assigned to this project yet.
                </TableCell>
              </TableRow>
            ) : (
              projectMenus.map((pm) => (
                <TableRow key={pm.id}>
                  <TableCell className="font-medium">{pm.menu.name}</TableCell>
                  <TableCell>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveMenu(pm.menu.id, pm.menu.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
