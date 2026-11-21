// src/features/candy/components/CandyCard.tsx
"use client";

import { format } from "date-fns";
import {
  Calendar,
  Camera,
  Clock,
  CloudSun,
  DollarSign,
  Lock,
  Sparkles,
} from "lucide-react";
import type {
  BudgetTier,
  Candy,
  CandyStatus,
  WeatherCondition,
} from "../types/candy.types";

export interface CandyCardProps {
  candy: Candy;
  onSelect?: (candy: Candy) => void;
  onAddPhoto?: (candy: Candy) => void;
  className?: string;
}

const BUDGET_LABELS: Record<BudgetTier, string> = {
  FREE: "Free ($0)",
  LOW: "$",
  MEDIUM: "$$",
  HIGH: "$$$",
};

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  ANY: "Any Weather",
  SUNNY: "Sunny / Outdoor",
  RAINY: "Rainy / Indoor",
  NIGHT: "Evening / Night",
};

const STATUS_LABELS: Record<CandyStatus, string> = {
  PROPOSED: "Proposed",
  IN_BOWL: "In Bowl",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
};

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return format(parsed, "MMM d, yyyy · HH:mm");
}

export function CandyCard({
  candy,
  onSelect,
  onAddPhoto,
  className = "",
}: CandyCardProps) {
  const isLockedSurprise = Boolean(candy.is_surprise && !candy.is_revealed);
  const formattedDate = formatDateTime(candy.start_date_time);
  const formattedRevealAt = formatDateTime(candy.reveal_at);
  const photoCount = candy.photos?.length ?? 0;

  return (
    <article
      onClick={onSelect ? () => onSelect(candy) : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(candy);
              }
            }
          : undefined
      }
      className={`rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 ${
        onSelect ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Row: Category, Surprise/Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
          {candy.category_name}
        </span>

        <div className="flex items-center gap-1.5">
          {candy.is_surprise && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
              <Sparkles className="h-3 w-3" />
              Surprise
            </span>
          )}

          {candy.status && (
            <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
              {STATUS_LABELS[candy.status]}
            </span>
          )}

          {candy.is_expired && (
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
              Expired
            </span>
          )}
        </div>
      </div>

      {/* Title & Description / Surprise Lock */}
      <div className="mt-3">
        <h3 className="text-base font-semibold text-neutral-900">
          {isLockedSurprise ? "Locked Surprise Date" : candy.title}
        </h3>

        {isLockedSurprise ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-600">
            <Lock className="h-4 w-4 shrink-0 text-neutral-500" />
            <span>
              {formattedRevealAt
                ? `Details unlock on ${formattedRevealAt}`
                : "Details stay hidden until reveal time"}
            </span>
          </div>
        ) : (
          candy.description && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
              {candy.description}
            </p>
          )
        )}
      </div>

      {/* Metadata: Budget, Weather, Duration, Planned Date */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-600">
        {candy.budget && (
          <span className="inline-flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
            {BUDGET_LABELS[candy.budget]}
          </span>
        )}

        {candy.weather && (
          <span className="inline-flex items-center gap-1">
            <CloudSun className="h-3.5 w-3.5 text-neutral-400" />
            {WEATHER_LABELS[candy.weather]}
          </span>
        )}

        {candy.duration && !isLockedSurprise && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            {candy.duration}
          </span>
        )}

        {formattedDate && !isLockedSurprise && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
            {formattedDate}
          </span>
        )}
      </div>

      {/* Footer: Author & Photo Scrapbook Action */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span>By @{candy.created_by_username}</span>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            {photoCount}
          </span>

          {candy.is_expired && onAddPhoto && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddPhoto(candy);
              }}
              className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Add Photo
            </button>
          )}
        </div>
      </div>
    </article>
  );
}