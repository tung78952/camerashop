// Sort dropdown that submits its form as soon as the value changes (client component).

"use client";

export default function SortSelect({ formId, value, className = "" }: { formId: string; value?: string; className?: string }) {
  return (
    <select
      name="order"
      form={formId}
      aria-label="Sắp xếp"
      defaultValue={value ?? ""}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className={`h-10 rounded-md border border-line-strong bg-surface pl-3.5 pr-8 text-sm text-ink ${className}`}
    >
      <option value="">Mặc định</option>
      <option value="price_asc">Giá thấp → cao</option>
      <option value="price_desc">Giá cao → thấp</option>
    </select>
  );
}
