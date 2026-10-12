export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-3 p-6 py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" aria-hidden />
      <p className="text-sm text-gray-500">Đang tải...</p>
    </main>
  );
}
