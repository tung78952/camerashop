// Labelled text input used by the login and registration forms.

export default function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-12 rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] outline-none placeholder:text-stone-400 focus:border-ink"
      />
    </label>
  );
}
