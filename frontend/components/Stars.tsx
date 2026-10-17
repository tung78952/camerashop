// Read-only star rating; partial stars are drawn by clipping a gold overlay.

export default function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  const percent = Math.max(0, Math.min(5, value)) * 20;

  return (
    <span role="img" className={`relative inline-block leading-none tracking-[1px] ${size}`} aria-label={`${value.toLocaleString("vi-VN")} trên 5 sao`}>
      <span className="text-line-strong">★★★★★</span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-star" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
