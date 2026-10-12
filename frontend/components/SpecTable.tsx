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
    <section ref={sectionRef} className="mt-12 scroll-mt-4">
      <h2 className="mb-4 text-2xl font-bold">Thông số kỹ thuật</h2>

      <div className="relative overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          {shown.map((group, groupIndex) => (
            <tbody key={`${group.name}-${groupIndex}`}>
              {group.name && (
                <tr>
                  <th colSpan={2} className="bg-gray-100 px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-700">
                    {group.name}
                  </th>
                </tr>
              )}
              {group.rows.map((spec, index) => (
                <tr key={`${spec.label}-${index}`} className="border-t first:border-t-0">
                  <th className="w-2/5 px-4 py-2.5 text-left align-top font-medium text-gray-500 sm:w-1/3">{spec.label}</th>
                  <td className="px-4 py-2.5 text-gray-900">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>

        {canCollapse && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {canCollapse && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-red-600 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            {expanded ? "Thu gọn ▲" : `Xem toàn bộ thông số (${specs.length} dòng) ▼`}
          </button>
        </div>
      )}
    </section>
  );
}
