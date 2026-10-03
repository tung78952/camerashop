const API_URL = process.env.API_URL ?? "http://localhost:8080";

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

export async function getProducts(page: number): Promise<Page<ProductSummary>> {
  const res = await fetch(`${API_URL}/api/products?page=${page}`);
  if (!res.ok) {
    throw new Error(`Lỗi tải sản phẩm: HTTP ${res.status}`);
  }
  return res.json();
}

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

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (res.status === 404 || res.status === 400) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Lỗi tải sản phẩm: HTTP ${res.status}`);
  }
  return res.json();
}
