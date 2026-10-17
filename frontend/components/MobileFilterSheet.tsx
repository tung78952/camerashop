// Phone filter button and bottom sheet (client component: open/close state, scroll lock, Escape to close).

"use client";

import { useEffect, useState } from "react";

export default function MobileFilterSheet({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-sm font-medium"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M7 12h10M10 17h4" />
        </svg>
        Bộ lọc
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{activeCount}</span>
        )}
      </button>

      <div className={open ? "fixed inset-0 z-50" : "hidden"}>
        <div aria-hidden="true" onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/50" />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-sheet-title"
          className="absolute inset-x-0 bottom-0 flex h-[90vh] flex-col rounded-t-[20px] bg-surface"
        >
          <div className="flex justify-center pt-2.5">
            <span className="h-1 w-10 rounded-sm bg-line-strong" />
          </div>
          <div className="flex h-14 items-center justify-between border-b border-line pl-5 pr-2">
            <h2 id="filter-sheet-title" className="text-lg font-bold">Bộ lọc</h2>
            <button type="button" aria-label="Đóng" onClick={() => setOpen(false)} className="flex size-11 items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
