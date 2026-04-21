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
      className="gap-3.5"
      imageWrapperClassName="h-14 w-14 rounded-[1.6rem] border border-primary/20 shadow-[0_20px_46px_rgba(10,24,58,0.16)] sm:h-16 sm:w-16"
      titleClassName="text-xl font-black sm:text-2xl"
      subtitleClassName="text-[11px] font-medium tracking-[0.02em] sm:text-xs"
      priority
    />
  )

  const brandClassName =
    "rounded-[1.75rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,255,0.94))] px-2.5 py-1.5 shadow-[0_16px_34px_rgba(10,24,58,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(10,24,58,0.14)]"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/95 shadow-[0_12px_36px_rgba(10,24,58,0.06)] backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
        {onLogoClick ? (
          <button onClick={onLogoClick} className={brandClassName} aria-label="Return to start">
            {logoContent}
          </button>
        ) : (
          <Link href="/" className={brandClassName}>
            {logoContent}
          </Link>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 bg-transparent text-xs font-medium"
          >
            <Globe className="h-4 w-4" />
            {locale === "en" ? "ESPAÑOL" : "ENGLISH"}
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
