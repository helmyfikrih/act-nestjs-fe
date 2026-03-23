"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmail } from "@/lib/auth"
import { ApiError } from "@/lib/api"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the URL. Please use the link from your email.")
      return
    }

    setStatus("loading")
    verifyEmail(token)
      .then((res) => {
        setStatus("success")
        setMessage(res.message)
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err instanceof ApiError ? err.message : "Verification failed. Please try again.")
      })
  }, [token])

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm shadow-lg border-border text-center">
        <CardHeader className="space-y-1 pb-4 items-center">
          <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-brand" />
          </div>
          <CardTitle className="text-2xl font-semibold">Email Verification</CardTitle>
          <CardDescription>Verifying your email address…</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="text-sm">Please wait while we verify your email…</p>
            </div>
          )}

          {status === "success" && (
            <Alert className="border-brand/30 bg-brand/10 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 pt-2">
            {status === "success" && (
              <Button asChild className="w-full bg-brand hover:bg-brand/90 text-white">
                <Link href="/signin">Continue to Sign in</Link>
              </Button>
            )}
            {status === "error" && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/resend-verification">Resend verification email</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
