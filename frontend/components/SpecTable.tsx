// Grouped technical specs table; long tables are collapsed with a "show all" button.

"use client";

import { useRef, useState } from "react";

import type { Spec } from "@/lib/api";

const COLLAPSE_AFTER = 16;
const COLLAPSED_ROWS = 10;

type SpecGroup = { name: string | null; rows: Spec[] };

// Groups consecutive rows with the same group name, keeping order.
function groupSpecs(specs: Spec[]): SpecGroup[] {
  const groups: SpecGroup[] = [];
  for (const spec of specs) {
    const last = groups[groups.length - 1];
    if (last && last.name === spec.group) {
      last.rows.push(spec);
    } else {
      groups.push({ name: spec.group, rows: [spec] });
    }
  }
  return groups;
}

// First N rows for the collapsed view.
function takeRows(groups: SpecGroup[], limit: number): SpecGroup[] {
  const result: SpecGroup[] = [];
  let left = limit;
  for (const group of groups) {
    if (left <= 0) break;
    result.push({ name: group.name, rows: group.rows.slice(0, left) });
    left -= group.rows.length;
  }
  return result;
}

export default function SpecTable({ specs }: { specs: Spec[] }) {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const canCollapse = specs.length > COLLAPSE_AFTER;
  const groups = groupSpecs(specs);
  const shown = canCollapse && !expanded ? takeRows(groups, COLLAPSED_ROWS) : groups;

  function toggle() {
    if (expanded) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setExpanded(!expanded);
  }

  return (
    <section ref={sectionRef} aria-labelledby="specs-title" className="mt-12 grid scroll-mt-28 gap-4 md:mt-20 lg:grid-cols-[220px_1fr] lg:gap-14">
      <h2 id="specs-title" className="text-xl font-bold tracking-tight md:text-[22px]">Thông số kỹ thuật</h2>

      <div className="min-w-0">
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            {shown.map((group, groupIndex) => (
              <tbody key={`${group.name}-${groupIndex}`}>
                {group.name && (
                  <tr className={groupIndex > 0 ? "border-t border-line" : ""}>
                    <th colSpan={2} className="bg-soft px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[.04em]">
                      {group.name}
                    </th>
                  </tr>
                )}
                {group.rows.map((spec, index) => (
                  <tr key={`${spec.label}-${index}`} className="border-t border-line">
                    <th className="w-2/5 px-4 py-3 text-left align-top font-normal text-muted sm:w-[36%]">{spec.label}</th>
                    <td className="px-4 py-3 align-top">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          {canCollapse && !expanded && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface to-transparent" />
          )}
        </div>

        {canCollapse && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            className="mt-4 flex h-11 items-center gap-2 rounded-lg border border-line-strong bg-surface px-5 text-sm font-medium hover:border-ink"
          >
            {expanded ? "Thu gọn" : `Xem toàn bộ thông số (${specs.length} dòng)`}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={expanded ? "rotate-180" : ""}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
