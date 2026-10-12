// Product filters (sort, price range, category, brand, mount) as a plain GET form, so filters live in the URL.

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

export type SelectedFilters = {
  q?: string;
  brandId?: string;
  categoryId?: string;
  mountId?: string;
  price?: string;
  order?: string;
};

export default function FilterSidebar({ options, selected }: { options: FilterOptions; selected: SelectedFilters }) {
  return (
    <form method="get" action="/" className="space-y-4">
      {selected.q && <input type="hidden" name="q" value={selected.q} />}

      <FilterBox title="Sắp xếp">
        <select name="order" defaultValue={selected.order ?? ""} className="w-full rounded border px-2 py-1.5 text-sm">
          <option value="">Mặc định</option>
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>
      </FilterBox>

      <FilterBox title="Lọc theo giá">
        {PRICE_RANGES.map((range) => (
          <RadioRow key={range.value} name="price" value={range.value} label={range.label} checked={(selected.price ?? "") === range.value} />
        ))}
      </FilterBox>

      <OptionGroup title="Danh mục" name="categoryId" options={options.categories} selected={selected.categoryId} />
      <OptionGroup title="Thương hiệu" name="brandId" options={options.brands} selected={selected.brandId} />
      <OptionGroup title="Ngàm" name="mountId" options={options.mounts} selected={selected.mountId} />

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Lọc
        </button>
        <Link href="/" className="text-sm text-gray-500 hover:text-red-600">
          Xóa bộ lọc
        </Link>
      </div>
    </form>
  );
}

function FilterBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-3 border-b-2 border-red-600 pb-2 text-sm font-bold uppercase">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

// One radio group with an "All" option.
function OptionGroup({ title, name, options, selected }: { title: string; name: string; options: Option[]; selected?: string }) {
  return (
    <FilterBox title={title}>
      <RadioRow name={name} value="" label="Tất cả" checked={!selected} />
      {options.map((option) => (
        <RadioRow key={option.id} name={name} value={String(option.id)} label={option.name} checked={selected === String(option.id)} />
      ))}
    </FilterBox>
  );
}

function RadioRow({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="accent-red-600" />
      {label}
    </label>
  );
}
