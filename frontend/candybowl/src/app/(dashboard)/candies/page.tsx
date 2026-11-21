//app/(dashboard)/candies/page.tsx
// src/app/(dashboard)/candies/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  Dices,
  Loader2,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { api } from "@/lib/axios";
import { CandyCard } from "@/features/candy/components/CandyCard";
import {
  useCandies,
  useCreateCandy,
  useRollDateRoulette,
  useUploadCandyPhoto,
} from "@/features/candy/hooks/useCandies";
import {
  createCandySchema,
  type CreateCandyFormValues,
} from "@/features/candy/schemas/candy.schema";
import type {
  BudgetTier,
  Candy,
  CandyCategory,
  CandyStatus,
  WeatherCondition,
} from "@/features/candy/types/candy.types";

interface BowlSummary {
  id: number;
  name: string;
  description?: string;
  categories: CandyCategory[];
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
  { value: "MEDIUM", label: "$$" },
  { value: "HIGH", label: "$$$" },
];

const WEATHER_OPTIONS: Array<{ value: WeatherCondition | ""; label: string }> = [
  { value: "", label: "Any Weather" },
  { value: "ANY", label: "Any / Flexible" },
  { value: "SUNNY", label: "Sunny / Outdoor" },
  { value: "RAINY", label: "Rainy / Indoor" },
  { value: "NIGHT", label: "Evening / Night" },
];

export default function CandiesPage() {
  // --- Bowls & Filter UI State ---
  const [selectedBowlId, setSelectedBowlId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<CandyStatus | "">("");
  const [budgetFilter, setBudgetFilter] = useState<BudgetTier | "">("");
  const [weatherFilter, setWeatherFilter] = useState<WeatherCondition | "">("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Modals & Roulette State ---
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [photoTargetCandy, setPhotoTargetCandy] = useState<Candy | null>(null);
  const [selectedCandy, setSelectedCandy] = useState<Candy | null>(null);
  const [roulettePick, setRoulettePick] = useState<Candy | null>(null);

  // Fetch user's bowls (GET /api/bowls/)
  const {
    data: bowls = [],
    isLoading: isBowlsLoading,
    isError: isBowlsError,
  } = useQuery<BowlSummary[]>({
    queryKey: ["bowls"],
    queryFn: () => api.get("/api/bowls/") as Promise<BowlSummary[]>,
  });

  const activeBowl =
    bowls.find((b) => b.id === selectedBowlId) ?? bowls[0] ?? null;
  const activeBowlId = activeBowl?.id;
  const categories = activeBowl?.categories ?? [];

  // Fetch filtered candies (GET /api/candies/)
  const {
    data: candies = [],
    isLoading: isCandiesLoading,
    isError: isCandiesError,
    error: candiesError,
  } = useCandies({
    bowl: activeBowlId,
    status: statusFilter || undefined,
    budget: budgetFilter || undefined,
    weather: weatherFilter || undefined,
    category: typeof categoryFilter === "number" ? categoryFilter : undefined,
    search: searchQuery.trim() || undefined,
  });

  // Date Roulette mutation (GET /api/candies/roulette/)
  const rouletteMutation = useRollDateRoulette();

  const handleRollRoulette = () => {
    if (!activeBowlId) return;
    rouletteMutation.mutate(
      {
        bowl: activeBowlId,
        budget: budgetFilter || undefined,
        weather: weatherFilter || undefined,
        category: typeof categoryFilter === "number" ? categoryFilter : undefined,
      },
      {
        onSuccess: (picked) => {
          setRoulettePick(picked);
        },
      }
    );
  };

  if (isBowlsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (isBowlsError) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load your candy bowls. Please refresh or sign in again.
        </div>
      </div>
    );
  }

  if (!activeBowl) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-neutral-900">
            No Candy Bowl Yet
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Create or join a shared candy bowl first to start adding date ideas
            and memories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header & Primary Actions */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {activeBowl.name}
            </h1>

            {bowls.length > 1 && (
              <select
                aria-label="Select bowl"
                value={activeBowl.id}
                onChange={(e) => {
                  setSelectedBowlId(Number(e.target.value));
                  setCategoryFilter("");
                  setRoulettePick(null);
                }}
                className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700"
              >
                {bowls.map((bowl) => (
                  <option key={bowl.id} value={bowl.id}>
                    {bowl.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeBowl.description && (
            <p className="mt-1 text-sm text-neutral-600">
              {activeBowl.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRollRoulette}
            disabled={rouletteMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {rouletteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Dices className="h-4 w-4" />
            )}
            Date Roulette
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            New Candy
          </button>
        </div>
      </header>

      {/* Date Roulette Result Banner */}
      {roulettePick && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-900">
              <Sparkles className="h-4 w-4" />
              Roulette Pick
            </span>
            <button
              type="button"
              onClick={() => setRoulettePick(null)}
              aria-label="Dismiss roulette pick"
              className="rounded p-1 text-amber-800 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <CandyCard
            candy={roulettePick}
            onSelect={(c) => setSelectedCandy(c)}
            onAddPhoto={(c) => setPhotoTargetCandy(c)}
          />
        </section>
      )}

      {rouletteMutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {rouletteMutation.error.message ||
            "No matching candies found for Date Roulette."}
        </div>
      )}

      {/* Filter Bar */}
      <section className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search date ideas..."
            className="w-full rounded-lg border border-neutral-200 py-1.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CandyStatus | "")}
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
          value={budgetFilter}
          onChange={(e) => setBudgetFilter(e.target.value as BudgetTier | "")}
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
            value={weatherFilter}
            onChange={(e) =>
              setWeatherFilter(e.target.value as WeatherCondition | "")
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
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
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

      {/* Candy Grid */}
      {isCandiesLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>
      ) : isCandiesError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {candiesError.message || "Could not load candies."}
        </div>
      ) : candies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-sm font-medium text-neutral-900">
            No candies match your filters yet
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Add a new date idea to the bowl or clear your active filters.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candies.map((candy) => (
            <CandyCard
              key={candy.id}
              candy={candy}
              onSelect={(item) => setSelectedCandy(item)}
              onAddPhoto={(item) => setPhotoTargetCandy(item)}
            />
          ))}
        </section>
      )}

      {/* Create Candy Modal */}
      {isCreateOpen && (
        <CreateCandyModal
          bowlId={activeBowl.id}
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Upload Photo Modal (for expired candies) */}
      {photoTargetCandy && (
        <UploadPhotoModal
          candy={photoTargetCandy}
          onClose={() => setPhotoTargetCandy(null)}
        />
      )}

      {/* Simple Detail Drawer / Modal */}
      {selectedCandy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedCandy(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700">
                  {selectedCandy.category_name}
                </span>
                <h2 className="mt-2 text-lg font-bold text-neutral-900">
                  {selectedCandy.is_surprise && !selectedCandy.is_revealed
                    ? "Locked Surprise Date"
                    : selectedCandy.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandy(null)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedCandy.is_surprise && !selectedCandy.is_revealed ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                This date is in Surprise Mode. Details stay hidden until{" "}
                {selectedCandy.reveal_at
                  ? new Date(selectedCandy.reveal_at).toLocaleString()
                  : "the countdown finishes"}
                .
              </p>
            ) : (
              selectedCandy.description && (
                <p className="mt-3 text-sm text-neutral-700">
                  {selectedCandy.description}
                </p>
              )
            )}

            {selectedCandy.photos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Memories ({selectedCandy.photos.length})
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedCandy.photos.map((photo) => (
                    <figure
                      key={photo.id}
                      className="overflow-hidden rounded-lg border border-neutral-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image}
                        alt={photo.caption || selectedCandy.title}
                        className="h-32 w-full object-cover"
                      />
                      {photo.caption && (
                        <figcaption className="p-1.5 text-xs text-neutral-600">
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// --- Sub-Component: Create Candy Modal ---

interface CreateCandyModalProps {
  bowlId: number;
  categories: CandyCategory[];
  onClose: () => void;
}

function CreateCandyModal({
  bowlId,
  categories,
  onClose,
}: CreateCandyModalProps) {
  const createMutation = useCreateCandy();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCandyFormValues>({
    resolver: zodResolver(createCandySchema),
    defaultValues: {
      bowl: bowlId,
      title: "",
      description: "",
      category: null,
      status: "IN_BOWL",
      budget: "FREE",
      weather: "ANY",
      duration: "",
      start_date_time: "",
      is_surprise: false,
      reveal_at: "",
    },
  });

  const isSurprise = watch("is_surprise");

  const onSubmit = (values: CreateCandyFormValues) => {
    createMutation.mutate(
      {
        ...values,
        bowl: bowlId,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            Add New Candy Idea
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Title *
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="Stargazing picnic on Bogd Khan"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Description
            </label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Bring thermoses, blankets, and snacks..."
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Category
              </label>
              <select
                {...register("category", {
                  setValueAs: (val) => (val === "" ? null : Number(val)),
                })}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Duration
              </label>
              <input
                type="text"
                {...register("duration")}
                placeholder="e.g. 2 hours"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Budget
              </label>
              <select
                {...register("budget")}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="FREE">Free ($0)</option>
                <option value="LOW">$</option>
                <option value="MEDIUM">$$</option>
                <option value="HIGH">$$$</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700">
                Weather
              </label>
              <select
                {...register("weather")}
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                <option value="ANY">Any Weather</option>
                <option value="SUNNY">Sunny / Outdoor</option>
                <option value="RAINY">Rainy / Indoor</option>
                <option value="NIGHT">Evening / Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Planned Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              {...register("start_date_time")}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            {errors.start_date_time && (
              <p className="mt-1 text-xs text-red-600">
                {errors.start_date_time.message}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
              <input
                type="checkbox"
                {...register("is_surprise")}
                className="rounded border-neutral-300"
              />
              Surprise Date Mode (blur details until countdown ends)
            </label>

            {isSurprise && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-neutral-700">
                  Reveal Date & Time *
                </label>
                <input
                  type="datetime-local"
                  {...register("reveal_at")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
                {errors.reveal_at && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.reveal_at.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {createMutation.isError && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
              {createMutation.error.message || "Failed to create candy."}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Candy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Sub-Component: Post-Date Photo Upload Modal ---

interface UploadPhotoModalProps {
  candy: Candy;
  onClose: () => void;
}

function UploadPhotoModal({ candy, onClose }: UploadPhotoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const uploadMutation = useUploadCandyPhoto(candy.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setValidationError("Please choose an image file first.");
      return;
    }
    setValidationError(null);

    uploadMutation.mutate(
      { image: file, caption },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            Add Memory Photo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-1 text-xs text-neutral-500">
          Attaching photo to: <span className="font-medium">{candy.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Photo *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-neutral-800 hover:file:bg-neutral-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700">
              Caption (optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Best hot chocolate after the hike!"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          {(validationError || uploadMutation.isError) && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
              {validationError ||
                uploadMutation.error?.message ||
                "Upload failed."}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Upload Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}