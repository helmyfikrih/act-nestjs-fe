import { apiFetch } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface MessageResponse {
  message: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  userType: string;
  iat: number;
  exp: number;
}

// ── Auth functions ────────────────────────────────────────────────────────────

/** Register a new user. Sends a verification email on success. */
export async function register(payload: RegisterPayload): Promise<MessageResponse> {
  await apiFetch<unknown>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { message: "Registration successful! Please check your email to verify your account." };
}

/** Login and persist the access_token to localStorage. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", data.access_token);
  }
  return data;
}

/** Verify email via the token from email link query params. */
export async function verifyEmail(token: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

/** Resend the verification email for a given address. */
export async function resendVerification(email: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Remove access_token from localStorage. */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    window.location.href = "/auth/signin";
  }
}

/** Get the decoded payload from the access_token in localStorage. */
export function getTokenPayload(): JwtPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

