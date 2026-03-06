"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  onChange?: (rating: number) => void
  className?: string
  size?: "sm" | "md"
}

export function RatingStars({ rating, onChange, className, size = "md" }: RatingStarsProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5"

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1
        const isActive = rating >= starValue

        if (!onChange) {
          return (
            <Star
              key={starValue}
              className={cn(sizeClass, isActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
            />
          )
        }

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            className="rounded-sm p-0.5 transition-transform hover:scale-105"
            aria-label={`Set rating to ${starValue}`}
          >
            <Star
              className={cn(sizeClass, isActive ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
            />
          </button>
        )
      })}
    </div>
  )
}
