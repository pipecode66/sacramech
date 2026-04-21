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

  const logoContent = <BrandLogo title={t("header.title")} subtitle={t("header.subtitle")} priority />

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/95 shadow-[0_10px_35px_rgba(10,24,58,0.06)] backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {onLogoClick ? (
          <button
            onClick={onLogoClick}
            className="cursor-pointer transition-opacity hover:opacity-85"
            aria-label="Return to start"
          >
            {logoContent}
          </button>
        ) : (
          <Link href="/" className="transition-opacity hover:opacity-85">
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
            <Globe className="w-4 h-4" />
            {locale === "en" ? "ESPAÑOL" : "ENGLISH"}
          </Button>
          <Link href="/admin/login">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="w-5 h-5" />
              <span className="sr-only">Admin Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
