// Read-only star rating; partial stars are drawn by clipping a gold overlay.

export default function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  const percent = Math.max(0, Math.min(5, value)) * 20;

  return (
    <span className={`relative inline-block leading-none ${size}`} aria-label={`${value.toLocaleString("vi-VN")} trên 5 sao`}>
      <span className="text-gray-300">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-yellow-400" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
