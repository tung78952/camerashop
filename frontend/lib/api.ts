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

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
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

  return getJson<Page<ProductSummary>>(`/api/products?${params}`);
}

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  try {
    return await getJson<ProductDetail>(`/api/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return getJson<FilterOptions>("/api/filters");
}
