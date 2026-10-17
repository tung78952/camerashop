// Loading screen shown while the next page is being rendered on the server.

export default function Loading() {
  return (
    <main role="status" className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-muted">
      <span aria-hidden="true" className="size-10 animate-spin rounded-full border-[3px] border-line border-t-accent" />
      <span className="text-[15px]">Đang tải…</span>
    </main>
  );
}
