"use client"

import Link from "next/link"
import { User, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface HeaderProps {
  onLogoClick?: () => void
}

export function Header({ onLogoClick }: HeaderProps = {}) {
  const { locale, setLocale, t } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en")
  }

  const brandText = (
    <span className="block min-w-0 text-left">
      <span className="block truncate text-base font-black leading-tight text-foreground min-[380px]:text-lg sm:text-2xl">
        {t("header.title")}
      </span>
      <span className="hidden truncate text-xs font-medium tracking-[0.02em] text-muted-foreground sm:block">
        {t("header.subtitle")}
      </span>
    </span>
  )

  const brandClassName =
    "inline-flex min-w-0 max-w-[calc(100%-7rem)] shrink rounded-[1.15rem] border border-border/70 bg-background px-3 py-2 transition-all hover:-translate-y-0.5 sm:max-w-none sm:rounded-[1.5rem] sm:px-4"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background">
      <div className="container mx-auto flex min-w-0 items-center justify-between gap-2 overflow-hidden px-3 py-3 sm:gap-4 sm:px-4">
        {onLogoClick ? (
          <button type="button" onClick={onLogoClick} className={brandClassName} aria-label="Return to start">
            {brandText}
          </button>
        ) : (
          <Link href="/" className={brandClassName}>
            {brandText}
          </Link>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="flex items-center gap-1 bg-transparent px-2 text-[11px] font-medium sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <Globe className="h-4 w-4" />
            <span className="sm:hidden">{locale === "en" ? "ESP" : "ENG"}</span>
            <span className="hidden sm:inline">{locale === "en" ? "ESPA\u00d1OL" : "ENGLISH"}</span>
          </Button>
          <Link href="/admin/login">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Admin Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
