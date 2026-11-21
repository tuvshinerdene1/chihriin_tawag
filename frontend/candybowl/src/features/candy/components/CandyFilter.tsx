// src/features/candy/components/CandyFilterBar.tsx
"use client";

import { Search } from "lucide-react";
import type {
  BudgetTier,
  CandyCategory,
  CandyStatus,
  WeatherCondition,
} from "../types/candy.types";

export interface CandyFiltersState {
  search: string;
  status: CandyStatus | "";
  budget: BudgetTier | "";
  weather: WeatherCondition | "";
  category: number | "";
}

export interface CandyFilterBarProps {
  filters: CandyFiltersState;
  categories: CandyCategory[];
  onChange: (next: CandyFiltersState) => void;
}

const STATUS_OPTIONS: Array<{ value: CandyStatus | ""; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "IN_BOWL", label: "In Bowl" },
  { value: "PROPOSED", label: "Proposed" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
];

const BUDGET_OPTIONS: Array<{ value: BudgetTier | ""; label: string }> = [
  { value: "", label: "Any Budget" },
  { value: "FREE", label: "Free ($0)" },
  { value: "LOW", label: "$" },
  { value: "MEDIUM", label: "$$" }, { value: "HIGH", label: "$$$" },
];

const WEATHER_OPTIONS: Array<{ value: WeatherCondition | ""; label: string }> = [
  { value: "", label: "Any Weather" },
  { value: "ANY", label: "Any / Flexible" },
  { value: "SUNNY", label: "Sunny / Outdoor" },
  { value: "RAINY", label: "Rainy / Indoor" },
  { value: "NIGHT", label: "Evening / Night" },
];

export function CandyFilterBar({
  filters,
  categories,
  onChange,
}: CandyFilterBarProps) {
  return (
    <section className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative lg:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search date ideas..."
          className="w-full rounded-lg border border-neutral-200 py-1.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
      </div>

      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as CandyStatus | "" })
        }
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by budget"
        value={filters.budget}
        onChange={(e) =>
          onChange({ ...filters, budget: e.target.value as BudgetTier | "" })
        }
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"
      >
        {BUDGET_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <select
          aria-label="Filter by weather"
          value={filters.weather}
          onChange={(e) =>
            onChange({
              ...filters,
              weather: e.target.value as WeatherCondition | "",
            })
          }
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"
        >
          {WEATHER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </section>
  );
}