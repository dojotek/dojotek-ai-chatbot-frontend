"use client";

let inMemoryToken: string | null = null;

const STORAGE_KEY = "dojotek_auth_token";
const COOKIE_KEY = "auth_token";

function setCookie(name: string, value: string, options?: { maxAgeSeconds?: number }) {
  if (typeof document === "undefined") return;
  const parts = [`${name}=${encodeURIComponent(value)}`, "path=/"];
  if (options?.maxAgeSeconds) parts.push(`max-age=${options.maxAgeSeconds}`);
  document.cookie = parts.join("; ");
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  if (inMemoryToken) return inMemoryToken;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  inMemoryToken = stored || null;
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  inMemoryToken = token;
  window.localStorage.setItem(STORAGE_KEY, token);
  setCookie(COOKIE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  inMemoryToken = null;
  window.localStorage.removeItem(STORAGE_KEY);
  deleteCookie(COOKIE_KEY);
}


