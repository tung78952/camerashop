export default function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
}: {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center rounded border">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
        aria-label="Giảm số lượng"
      >
        −
      </button>
      <span className="w-10 text-center text-sm">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40"
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
}
