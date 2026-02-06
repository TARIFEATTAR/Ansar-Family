"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * SearchBar — Search input with optional filter dropdowns
 */

interface FilterOption {
  value: string;
  label: string;
}

interface Filter {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  filters?: Filter[];
  onFilterChange?: (filterId: string, value: string) => void;
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  filters,
  onFilterChange,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ansar-muted pointer-events-none" />
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal placeholder:text-ansar-muted focus:outline-none focus:border-ansar-sage-500 focus:ring-2 focus:ring-ansar-sage-100 transition-all"
        />
        {localValue && (
          <button
            onClick={() => handleChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-ansar-muted hover:text-ansar-gray rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.id}
              value={filter.value}
              onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
              className="px-3 py-2.5 bg-white border border-[rgba(61,61,61,0.12)] rounded-lg font-body text-sm text-ansar-charcoal focus:outline-none focus:border-ansar-sage-500 focus:ring-2 focus:ring-ansar-sage-100 transition-all appearance-none cursor-pointer"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
