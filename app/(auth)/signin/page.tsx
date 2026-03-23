"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { login } from "@/lib/auth"
import { ApiError } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn, Loader2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      await login(data)
      router.push("/dashboard")
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
              <LogIn className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">ACT App</span>
          </div>
          <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
          <CardDescription>Welcome back — enter your credentials to continue.</CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
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
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive-foreground">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand hover:bg-brand/90 text-white" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-brand hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <p>
              Didn&apos;t receive verification email?{" "}
              <Link href="/resend-verification" className="text-brand hover:underline font-medium">
                Resend
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
