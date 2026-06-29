"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { filterCollapsed } from "@/lib/accounting/account-hierarchy";
import type { HierarchyRow } from "@/lib/accounting/account-hierarchy";

type ReportAccountRowsProps = {
  rows: HierarchyRow[];
  collapsedNames: Set<string>;
  rowKeyPrefix: string;
  /** Left padding for depth-0 rows in rem (default 1.5 = px-6). */
  baseIndentRem?: number;
  /** Additional left padding per depth level in rem (default 1.5). */
  indentStepRem?: number;
  onToggleCollapse: (fullName: string) => void;
  onDrillAmount: (row: HierarchyRow) => void;
};

function formatMoney(value: number): string {
  return Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Renders a DFS-ordered list of HierarchyRows as <tr> elements inside a
 * <tbody>. Returns a React Fragment so it can be placed directly inside any
 * <tbody> without breaking table semantics.
 *
 * - Rows with children show a ▼/▶ chevron; clicking the name cell
 *   toggles their subtree (calls onToggleCollapse).
 * - Clicking the amount cell triggers drill-down (calls onDrillAmount).
 */
export function ReportAccountRows({
  rows,
  collapsedNames,
  rowKeyPrefix,
  baseIndentRem = 1.5,
  indentStepRem = 1.5,
  onToggleCollapse,
  onDrillAmount,
}: ReportAccountRowsProps) {
  const visible = filterCollapsed(rows, collapsedNames);

  return (
    <>
      {visible.map((row) => {
        const isCollapsed = row.hasChildren && collapsedNames.has(row.fullName);
        const paddingLeft = `${baseIndentRem + row.depth * indentStepRem}rem`;

        return (
          <tr
            key={`${rowKeyPrefix}-${row.fullName}`}
            className="border-b border-[var(--color-container-background-secondary)]"
          >
            <td
              className={`py-1 pr-3 text-[var(--color-text-primary)]${row.hasChildren ? " cursor-pointer select-none" : ""}`}
              style={{ paddingLeft }}
              onClick={row.hasChildren ? () => onToggleCollapse(row.fullName) : undefined}
            >
              <span className="flex items-center gap-1">
                {row.hasChildren ? (
                  isCollapsed ? (
                    <ChevronRight className="h-3 w-3 shrink-0 text-[var(--color-icon-secondary)]" />
                  ) : (
                    <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-icon-secondary)]" />
                  )
                ) : null}
                {row.label}
              </span>
            </td>
            <td
              className="cursor-pointer px-3 py-1 text-right text-[var(--color-link-text)] hover:underline"
              onClick={() => onDrillAmount(row)}
            >
              {formatMoney(row.amount)}
            </td>
          </tr>
        );
      })}
    </>
  );
}
