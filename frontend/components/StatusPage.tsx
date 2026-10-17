// Shared error page layout (404, 403, 500): faded status code, title, message and a link home.

import Link from "next/link";

export default function StatusPage({
  code,
  title,
  message,
  action,
}: {
  code: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20">
      <section className="flex max-w-130 flex-col items-center gap-3.5 text-center">
        <span aria-hidden="true" className="text-8xl font-bold leading-none tracking-tighter text-line">{code}</span>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        <p className="text-ink-2">{message}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {action}
          <Link
            href="/"
            className={`flex h-12 items-center rounded-lg px-6 ${
              action ? "border border-line-strong bg-surface font-medium hover:border-ink" : "bg-ink font-semibold text-white hover:bg-ink-2"
            }`}
          >
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
