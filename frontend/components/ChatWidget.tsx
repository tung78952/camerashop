// Floating AI shopping assistant: suggestions, chat history and clickable product cards (hidden on admin pages).

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ChatMessage, ChatProduct } from "@/lib/api";
import { chatAction } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import { imageSrc } from "@/lib/image";

type Line = ChatMessage & { products?: ChatProduct[]; error?: boolean };

const WELCOME = "Chào bạn! Mình là trợ lý AI của TCameraShop. Bạn cho mình biết ngân sách và nhu cầu (chụp gì, quay gì, đang dùng máy nào), mình gợi ý sản phẩm có sẵn trong shop nhé.";

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

  // Sends the question with recent history and appends the answer or the error message.
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
          aria-label="Tư vấn AI"
          className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center gap-2.5 rounded-full bg-ink font-semibold text-white shadow-[0_8px_24px_rgba(28,25,23,.22)] hover:bg-ink-2 md:bottom-6 md:right-6 md:h-13 md:w-auto md:pl-4.5 md:pr-5.5 md:text-sm"
        >
          <ChatIcon size={22} />
          <span className="hidden md:inline">Tư vấn AI</span>
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-labelledby="chat-title"
          className="fixed inset-x-3 bottom-3 z-40 flex h-[85vh] flex-col overflow-hidden rounded-2xl border border-line bg-surface text-sm shadow-[0_16px_48px_rgba(28,25,23,.16)] md:inset-x-auto md:bottom-6 md:right-6 md:h-175 md:max-h-[80vh] md:w-100"
        >
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line pl-4.5 pr-2">
            <span aria-hidden="true" className="flex size-8.5 items-center justify-center rounded-full bg-ink text-white">
              <ChatIcon size={18} />
            </span>
            <div className="mr-auto flex flex-col">
              <h2 id="chat-title" className="text-[15px] font-bold">Tư vấn AI</h2>
              <span className="text-xs text-muted">Gợi ý dựa trên hàng có trong shop</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng khung chat" className="flex size-11 items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-bg p-4.5">
            <Bubble line={{ role: "assistant", text: WELCOME }} />

            {lines.length === 0 && (
              <div className="flex flex-col items-start gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="min-h-10 rounded-full border border-line-strong bg-surface px-3.5 py-2 text-left text-[13px] hover:border-ink"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {lines.map((line, index) => (
              <Bubble key={index} line={line} />
            ))}

            {loading && (
              <p role="status" className="flex items-center gap-2 text-[13px] text-muted">
                <span aria-hidden="true" className="flex gap-1">
                  <span className="size-1.5 animate-pulse rounded-full bg-stone-400" />
                  <span className="size-1.5 animate-pulse rounded-full bg-stone-400 [animation-delay:150ms]" />
                  <span className="size-1.5 animate-pulse rounded-full bg-stone-400 [animation-delay:300ms]" />
                </span>
                Trợ lý đang trả lời…
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
            className="flex shrink-0 flex-col gap-2 border-t border-line px-3.5 pb-2.5 pt-3"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={500}
                aria-label="Tin nhắn"
                placeholder="Hỏi về máy ảnh, ống kính, ngân sách…"
                className="h-11 min-w-0 flex-1 rounded-full border border-line-strong px-3.5 outline-none focus:border-ink"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 items-center gap-1.5 rounded-full bg-accent px-4.5 font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
              >
                Gửi
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[11px] text-muted">AI có thể nhầm — giá và tồn kho xem chính xác ở trang sản phẩm.</p>
          </form>
        </section>
      )}
    </>
  );
}

// Chat bubble icon.
function ChatIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

// One chat bubble, with product cards under assistant answers.
function Bubble({ line }: { line: Line }) {
  const isUser = line.role === "user";
  return (
    <div className={`flex flex-col gap-2.5 ${isUser ? "items-end" : "items-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-line rounded-[14px] px-3.5 py-2.5 leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-ink text-white"
            : line.error
              ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
              : "rounded-bl-sm border border-line bg-surface"
        }`}
      >
        {line.text}
      </p>

      {line.products && line.products.length > 0 && (
        <div className="flex w-[92%] flex-col gap-2">
          {line.products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2 pr-3.5 hover:border-line-strong"
            >
              <span className="relative size-13 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                {product.imageUrl && (
                  <Image src={imageSrc(product.imageUrl)} alt="" fill sizes="52px" className="object-contain p-1" unoptimized />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-semibold">{product.name}</span>
                {product.minPrice != null && (
                  <span className="price text-[13px] font-semibold text-accent">từ {formatPrice(product.minPrice)}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
