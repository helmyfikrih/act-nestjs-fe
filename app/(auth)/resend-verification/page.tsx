"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { resendVerification } from "@/lib/auth"
import { ApiError } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MailCheck, Loader2, CheckCircle2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type FormData = z.infer<typeof schema>

export default function ResendVerificationPage() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") ?? ""
  const isRegistered = searchParams.get("registered") === "1"

  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailFromQuery },
  })

  useEffect(() => {
    if (emailFromQuery) setValue("email", emailFromQuery)
  }, [emailFromQuery, setValue])

  async function onSubmit(data: FormData) {
    setServerError(null)
    setSuccess(false)
    try {
      await resendVerification(data.email)
      setSuccess(true)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "An unexpected error occurred.")
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm shadow-lg border-border">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-md bg-brand flex items-center justify-center">
              <MailCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">ACT App</span>
          </div>
          <CardTitle className="text-2xl font-semibold">Resend Verification</CardTitle>
          <CardDescription>
            {isRegistered
              ? "Your account was created! Check your inbox or resend the verification email below."
              : "Enter your email to receive a new verification link."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-brand/30 bg-brand/10 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <AlertDescription>
                Verification email sent! Please check your inbox (and spam folder).
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive-foreground">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                "Resend verification email"
              )}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already verified?{" "}
            <Link href="/signin" className="text-brand hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
