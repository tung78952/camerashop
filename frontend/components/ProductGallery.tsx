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
    <section aria-label="Bộ ảnh" className="flex min-w-0 flex-col gap-3">
      <button
        type="button"
        onClick={() => current && setZoomOpen(true)}
        aria-label="Xem ảnh lớn"
        className={`relative block aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface ${current ? "cursor-zoom-in" : "cursor-default"}`}
      >
        <span className="absolute inset-4 md:inset-8">
          <ProductImage
            key={selected}
            src={current} name={name} brand={brand} category={category}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </span>
        {list.length > 1 && (
          <span className="price absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white md:right-3.5 md:top-3.5">
            {selected + 1} / {list.length}
          </span>
        )}
      </button>

      {list.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto md:grid md:grid-cols-8 md:overflow-visible">
          {list.map((src, index) => (
            <button
              key={src ?? index}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={index === selected}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-surface md:w-auto ${
                index === selected ? "border-2 border-ink" : "border border-line hover:border-line-strong"
              }`}
            >
              <span className="absolute inset-1">
                <ProductImage src={src} name={name} brand={brand} category={category} sizes="96px" />
              </span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4"
        >
          <span className="price absolute left-4 top-4 text-sm font-medium text-white">
            {selected + 1} / {list.length}
          </span>
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Đóng"
            className="absolute right-2 top-2 flex size-11 items-center justify-center text-white hover:text-line-strong"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
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
            className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-xl bg-white"
          />

          {list.length > 1 && (
            <ZoomArrow direction="right" onClick={() => show(1)} />
          )}
        </div>
      )}
    </section>
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
      className={`absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 ${
        direction === "left" ? "left-3 md:left-4" : "right-3 md:right-4"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}
