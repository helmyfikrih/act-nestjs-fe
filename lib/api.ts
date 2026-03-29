import { refreshTokens, getAccessToken, clearTokens } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Prevent multiple simultaneous refresh calls (refresh lock)
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function onTokenRefreshed(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

async function doRefresh(): Promise<string> {
  // Only one refresh at a time
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const data = await refreshTokens();
    onTokenRefreshed(data.access_token);
    return data.access_token;
  } catch (err) {
    refreshQueue = [];
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    throw err;
  } finally {
    isRefreshing = false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const buildHeaders = (token: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // First attempt
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  let res = await fetch(url, { ...options, headers: buildHeaders(token) });

  // If 401 and not the refresh/login endpoint itself → try to refresh
  if (
    res.status === 401 &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/login")
  ) {
    try {
      const newToken = await doRefresh();
      // Retry original request with new access token
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(newToken),
      });
    } catch {
      // doRefresh already redirects to signin
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
  }

  // Handle empty bodies (e.g. 204)
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ??
      `Request failed with status ${res.status}`;
    throw new ApiError(
      res.status,
      Array.isArray(message) ? message[0] : message,
    );
  }

  return data as T;
}
