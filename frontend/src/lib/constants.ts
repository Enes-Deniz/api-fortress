export const ROUTES = {
  auth: "/auth",
  dashboard: "/dashboard",
} as const;

export const STORAGE_KEYS = {
  apiMode: "api-fortress-api-mode",
  accessToken: "api-fortress-access-token",
} as const;

export function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.accessToken);
}
