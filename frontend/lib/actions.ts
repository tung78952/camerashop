// Server Actions called from client components: they run on the Next.js server, read the httpOnly JWT cookie and call the API.

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

// Runs a backend call, refreshes server-rendered data on success, converts errors into a result object.
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

// Stores the JWT in an httpOnly, SameSite cookie that expires with the token.
async function saveToken(auth: AuthResponse) {
  (await cookies()).set(TOKEN_COOKIE, auth.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(auth.expiresAt),
  });
}


// Logs in and stores the token.
export async function loginAction(email: string, password: string): Promise<ActionResult> {
  return run(async () => {
    await saveToken(await login(email, password));
    return null;
  });
}

// Registers and stores the token.
export async function registerAction(name: string, email: string, password: string): Promise<ActionResult> {
  return run(async () => {
    await saveToken(await register(name, email, password));
    return null;
  });
}

// Logout just deletes the cookie (the backend is stateless).
export async function logoutAction(): Promise<void> {
  (await cookies()).delete(TOKEN_COOKIE);
  refresh();
}


// Adds a variant to the cart.
export async function addToCartAction(variantId: number, quantity: number): Promise<ActionResult> {
  return run(async () => {
    await addCartItem(variantId, quantity);
    return null;
  });
}

// Changes a cart line quantity.
export async function updateCartItemAction(itemId: number, quantity: number): Promise<ActionResult> {
  return run(async () => {
    await updateCartItem(itemId, quantity);
    return null;
  });
}

// Removes a cart line.
export async function removeCartItemAction(itemId: number): Promise<ActionResult> {
  return run(async () => {
    await removeCartItem(itemId);
    return null;
  });
}


// Places the order; returns the order id and, for VNPay, the payment URL.
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

// New VNPay payment URL for an unpaid order.
export async function payVnpayAction(orderId: number): Promise<ActionResult<string>> {
  return run(async () => (await createVnpayPayment(orderId)).paymentUrl);
}

// Customer cancels a pending order.
export async function cancelOrderAction(orderId: number): Promise<ActionResult> {
  return run(async () => {
    await cancelOrder(orderId);
    return null;
  });
}

// Admin changes an order status.
export async function changeOrderStatusAction(orderId: number, status: OrderStatus): Promise<ActionResult> {
  return run(async () => {
    await changeOrderStatus(orderId, status);
    return null;
  });
}


// Admin image upload (no page refresh needed).
export async function uploadImageAction(formData: FormData): Promise<ActionResult<string>> {
  return run(async () => {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Chưa chọn ảnh");
    }
    return (await uploadAdminImage(file)).url;
  }, false);
}

// Admin creates a product.
export async function createProductAction(input: ProductFormInput): Promise<ActionResult<number>> {
  return run(async () => (await createAdminProduct(input)).id);
}

// Admin updates a product.
export async function updateProductAction(id: number, input: ProductFormInput): Promise<ActionResult<number>> {
  return run(async () => (await updateAdminProduct(id, input)).id);
}

// Admin hides or shows a product.
export async function setProductActiveAction(id: number, active: boolean): Promise<ActionResult> {
  return run(async () => {
    await setAdminProductActive(id, active);
    return null;
  });
}


// Creates or updates the user's review.
export async function saveReviewAction(productId: number, rating: number, comment: string): Promise<ActionResult> {
  return run(async () => {
    await saveMyReview(productId, { rating, comment });
    return null;
  });
}


// Asks the AI assistant; forwards the visitor IP from x-forwarded-for.
export async function chatAction(message: string, history: ChatMessage[]): Promise<ActionResult<ChatReply>> {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ?? requestHeaders.get("x-real-ip");
  return run(() => sendChat(message, history.slice(-10), clientIp ?? null), false);
}
