"use client"

import { useEffect, useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, AlertCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  email: string
  name: string
  isEmailVerified: boolean
  userType: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await apiFetch<User[]>("/users")
        setUsers(data)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand">Team Members</h1>
          <p className="text-muted-foreground text-sm">Manage user access and verify identity status.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input
            placeholder="Filter users..."
            className="pl-9 h-9 border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl overflow-hidden border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Name & Email</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                   No users found.
                </TableCell>
              </TableRow>
            ) : (
                filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand/10 text-brand text-[10px] font-bold">
                          {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isEmailVerified ? "default" : "secondary"} className="text-[10px] uppercase font-bold tracking-tighter">
                      {u.isEmailVerified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <button className="text-brand hover:underline font-medium">Edit</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
