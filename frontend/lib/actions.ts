"use server";

import { refresh } from "next/cache";
import { cookies, headers } from "next/headers";

import {
  addCartItem,
  ApiError,
  cancelOrder,
  changeOrderStatus,
  createAdminProduct,
  createVnpayPayment,
  login,
  placeOrder,
  register,
  removeCartItem,
  saveMyReview,
  sendChat,
  setAdminProductActive,
  updateAdminProduct,
  updateCartItem,
  uploadAdminImage,
  type AuthResponse,
  type ChatMessage,
  type ChatReply,
  type CreateOrderInput,
  type OrderStatus,
  type ProductFormInput,
} from "@/lib/api";
import { TOKEN_COOKIE } from "@/lib/session";

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; needLogin: boolean };

async function run<T>(work: () => Promise<T>, refreshPage = true): Promise<ActionResult<T>> {
  try {
    const data = await work();
    if (refreshPage) {
      refresh();
    }
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


export async function placeOrderAction(
  input: CreateOrderInput,
): Promise<ActionResult<{ orderId: number; paymentUrl: string | null }>> {
  return run(async () => {
    const order = await placeOrder(input);
    let paymentUrl: string | null = null;
    if (input.paymentMethod === "VNPAY") {
      try {
        paymentUrl = (await createVnpayPayment(order.id)).paymentUrl;
      } catch {
        paymentUrl = null;
      }
    }
    return { orderId: order.id, paymentUrl };
  });
}

export async function payVnpayAction(orderId: number): Promise<ActionResult<string>> {
  return run(async () => (await createVnpayPayment(orderId)).paymentUrl);
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


export async function uploadImageAction(formData: FormData): Promise<ActionResult<string>> {
  return run(async () => {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Chưa chọn ảnh");
    }
    return (await uploadAdminImage(file)).url;
  }, false);
}

export async function createProductAction(input: ProductFormInput): Promise<ActionResult<number>> {
  return run(async () => (await createAdminProduct(input)).id);
}

export async function updateProductAction(id: number, input: ProductFormInput): Promise<ActionResult<number>> {
  return run(async () => (await updateAdminProduct(id, input)).id);
}

export async function setProductActiveAction(id: number, active: boolean): Promise<ActionResult> {
  return run(async () => {
    await setAdminProductActive(id, active);
    return null;
  });
}


export async function saveReviewAction(productId: number, rating: number, comment: string): Promise<ActionResult> {
  return run(async () => {
    await saveMyReview(productId, { rating, comment });
    return null;
  });
}


export async function chatAction(message: string, history: ChatMessage[]): Promise<ActionResult<ChatReply>> {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ?? requestHeaders.get("x-real-ip");
  return run(() => sendChat(message, history.slice(-10), clientIp ?? null), false);
}
