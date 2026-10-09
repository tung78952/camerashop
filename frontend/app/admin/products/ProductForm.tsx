"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";

import { createProductAction, updateProductAction, uploadImageAction } from "@/lib/actions";
import type { AdminProductDetail, FilterOptions, ProductFormInput } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const BATTERY_AND_CHARGER = "Pin & sạc";

type VariantRow = { key: string; id: number | null; name: string; sku: string; price: string; stock: string };

type SpecRow = { key: string; group: string; label: string; value: string };

let rowCounter = 0;
function emptyRow(): VariantRow {
  rowCounter += 1;
  return { key: `new-${rowCounter}`, id: null, name: "", sku: "", price: "", stock: "0" };
}

function emptySpec(group: string): SpecRow {
  rowCounter += 1;
  return { key: `spec-${rowCounter}`, group, label: "", value: "" };
}

export default function ProductForm({
  options,
  cameras,
  initial,
}: {
  options: FilterOptions;
  cameras: { id: number; name: string }[];
  initial?: AdminProductDetail;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brandId, setBrandId] = useState(initial ? String(initial.brandId) : "");
  const [categoryId, setCategoryId] = useState(initial ? String(initial.categoryId) : "");
  const [mountId, setMountId] = useState(initial?.mountId != null ? String(initial.mountId) : "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(
    initial
      ? initial.variants.map((v) => ({ key: `v-${v.id}`, id: v.id, name: v.name, sku: v.sku,
          price: String(v.price), stock: String(v.stock) }))
      : [emptyRow()],
  );
  const [cameraIds, setCameraIds] = useState<number[]>(initial?.compatibleCameraIds ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(
    (initial?.specs ?? []).map((spec, index) => ({ key: `spec-old-${index}`, group: spec.group ?? "", label: spec.label, value: spec.value })),
  );
  const [uploading, setUploading] = useState<number>(0);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const isBattery = options.categories.find((c) => String(c.id) === categoryId)?.name === BATTERY_AND_CHARGER;


  async function uploadFiles(files: File[]) {
    setError(null);
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}": chỉ nhận ảnh JPG hoặc PNG`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}": ảnh tối đa 5 MB`);
        continue;
      }
      setUploading((n) => n + 1);
      const form = new FormData();
      form.append("file", file);
      const result = await uploadImageAction(form);
      setUploading((n) => n - 1);
      if (result.ok) {
        setImages((prev) => (prev.includes(result.data) ? prev : [...prev, result.data]));
      } else {
        setError(`"${file.name}": ${result.error}`);
      }
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(event.dataTransfer.files));
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function moveImage(index: number, step: number) {
    setImages((prev) => {
      const target = index + step;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function makeMain(index: number) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }


  function updateVariant(key: string, field: "name" | "sku" | "price" | "stock", value: string) {
    setVariants((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }


  function updateSpec(key: string, field: "group" | "label" | "value", value: string) {
    setSpecs((prev) => prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function moveSpec(index: number, step: number) {
    setSpecs((prev) => {
      const target = index + step;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCamera(id: number) {
    setCameraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }


  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading > 0) {
      setError("Đợi ảnh tải lên xong rồi hãy lưu");
      return;
    }
    const input: ProductFormInput = {
      name,
      description,
      brandId: Number(brandId),
      categoryId: Number(categoryId),
      mountId: mountId ? Number(mountId) : null,
      images,
      variants: variants.map((row) => ({
        id: row.id,
        name: row.name,
        sku: row.sku.trim(),
        price: Number(row.price),
        stock: Number(row.stock),
      })),
      compatibleCameraIds: isBattery ? cameraIds : [],
      specs: specs.map((row) => ({ group: row.group.trim() || null, label: row.label, value: row.value })),
    };
    setSaving(true);
    setError(null);
    const result = initial ? await updateProductAction(initial.id, input) : await createProductAction(input);
    if (result.ok) {
      router.push("/admin/products");
    } else {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Thông tin</h2>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tên sản phẩm</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100}
            placeholder="vd Sony Alpha 7 V" className="w-full rounded border px-3 py-2 outline-none focus:border-red-600" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Hãng" value={brandId} onChange={setBrandId} required options={options.brands} />
          <Select label="Danh mục" value={categoryId} onChange={setCategoryId} required options={options.categories} />
          <Select label="Ngàm" value={mountId} onChange={setMountId} options={options.mounts} emptyLabel="(Không có ngàm)" />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Mô tả</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000}
            className="w-full rounded border px-3 py-2 outline-none focus:border-red-600" />
        </label>
      </section>

      <section className="space-y-4 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Ảnh <span className="text-sm font-normal text-gray-500">(ảnh đầu tiên = ảnh chính)</span></h2>
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center text-sm ${
            dragOver ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
        >
          <p className="font-medium">Kéo thả ảnh vào đây</p>
          <p className="text-gray-500">hoặc bấm để chọn file · JPG/PNG, tối đa 5 MB/ảnh · tự đặt vào khung vuông nền trắng</p>
          {uploading > 0 && <p className="mt-2 text-red-600">Đang tải {uploading} ảnh lên...</p>}
          <input ref={fileInput} type="file" accept="image/jpeg,image/png" multiple onChange={onPick} className="hidden" />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {images.map((src, index) => (
              <div key={src} className={`overflow-hidden rounded border ${index === 0 ? "border-red-600 ring-1 ring-red-600" : ""}`}>
                <Image src={src} alt={`Ảnh ${index + 1}`} width={160} height={160} unoptimized className="aspect-square w-full bg-white object-contain" />
                <div className="flex items-center justify-between border-t bg-gray-50 px-1 py-0.5 text-xs">
                  {index === 0
                    ? <span className="px-1 font-semibold text-red-600">Ảnh chính</span>
                    : <IconButton label="Đặt làm ảnh chính" onClick={() => makeMain(index)}>★</IconButton>}
                  <span className="flex">
                    <IconButton label="Sang trái" onClick={() => moveImage(index, -1)}>←</IconButton>
                    <IconButton label="Sang phải" onClick={() => moveImage(index, 1)}>→</IconButton>
                    <IconButton label="Xóa ảnh" onClick={() => removeImage(index)}>×</IconButton>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Phiên bản <span className="text-sm font-normal text-gray-500">(giá, SKU, tồn kho nằm ở từng phiên bản)</span></h2>
        <div className="space-y-2">
          {variants.map((row) => (
            <div key={row.key} className="grid grid-cols-12 items-start gap-2">
              <input value={row.name} onChange={(e) => updateVariant(row.key, "name", e.target.value)} required
                placeholder="Tên (vd Body only)" className="col-span-12 rounded border px-2 py-1.5 text-sm sm:col-span-3" />
              <input value={row.sku} onChange={(e) => updateVariant(row.key, "sku", e.target.value.toUpperCase())} required
                placeholder="SKU (vd SONY-A7V-BODY)" className="col-span-12 rounded border px-2 py-1.5 font-mono text-sm sm:col-span-3" />
              <div className="col-span-7 sm:col-span-3">
                <input type="number" min={0} step={1} value={row.price} onChange={(e) => updateVariant(row.key, "price", e.target.value)}
                  required placeholder="Giá (đồng)" className="w-full rounded border px-2 py-1.5 text-sm" />
                {row.price && <p className="mt-0.5 text-xs text-gray-500">= {formatPrice(Number(row.price))}</p>}
              </div>
              <input type="number" min={0} step={1} value={row.stock} onChange={(e) => updateVariant(row.key, "stock", e.target.value)}
                required placeholder="Kho" className="col-span-3 rounded border px-2 py-1.5 text-sm sm:col-span-2" />
              <button type="button" onClick={() => setVariants((prev) => prev.filter((r) => r.key !== row.key))}
                disabled={variants.length === 1} aria-label="Xóa phiên bản"
                className="col-span-2 rounded border py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 sm:col-span-1">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setVariants((prev) => [...prev, emptyRow()])}
          className="rounded border px-3 py-1.5 text-sm font-medium hover:bg-gray-100">+ Thêm phiên bản</button>
      </section>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Thông số kỹ thuật <span className="text-sm font-normal text-gray-500">(hiện thành bảng chia nhóm ở trang sản phẩm; các dòng cùng nhóm để liền nhau)</span></h2>
        {specs.length > 0 && (
          <div className="space-y-2">
            {specs.map((row, index) => (
              <div key={row.key} className="grid grid-cols-12 gap-2">
                <input value={row.group} onChange={(e) => updateSpec(row.key, "group", e.target.value)} maxLength={60}
                  list="spec-groups" placeholder="Nhóm (vd Quay video)"
                  className="col-span-12 rounded border bg-gray-50 px-2 py-1.5 text-sm sm:col-span-3" />
                <input value={row.label} onChange={(e) => updateSpec(row.key, "label", e.target.value)} required maxLength={60}
                  placeholder="Tên (vd Cảm biến)" className="col-span-12 rounded border px-2 py-1.5 text-sm sm:col-span-3" />
                <input value={row.value} onChange={(e) => updateSpec(row.key, "value", e.target.value)} required maxLength={200}
                  placeholder="Giá trị (vd Full-frame 33MP)" className="col-span-9 rounded border px-2 py-1.5 text-sm sm:col-span-4" />
                <span className="col-span-3 flex sm:col-span-2">
                  <IconButton label="Lên trên" onClick={() => moveSpec(index, -1)}>↑</IconButton>
                  <IconButton label="Xuống dưới" onClick={() => moveSpec(index, 1)}>↓</IconButton>
                  <IconButton label="Xóa dòng" onClick={() => setSpecs((prev) => prev.filter((r) => r.key !== row.key))}>×</IconButton>
                </span>
              </div>
            ))}
          </div>
        )}
        <datalist id="spec-groups">
          {[...new Set(specs.map((row) => row.group.trim()).filter((group) => group !== ""))].map((group) => (
            <option key={group} value={group} />
          ))}
        </datalist>
        <button type="button" onClick={() => setSpecs((prev) => [...prev, emptySpec(prev[prev.length - 1]?.group ?? "")])}
          className="rounded border px-3 py-1.5 text-sm font-medium hover:bg-gray-100">+ Thêm thông số</button>
      </section>

      {isBattery && (
        <section className="space-y-3 rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Dùng được với máy ảnh</h2>
          <div className="grid gap-1 sm:grid-cols-3">
            {cameras.map((camera) => (
              <label key={camera.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cameraIds.includes(camera.id)} onChange={() => toggleCamera(camera.id)} className="accent-red-600" />
                {camera.name}
              </label>
            ))}
          </div>
        </section>
      )}

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading > 0}
          className="rounded bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          {saving ? "Đang lưu..." : initial ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="rounded border px-6 py-2.5 font-medium hover:bg-gray-100">Hủy</button>
      </div>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  emptyLabel = "-- Chọn --",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: number; name: string }[];
  required?: boolean;
  emptyLabel?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded border bg-white px-3 py-2 outline-none focus:border-red-600">
        <option value="">{emptyLabel}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className="rounded px-1.5 py-0.5 text-gray-600 hover:bg-gray-200">
      {children}
    </button>
  );
}
