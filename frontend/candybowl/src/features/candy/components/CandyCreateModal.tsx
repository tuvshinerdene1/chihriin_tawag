// src/features/candy/components/CreateCandyModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";

import { useCreateCandy } from "../hooks/useCandies";
import {
  createCandySchema,
  type CreateCandyFormValues,
} from "../schemas/candy.schema";
import type { CandyCategory } from "../types/candy.types";

export interface CreateCandyModalProps {
  bowlId: number;
  categories: CandyCategory[];
  onClose: () => void;
}

export function CreateCandyModal({
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