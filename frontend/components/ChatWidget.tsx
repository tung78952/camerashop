"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ChatMessage, ChatProduct } from "@/lib/api";
import { chatAction } from "@/lib/actions";
import { formatPrice } from "@/lib/format";

type Line = ChatMessage & { products?: ChatProduct[]; error?: boolean };

const WELCOME = "Chào bạn! Mình là trợ lý AI của CameraShop. Bạn cho mình biết ngân sách và nhu cầu (chụp gì, quay gì, đang dùng máy nào), mình gợi ý sản phẩm có sẵn trong shop nhé.";

const SUGGESTIONS = [
  "Máy ảnh dưới 25 triệu để quay vlog",
  "Ống kính chụp chân dung cho Sony A7 IV",
  "Pin dự phòng cho Canon R50",
];

export default function ChatWidget() {
  const [open, setOpen] = useState<boolean>(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, loading, open]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function ask(question: string) {
    const text = question.trim();
    if (!text || loading) return;

    const history: ChatMessage[] = lines
      .filter((line) => !line.error)
      .map((line) => ({ role: line.role, text: line.text }))
      .slice(-10);

    setLines((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    const result = await chatAction(text, history);
    setLoading(false);

    if (result.ok) {
      setLines((prev) => [...prev, { role: "assistant", text: result.data.reply, products: result.data.products }]);
    } else {
      setLines((prev) => [...prev, { role: "assistant", text: result.error, error: true }]);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-red-700"
        >
          <span aria-hidden>💬</span> Tư vấn AI
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[560px] max-h-[80vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border bg-white shadow-2xl">
          <div className="flex items-start justify-between bg-red-600 px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Trợ lý CameraShop</p>
              <p className="text-xs text-red-100">AI tư vấn dựa trên hàng có trong shop</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng khung chat" className="text-2xl leading-none hover:text-red-100">
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-3 text-sm">
            <Bubble line={{ role: "assistant", text: WELCOME }} />

            {lines.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {lines.map((line, index) => (
              <Bubble key={index} line={line} />
            ))}

            {loading && <p className="text-xs italic text-gray-500">Trợ lý đang trả lời...</p>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="Hỏi về máy ảnh, ống kính, ngân sách..."
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
          <p className="px-3 pb-2 text-center text-[11px] text-gray-400">AI có thể nhầm — giá và tồn kho xem chính xác ở trang sản phẩm.</p>
        </div>
      )}
    </>
  );
}

function Bubble({ line }: { line: Line }) {
  const isUser = line.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 ${
          isUser ? "bg-red-600 text-white" : line.error ? "border border-red-200 bg-red-50 text-red-700" : "border bg-white text-gray-800"
        }`}
      >
        {line.text}
      </p>

      {line.products && line.products.length > 0 && (
        <div className="mt-2 w-[85%] space-y-2">
          {line.products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 rounded-lg border bg-white p-2 hover:border-red-500"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white">
                {product.imageUrl && (
                  <Image src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-contain" unoptimized />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{product.name}</p>
                {product.minPrice != null && (
                  <p className="text-xs font-semibold text-red-600">từ {formatPrice(product.minPrice)}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
