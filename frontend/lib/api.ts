const API_URL = process.env.API_URL ?? "http://localhost:8080";

export type ProductSummary = {
  id: number;
  name: string;
  brand: string;
  category: string;
  mount: string | null;
  imageUrl: string | null;
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
