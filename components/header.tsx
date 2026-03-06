"use client"

import Link from "next/link"
import { Wrench, User, Globe } from "lucide-react"
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

  const logoContent = (
    <>
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Wrench className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h1 className="font-bold text-lg text-foreground">{t("header.title")}</h1>
        <p className="text-xs text-muted-foreground">{t("header.subtitle")}</p>
      </div>
    </>
  )

  return (
    <header className="w-full border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {onLogoClick ? (
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Return to start"
          >
            {logoContent}
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2">
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
