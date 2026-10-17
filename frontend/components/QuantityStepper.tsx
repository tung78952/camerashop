// Quantity input with - / + buttons, limited by stock.

export default function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-13" : "h-10";
  const button = size === "lg" ? "w-12 text-xl" : "w-9 text-lg";
  return (
    <div role="group" aria-label="Số lượng" className={`flex items-center rounded-lg border border-line-strong bg-surface ${box}`}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        className={`h-full ${button} disabled:text-line-strong`}
        aria-label="Giảm số lượng"
      >
        −
      </button>
      <span aria-live="polite" className="price min-w-8 text-center font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        className={`h-full ${button} disabled:text-line-strong`}
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
}
