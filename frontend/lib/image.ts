const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE ?? "";

export function imageSrc(path: string): string {
  return IMAGE_BASE && path.startsWith("/products/") ? IMAGE_BASE + path : path;
}
