"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";

/**
 * DataTable — Clean, spacious sortable table with card fallback on mobile
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
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else setSortDir("asc");
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
      <div className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] py-16 px-8 text-center">
        {emptyIcon && (
          <div className="flex justify-center mb-4 text-ansar-sage-200">
            {emptyIcon}
          </div>
        )}
        <p className="font-heading text-lg text-ansar-muted">{emptyMessage}</p>
        <p className="font-body text-xs text-ansar-muted mt-1 opacity-60">
          Records will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-[rgba(61,61,61,0.06)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Row count */}
        <div className="px-5 py-2.5 border-b border-[rgba(61,61,61,0.04)] bg-[#FDFCFA]">
          <span className="font-body text-[11px] text-ansar-muted">
            {data.length} {data.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(61,61,61,0.06)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 text-left font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted bg-[#FDFCFA] ${
                      col.sortable
                        ? "cursor-pointer select-none hover:text-ansar-gray transition-colors"
                        : ""
                    } ${col.className || ""}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
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
                            <ChevronsUpDown className="w-3 h-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
                {actions && (
                  <th className="px-5 py-3.5 text-right font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted bg-[#FDFCFA] w-28">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(61,61,61,0.04)]">
              {sortedData.map((row, idx) => (
                <tr
                  key={String(row[keyField]) || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-ansar-sage-50/40"
                      : "hover:bg-[#FDFCFA]"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 font-body text-sm text-ansar-charcoal ${col.className || ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
        <p className="font-body text-[11px] text-ansar-muted px-1">
          {data.length} {data.length === 1 ? "record" : "records"}
        </p>
        {sortedData.map((row, idx) => {
          if (mobileCard) {
            return (
              <div
                key={String(row[keyField]) || idx}
                onClick={() => onRowClick?.(row)}
              >
                {mobileCard(row, actions?.(row))}
              </div>
            );
          }
          return (
            <div
              key={String(row[keyField]) || idx}
              onClick={() => onRowClick?.(row)}
              className="bg-white rounded-xl border border-[rgba(61,61,61,0.06)] p-4 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="font-body text-[11px] font-medium uppercase tracking-wider text-ansar-muted shrink-0 pt-0.5">
                    {col.label}
                  </span>
                  <span className="font-body text-sm text-ansar-charcoal text-right">
                    {col.render(row)}
                  </span>
                </div>
              ))}
              {actions && (
                <div
                  className="pt-3 border-t border-[rgba(61,61,61,0.06)] flex justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
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
