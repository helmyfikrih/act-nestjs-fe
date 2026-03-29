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
  refresh_token: string;
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

// ── Storage helpers ───────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
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

/** Login and persist tokens to localStorage. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/** Call backend /auth/refresh to get new token pair. */
export async function refreshTokens(): Promise<LoginResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  // Use raw fetch to avoid the interceptor loop in apiFetch
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    throw new Error("Session expired. Please sign in again.");
  }

  const data: LoginResponse = await res.json();
  setTokens(data.access_token, data.refresh_token);
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

/** Logout: invalidate refresh token on backend, then clear local storage. */
export async function logout(): Promise<void> {
  try {
    await apiFetch<MessageResponse>("/auth/logout", { method: "POST" });
  } catch {
    // ignore errors — still clear tokens locally
  } finally {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
  }
}

/** Get the decoded payload from the access_token in localStorage. */
export function getTokenPayload(): JwtPayload | null {
  if (typeof window === "undefined") return null;
  const token = getAccessToken();
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
  } catch {
    return null;
  }
}
