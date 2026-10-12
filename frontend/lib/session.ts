// Reads the logged-in user from the JWT cookie for rendering (the backend still verifies the token on every request).

import { cookies } from "next/headers";

export const TOKEN_COOKIE = "camerashop_token";

export type Session = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  token: string;
};

// Decodes the token payload; missing, malformed or expired tokens mean "not logged in".
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
    return null;
  }
  return {
    id: Number(payload.sub),
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    token,
  };
}

// Only allows internal redirect paths after login (prevents open redirects).
export function safeNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

// Decodes the base64url JSON payload of a JWT.
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1];
    return JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
