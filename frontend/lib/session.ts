import { cookies } from "next/headers";

export const TOKEN_COOKIE = "camerashop_token";

export type Session = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  token: string;
};

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

export function safeNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/";
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1];
    return JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
