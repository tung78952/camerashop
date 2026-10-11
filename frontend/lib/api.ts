import { getSession } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:8080";


type ErrorBody = {
  status: number;
  message: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>): Promise<T> {
  const session = await getSession();
  const isFile = body instanceof FormData;
  const headers: Record<string, string> = isFile ? {} : { "Content-Type": "application/json" };
  Object.assign(headers, extraHeaders);
  if (session) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFile ? body : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Lỗi HTTP ${res.status}`;
    try {
      const body: ErrorBody = await res.json();
      message = body.message;
    } catch {
    }
    throw new ApiError(res.status, message);
  }
  return res.json();
}


export type ProductSummary = {
  id: number;
  name: string;
  brand: string;
  category: string;
  mount: string | null;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  ratingAverage: number;
  ratingCount: number;
};

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type Variant = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

export type Spec = {
  group: string | null;
  label: string;
  value: string;
};

export type ProductDetail = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  specs: Spec[];
  brand: string;
  category: string;
  mount: string | null;
  variants: Variant[];
  compatibleProducts: ProductSummary[];
};

export type Option = {
  id: number;
  name: string;
};

export type FilterOptions = {
  brands: Option[];
  categories: Option[];
  mounts: Option[];
};

export type CartItem = {
  id: number;
  productId: number;
  productName: string;
  variantName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  lineTotal: number;
};

export type Cart = {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
};

export type OrderItem = {
  productId: number;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderStatus = "PENDING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "COD" | "VNPAY";

export type PaymentStatus = "UNPAID" | "PAID" | "FAILED";

export type Order = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  receiverName: string;
  phone: string;
  address: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  items: OrderItem[];
};

export type CreateOrderInput = {
  receiverName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
};

export type PaymentResult = {
  orderId: number | null;
  paid: boolean;
  message: string;
};

export type AdminProductRow = {
  id: number;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  variantCount: number;
  active: boolean;
};

export type AdminProductDetail = {
  id: number;
  name: string;
  description: string | null;
  brandId: number;
  categoryId: number;
  mountId: number | null;
  images: string[];
  specs: Spec[];
  variants: Variant[];
  compatibleCameraIds: number[];
  active: boolean;
};

export type VariantFormInput = {
  id: number | null;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

export type ProductFormInput = {
  name: string;
  description: string;
  brandId: number;
  categoryId: number;
  mountId: number | null;
  images: string[];
  variants: VariantFormInput[];
  compatibleCameraIds: number[];
  specs: Spec[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type ProductQuery = {
  q?: string;
  page?: number;
  brandId?: string;
  categoryId?: string;
  mountId?: string;
  minPrice?: string;
  maxPrice?: string;
  order?: string;
};


export async function getProducts(query: ProductQuery): Promise<Page<ProductSummary>> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.brandId) params.set("brandId", query.brandId);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.mountId) params.set("mountId", query.mountId);
  if (query.minPrice) params.set("minPrice", query.minPrice);
  if (query.maxPrice) params.set("maxPrice", query.maxPrice);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 0));

  return request<Page<ProductSummary>>("GET", `/api/products?${params}`);
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  try {
    return await request<ProductDetail>("GET", `/api/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return request<FilterOptions>("GET", "/api/filters");
}


export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("POST", "/api/auth/login", { email, password });
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("POST", "/api/auth/register", { name, email, password });
}


export async function getCart(): Promise<Cart> {
  return request<Cart>("GET", "/api/cart");
}

export async function addCartItem(variantId: number, quantity: number): Promise<Cart> {
  return request<Cart>("POST", "/api/cart/items", { variantId, quantity });
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  return request<Cart>("PATCH", `/api/cart/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  return request<Cart>("DELETE", `/api/cart/items/${itemId}`);
}


export async function placeOrder(input: CreateOrderInput): Promise<Order> {
  return request<Order>("POST", "/api/orders", input);
}

export async function getMyOrders(): Promise<Order[]> {
  return request<Order[]>("GET", "/api/orders");
}

export async function cancelOrder(orderId: number): Promise<Order> {
  return request<Order>("POST", `/api/orders/${orderId}/cancel`);
}


export async function createVnpayPayment(orderId: number): Promise<{ paymentUrl: string }> {
  return request<{ paymentUrl: string }>("POST", `/api/payments/vnpay/${orderId}`);
}

export async function confirmVnpayReturn(vnpParams: URLSearchParams): Promise<PaymentResult> {
  return request<PaymentResult>("GET", `/api/payments/vnpay/return?${vnpParams.toString()}`);
}


export async function getAllOrdersAdmin(): Promise<Order[]> {
  return request<Order[]>("GET", "/api/admin/orders");
}

export async function changeOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  return request<Order>("PATCH", `/api/admin/orders/${orderId}/status`, { status });
}


export async function getAdminProducts(): Promise<AdminProductRow[]> {
  return request<AdminProductRow[]>("GET", "/api/admin/products");
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  try {
    return await request<AdminProductDetail>("GET", `/api/admin/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createAdminProduct(input: ProductFormInput): Promise<AdminProductDetail> {
  return request<AdminProductDetail>("POST", "/api/admin/products", input);
}

export async function updateAdminProduct(id: number, input: ProductFormInput): Promise<AdminProductDetail> {
  return request<AdminProductDetail>("PUT", `/api/admin/products/${id}`, input);
}

export async function setAdminProductActive(id: number, active: boolean): Promise<AdminProductDetail> {
  return request<AdminProductDetail>("PATCH", `/api/admin/products/${id}/active`, { active });
}

export async function uploadAdminImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  return request<{ url: string }>("POST", "/api/admin/images", form);
}

export async function getMyOrder(id: string): Promise<Order | null> {
  try {
    return await request<Order>("GET", `/api/orders/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}


export type Review = {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  edited: boolean;
};

export type ProductReviews = {
  average: number;
  count: number;
  starCounts: number[];
  reviews: Review[];
};

export type MyReview = {
  canReview: boolean;
  myReview: Review | null;
};

export type ReviewInput = {
  rating: number;
  comment: string;
};

export async function getProductReviews(productId: number): Promise<ProductReviews> {
  return request<ProductReviews>("GET", `/api/products/${productId}/reviews`);
}

export async function getMyReview(productId: number): Promise<MyReview | null> {
  if (!(await getSession())) {
    return null;
  }
  try {
    return await request<MyReview>("GET", `/api/products/${productId}/reviews/mine`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function saveMyReview(productId: number, input: ReviewInput): Promise<Review> {
  return request<Review>("PUT", `/api/products/${productId}/reviews/mine`, input);
}


export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export type ChatProduct = {
  id: number;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
};

export type ChatReply = {
  reply: string;
  products: ChatProduct[];
};

export async function sendChat(message: string, history: ChatMessage[], clientIp: string | null): Promise<ChatReply> {
  return request<ChatReply>("POST", "/api/chat", { message, history }, clientIp ? { "X-Forwarded-For": clientIp } : undefined);
}
