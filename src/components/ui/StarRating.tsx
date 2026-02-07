"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              "focus:outline-none",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
          >
            <Star
              size={size}
              className={cn(
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : halfFilled
                  ? "fill-yellow-200 text-yellow-400"
                  : "fill-gray-200 text-gray-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
