"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { register as registerUser } from "@/lib/auth"
import { ApiError } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, UserPlus, Loader2, CheckCircle2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      await registerUser(data)
      setSuccessEmail(data.email)
      // Redirect to resend page pre-filled with email after short delay
      setTimeout(() => router.push(`/resend-verification?email=${encodeURIComponent(data.email)}&registered=1`), 2000)
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
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">ACT App</span>
          </div>
          <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
          <CardDescription>Register to access the Site Activity platform.</CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {successEmail && (
            <Alert className="mb-4 border-brand/30 bg-brand/10 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-brand" />
              <AlertDescription>
                Account created! A verification email was sent to <strong>{successEmail}</strong>. Redirecting…
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive-foreground">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
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

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive-foreground">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand hover:bg-brand/90 text-white" disabled={isSubmitting || !!successEmail}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</> : "Sign up"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-brand hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
