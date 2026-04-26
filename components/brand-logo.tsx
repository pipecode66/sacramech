"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  title?: string
  subtitle?: string
  className?: string
  imageWrapperClassName?: string
  titleClassName?: string
  subtitleClassName?: string
  priority?: boolean
}

export function BrandLogo({
  title = "Rapi Mobile Mechanic",
  subtitle,
  className,
  imageWrapperClassName,
  titleClassName,
  subtitleClassName,
  priority = false,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-background",
          imageWrapperClassName,
        )}
      >
        <Image
          src="/rapi-logo.jpeg"
          alt="Rapi Mobile Mechanic logo"
          fill
          priority={priority}
          className="object-contain p-1.5"
          sizes="64px"
        />
      </div>

      <div className="min-w-0">
        <p className={cn("truncate font-bold text-lg leading-tight text-foreground", titleClassName)}>{title}</p>
        {subtitle ? (
          <p className={cn("truncate text-xs text-muted-foreground", subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  )
}
