"use client"

import { useEffect, useState } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import { getTokenPayload } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Shield, Save, Loader2, Phone, MapPin, UserCircle } from "lucide-react"
import { toast } from "sonner"

interface ProfileData {
  id: string
  fullName: string | null
  phoneNumber: string | null
  address: string | null
  profilePicturePath: string | null
}

interface UserData {
  id: string
  email: string
  name: string
  isEmailVerified: boolean
  userType: string
  profile: ProfileData | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
      name: "",
      fullName: "",
      phoneNumber: "",
      address: ""
  })

  useEffect(() => {
    async function fetchProfile() {
      const payload = getTokenPayload()
      if (!payload) {
          toast.error("Session expired. Please sign in again.") // Changed to toast.error
          setLoading(false)
          return
      }

      try {
        const data = await apiFetch<UserData>(`/users/${payload.sub}`)
        setUser(data)
        setFormData({
            name: data.name || "",
            fullName: data.profile?.fullName || "",
            phoneNumber: data.profile?.phoneNumber || "",
            address: data.profile?.address || ""
        })
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load profile") // Changed to toast.error
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
      if (!user) return

      setIsSaving(true)

      try {
          const updatedUser = await apiFetch<UserData>(`/users/${user.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                  name: formData.name,
                  profile: {
                      fullName: formData.fullName,
                      phoneNumber: formData.phoneNumber,
                      address: formData.address
                  }
              })
          })
          setUser(updatedUser)
          toast.success("Profile updated successfully")
      } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Failed to update profile") // Changed to toast.error
      } finally {
          setIsSaving(false)
      }
  }

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 mt-10">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
    )
  }


  if (!user) return null

  const userInitials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 mt-10">


      <Card className="rounded-3xl border-border bg-sidebar-gradient overflow-hidden">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-white space-y-4">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                  <AvatarFallback className="bg-white/10 text-3xl font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-white/70 text-sm italic">{user.email}</p>
                  <div className="pt-2">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                        {user.userType.replace('_', ' ')}
                    </Badge>
                  </div>
              </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-brand" /> Personal Information
          </CardTitle>
          <CardDescription>Update your profile details and management settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Display Name</Label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-9 h-10 border-border" 
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Full Name</Label>
                    <div className="relative">
                        <UserCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="fullName" 
                            value={formData.fullName} 
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-9 h-10 border-border" 
                            placeholder="Your full legal name"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                        <Input id="email" value={user.email} disabled className="pl-9 h-10 border-border opacity-50 cursor-not-allowed" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="phone" 
                            value={formData.phoneNumber} 
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="pl-9 h-10 border-border" 
                            placeholder="+62..."
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-9 h-10 border-border" 
                        placeholder="Your residential address"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Account Verification</Label>
                <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border">
                    <Shield className={`h-5 w-5 ${user.isEmailVerified ? "text-green-500" : "text-amber-500"}`} />
                    <span className="text-sm font-medium">
                        {user.isEmailVerified ? "Fully Verified Account" : "Pending Email Verification"}
                    </span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-4 pb-4">
            <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="ml-auto bg-brand hover:opacity-90 transition-opacity text-white px-6 min-w-[140px]"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                    </>
                )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
