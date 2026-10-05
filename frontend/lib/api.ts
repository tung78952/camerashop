const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const DEMO_USER_ID = "1";


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

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": DEMO_USER_ID,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
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

export type ProductDetail = {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
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
