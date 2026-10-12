// Product gallery: main image, thumbnails and a full-size zoom popup with keyboard navigation.

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import ProductImage from "@/components/ProductImage";
import { imageSrc } from "@/lib/image";

export default function ProductGallery({
  images,
  mainImage,
  name,
  brand,
  category,
}: {
  images: string[];
  mainImage: string | null;
  name: string;
  brand: string;
  category: string;
}) {
  const [selected, setSelected] = useState<number>(0);
  const [zoomOpen, setZoomOpen] = useState<boolean>(false);
  const list = images.length > 0 ? images : [mainImage];
  const current = list[selected];

  // Previous/next image, wrapping around.
  function show(step: number) {
    setSelected((index) => (index + step + list.length) % list.length);
  }

  useEffect(() => {
    if (!zoomOpen) {
      return;
    }
    // Arrow keys navigate, Escape closes the popup.
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "ArrowLeft") setSelected((index) => (index - 1 + list.length) % list.length);
      if (event.key === "ArrowRight") setSelected((index) => (index + 1) % list.length);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoomOpen, list.length]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => current && setZoomOpen(true)}
        aria-label="Xem ảnh lớn"
        className={`relative block aspect-square w-full overflow-hidden rounded-lg border bg-white ${current ? "cursor-zoom-in" : "cursor-default"}`}
      >
        <ProductImage
          key={selected}
          src={current} name={name} brand={brand} category={category}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </button>

      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((src, index) => (
            <button
              key={src ?? index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded border bg-white ${
                index === selected ? "border-red-600 ring-1 ring-red-600" : "hover:border-gray-400"
              }`}
            >
              <ProductImage src={src} name={name} brand={brand} category={category} sizes="96px" />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh ${name}`}
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <span className="absolute left-4 top-4 text-sm font-medium text-white">
            {selected + 1} / {list.length}
          </span>
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Đóng"
            className="absolute right-4 top-3 text-3xl leading-none text-white hover:text-gray-300"
          >
            ×
          </button>

          {list.length > 1 && (
            <ZoomArrow direction="left" onClick={() => show(-1)} />
          )}

          <Image
            src={imageSrc(current)}
            alt={name}
            width={720}
            height={720}
            unoptimized
            onClick={(event) => event.stopPropagation()}
            className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded bg-white"
          />

          {list.length > 1 && (
            <ZoomArrow direction="right" onClick={() => show(1)} />
          )}
        </div>
      )}
    </div>
  );
}

function ZoomArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label={direction === "left" ? "Ảnh trước" : "Ảnh sau"}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-2xl leading-none text-white hover:bg-white/30 ${
        direction === "left" ? "left-4" : "right-4"
      }`}
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}
