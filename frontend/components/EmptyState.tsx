// Shared "nothing here yet" block with an icon, title and a call to action.

import Link from "next/link";

export default function EmptyState({
  icon,
  title,
  description,
  actionHref = "/",
  actionLabel = "Tiếp tục mua sắm",
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-surface px-6 py-16 text-center md:py-20">
      <span aria-hidden="true" className="flex size-18 items-center justify-center rounded-full bg-soft text-stone-400">
        {icon}
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-ink-2">{description}</p>}
      <Link href={actionHref} className="flex h-12 items-center rounded-lg bg-ink px-6 text-[15px] font-semibold text-white hover:bg-ink-2">
        {actionLabel}
      </Link>
    </div>
  );
}

// Icons used with EmptyState.
export function CartIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

export function ReceiptIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}
