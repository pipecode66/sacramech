"use client"

import Link from "next/link"
import { User, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { BrandLogo } from "@/components/brand-logo"

interface HeaderProps {
  onLogoClick?: () => void
}

export function Header({ onLogoClick }: HeaderProps = {}) {
  const { locale, setLocale, t } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en")
  }

  const logoContent = (
    <BrandLogo
      title={t("header.title")}
      subtitle={t("header.subtitle")}
      className="min-w-0 gap-2.5 sm:gap-3.5"
      imageWrapperClassName="h-12 w-12 rounded-[1.25rem] border border-primary/20 sm:h-16 sm:w-16 sm:rounded-[1.6rem]"
      titleClassName="text-[12px] font-black min-[360px]:text-[13px] min-[400px]:text-sm sm:text-2xl"
      subtitleClassName="hidden text-[11px] font-medium tracking-[0.02em] sm:block sm:text-xs"
      priority
    />
  )

  const brandClassName =
    "inline-flex min-w-0 max-w-[calc(100%-7rem)] shrink-0 rounded-[1.25rem] border border-border/70 bg-background px-2 py-1.5 transition-all hover:-translate-y-0.5 sm:max-w-none sm:rounded-[1.75rem] sm:px-2.5"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background">
      <div className="container mx-auto flex min-w-0 items-center justify-between gap-2 overflow-hidden px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
        {onLogoClick ? (
          <button onClick={onLogoClick} className={brandClassName} aria-label="Return to start">
            {logoContent}
          </button>
        ) : (
          <Link href="/" className={brandClassName}>
            {logoContent}
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
