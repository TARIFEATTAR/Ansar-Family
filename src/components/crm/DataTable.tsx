"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

/**
 * DataTable — Sortable, branded table with mobile card fallback
 */

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  mobileCard?: (row: T, actions?: ReactNode) => ReactNode;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  onRowClick,
  actions,
  emptyMessage = "No records found.",
  emptyIcon,
  mobileCard,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-12 text-center">
        {emptyIcon && <div className="flex justify-center mb-4 text-ansar-sage-300">{emptyIcon}</div>}
        <p className="font-heading text-lg text-ansar-gray">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-[rgba(61,61,61,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(61,61,61,0.06)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted ${
                      col.sortable ? "cursor-pointer select-none hover:text-ansar-gray" : ""
                    } ${col.className || ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <span className="w-3.5 h-3.5 flex-shrink-0">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => (
                <tr
                  key={String(row[keyField]) || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[rgba(61,61,61,0.04)] transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${idx % 2 === 0 ? "bg-white" : "bg-[#FDFCFA]"} hover:bg-ansar-sage-50/50`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 font-body text-sm text-ansar-charcoal ${col.className || ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, idx) => {
          if (mobileCard) {
            return (
              <div key={String(row[keyField]) || idx} onClick={() => onRowClick?.(row)}>
                {mobileCard(row, actions?.(row))}
              </div>
            );
          }
          return (
            <div
              key={String(row[keyField]) || idx}
              onClick={() => onRowClick?.(row)}
              className="bg-white rounded-xl border border-[rgba(61,61,61,0.08)] p-4 space-y-2"
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2">
                  <span className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted shrink-0">
                    {col.label}
                  </span>
                  <span className="font-body text-sm text-ansar-charcoal text-right">
                    {col.render(row)}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="pt-2 border-t border-[rgba(61,61,61,0.06)] flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {actions(row)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
