"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";

import {
  addCartItem,
  ApiError,
  cancelOrder,
  changeOrderStatus,
  login,
  placeOrder,
  register,
  removeCartItem,
  updateCartItem,
  type AuthResponse,
  type CreateOrderInput,
  type OrderStatus,
} from "@/lib/api";
import { TOKEN_COOKIE } from "@/lib/session";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; needLogin: boolean };

async function run<T>(work: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await work();
    refresh();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message, needLogin: error.status === 401 };
    }
    return { ok: false, error: "Không kết nối được máy chủ, vui lòng thử lại", needLogin: false };
  }
}

async function saveToken(auth: AuthResponse) {
  (await cookies()).set(TOKEN_COOKIE, auth.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(auth.expiresAt),
  });
}


export async function loginAction(email: string, password: string): Promise<ActionResult> {
  return run(async () => {
    await saveToken(await login(email, password));
    return null;
  });
}

export async function registerAction(name: string, email: string, password: string): Promise<ActionResult> {
  return run(async () => {
    await saveToken(await register(name, email, password));
    return null;
  });
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(TOKEN_COOKIE);
  refresh();
}


export async function addToCartAction(variantId: number, quantity: number): Promise<ActionResult> {
  return run(async () => {
    await addCartItem(variantId, quantity);
    return null;
  });
}

export async function updateCartItemAction(itemId: number, quantity: number): Promise<ActionResult> {
  return run(async () => {
    await updateCartItem(itemId, quantity);
    return null;
  });
}

export async function removeCartItemAction(itemId: number): Promise<ActionResult> {
  return run(async () => {
    await removeCartItem(itemId);
    return null;
  });
}


export async function placeOrderAction(input: CreateOrderInput): Promise<ActionResult<number>> {
  return run(async () => (await placeOrder(input)).id);
}

export async function cancelOrderAction(orderId: number): Promise<ActionResult> {
  return run(async () => {
    await cancelOrder(orderId);
    return null;
  });
}

export async function changeOrderStatusAction(orderId: number, status: OrderStatus): Promise<ActionResult> {
  return run(async () => {
    await changeOrderStatus(orderId, status);
    return null;
  });
}
