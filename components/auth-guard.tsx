"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getTokenPayload } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Skip check for auth pages
      if (pathname?.startsWith("/auth")) {
        setAuthorized(true)
        return
      }

      const payload = getTokenPayload()
      
      if (!payload) {
        setAuthorized(false)
        router.replace("/auth/signin")
        return
      }

      setAuthorized(true)
    }

    checkAuth()
  }, [pathname, router])

  if (!authorized && !pathname?.startsWith("/auth")) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
