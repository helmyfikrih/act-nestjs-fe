"use client"

import { useEffect, useState, useRef } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import { getTokenPayload } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Shield, Save, Loader2, Phone, MapPin, UserCircle, Camera } from "lucide-react"
import { toast } from "sonner"

interface ProfileData {
  id: string
  fullName: string | null
  phoneNumber: string | null
  address: string | null
  profilePicturePath: string | null
  profilePictureUrl?: string | null
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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          toast.error("Session expired. Please sign in again.")
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
        toast.error(err instanceof ApiError ? err.message : "Failed to load profile")
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

          // Prevent flickering: if the profile picture path is the same, keep the current URL
          if (
              user.profile?.profilePicturePath === updatedUser.profile?.profilePicturePath &&
              user.profile?.profilePictureUrl &&
              updatedUser.profile
          ) {
              updatedUser.profile.profilePictureUrl = user.profile.profilePictureUrl
          }

          setUser(updatedUser)
          toast.success("Profile updated successfully")
      } catch (err) {
          toast.error(err instanceof ApiError ? err.message : "Failed to update profile")
      } finally {
          setIsSaving(false)
      }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Basic validation
    if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file")
        return
    }

    if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB")
        return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
        // We can't use apiFetch easily with FormData due to JSON.stringify in its body handling
        // So we use a manual fetch with the same logic
        const token = localStorage.getItem("access_token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/users/${user.id}/profile-picture`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.message || "Failed to upload image")
        }

        const updatedUser = await res.json()
        setUser(updatedUser)
        toast.success("Profile picture updated")
    } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to upload profile picture")
    } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
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
      <Card className="rounded-3xl border-border bg-sidebar-gradient overflow-hidden shadow-xl">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-white space-y-4">
              <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarImage src={user.profile?.profilePictureUrl || user.profile?.profilePicturePath || undefined} className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-3xl font-bold backdrop-blur-md">{userInitials}</AvatarFallback>
                  </Avatar>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
                  >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                        <Camera className="h-8 w-8 text-white" />
                    )}
                  </button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
              </div>

              <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                  <p className="text-white/70 text-sm italic font-medium">{user.email}</p>
                  <div className="pt-3">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/30 px-4 py-1 rounded-full backdrop-blur-md font-semibold text-xs uppercase tracking-widest">
                        {user.userType.replace('_', ' ')}
                    </Badge>
                  </div>
              </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-brand" /> Personal Information
          </CardTitle>
          <CardDescription>Update your profile details and management settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Display Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10 h-11 border-border bg-background/50 focus:bg-background transition-colors" 
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Full Name</Label>
                    <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="fullName" 
                            value={formData.fullName} 
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10 h-11 border-border bg-background/50 focus:bg-background transition-colors" 
                            placeholder="Your full legal name"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input id="email" value={user.email} disabled className="pl-10 h-11 border-border bg-muted/20 opacity-60 cursor-not-allowed" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input 
                            id="phone" 
                            value={formData.phoneNumber} 
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="pl-10 h-11 border-border bg-background/50 focus:bg-background transition-colors" 
                            placeholder="+62..."
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address" className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Address</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10 h-11 border-border bg-background/50 focus:bg-background transition-colors" 
                        placeholder="Your residential address"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold pl-1">Account Verification</Label>
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <div className={`p-2 rounded-full ${user.isEmailVerified ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                        <Shield className={`h-6 w-6 ${user.isEmailVerified ? "text-green-500" : "text-amber-500"}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">
                            {user.isEmailVerified ? "Fully Verified Account" : "Pending Verification"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user.isEmailVerified ? "Your identity is confirmed." : "Please check your email to verify."}
                        </span>
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-6 pb-6 border-t border-border/50">
            <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="ml-auto bg-brand hover:opacity-90 transition-all duration-300 text-white px-8 h-11 rounded-xl shadow-lg shadow-brand/20 active:scale-95"
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

