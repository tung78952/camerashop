// Product filters (price range, category, brand, mount) as plain GET forms, so filters live in the URL: a sidebar on desktop, chips on phones.

import Link from "next/link";

import type { FilterOptions, Option } from "@/lib/api";

// Preset price ranges (value format: "min-max").
export const PRICE_RANGES = [
  { value: "", label: "Tất cả" },
  { value: "0-5000000", label: "Dưới 5 triệu" },
  { value: "5000000-20000000", label: "5 – 20 triệu" },
  { value: "20000000-40000000", label: "20 – 40 triệu" },
  { value: "40000000-", label: "Trên 40 triệu" },
];

export const DESKTOP_FORM_ID = "filter-desktop";
export const MOBILE_FORM_ID = "filter-mobile";

export type SelectedFilters = {
  q?: string;
  brandId?: string;
  categoryId?: string;
  mountId?: string;
  price?: string;
  order?: string;
};

type Props = { options: FilterOptions; selected: SelectedFilters };

// Filter groups shared by both layouts.
function groups({ options, selected }: Props) {
  return [
    { title: "Khoảng giá", name: "price", selected: selected.price ?? "",
      items: PRICE_RANGES.map((range) => ({ value: range.value, label: range.label })) },
    { title: "Danh mục", name: "categoryId", selected: selected.categoryId ?? "", items: withAll(options.categories) },
    { title: "Thương hiệu", name: "brandId", selected: selected.brandId ?? "", items: withAll(options.brands) },
    { title: "Ngàm", name: "mountId", selected: selected.mountId ?? "", items: withAll(options.mounts) },
  ];
}

// "All" (no filter) plus one option per item from the backend.
function withAll(list: Option[]) {
  return [{ value: "", label: "Tất cả" }, ...list.map((option) => ({ value: String(option.id), label: option.name }))];
}

// Desktop: radio lists separated by dividers.
export default function FilterSidebar(props: Props) {
  return (
    <form id={DESKTOP_FORM_ID} method="get" action="/" aria-label="Bộ lọc" className="flex flex-col gap-7">
      {props.selected.q && <input type="hidden" name="q" value={props.selected.q} />}

      {groups(props).map((group, index) => (
        <fieldset key={group.name} className={`flex flex-col ${index > 0 ? "border-t border-line pt-5" : ""}`}>
          <legend className="float-left mb-2 text-[13px] font-semibold">{group.title}</legend>
          {group.items.map((item) => (
            <label key={item.value} className="clear-left flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-ink-2 hover:text-ink">
              <input type="radio" name={group.name} value={item.value} defaultChecked={group.selected === item.value} className="size-4 accent-accent" />
              {item.label}
            </label>
          ))}
        </fieldset>
      ))}

      <div className="flex items-center gap-4">
        <button type="submit" className="h-11 rounded-md bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-hover">
          Lọc
        </button>
        <Link href="/" className="text-sm text-muted underline underline-offset-[3px] hover:text-accent">
          Xóa bộ lọc
        </Link>
      </div>
    </form>
  );
}

// Phone: chip buttons (hidden radios + has-checked styling), used inside the filter sheet.
export function FilterChips(props: Props) {
  return (
    <form id={MOBILE_FORM_ID} method="get" action="/" className="flex min-h-0 flex-1 flex-col">
      {props.selected.q && <input type="hidden" name="q" value={props.selected.q} />}

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
        {groups(props).map((group) => (
          <fieldset key={group.name} className="flex flex-wrap gap-2">
            <legend className="mb-2.5 text-[13px] font-semibold">{group.title}</legend>
            {group.items.map((item) => (
              <label
                key={item.value}
                className="inline-flex h-10 cursor-pointer items-center rounded-full border border-line-strong bg-surface px-4 text-sm has-checked:border-ink has-checked:bg-ink has-checked:font-medium has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input type="radio" name={group.name} value={item.value} defaultChecked={group.selected === item.value} className="sr-only" />
                {item.label}
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-2.5 border-t border-line px-5 pb-5 pt-3">
        <Link href="/" className="flex h-12.5 items-center justify-center rounded-lg border border-line-strong text-[15px] font-medium">
          Xóa bộ lọc
        </Link>
        <button type="submit" className="h-12.5 rounded-lg bg-accent text-[15px] font-semibold text-white">
          Lọc
        </button>
      </div>
    </form>
  );
}

// Number of active filters (badge on the phone filter button).
export function countActive(selected: SelectedFilters): number {
  return [selected.price, selected.categoryId, selected.brandId, selected.mountId].filter((value) => Boolean(value)).length;
}
