"use client"

import Link from "next/link"
import { User, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function Header() {
  const { locale, setLocale } = useI18n()

  const toggleLocale = () => {
    setLocale(locale === "en" ? "es" : "en")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background">
      <div className="container mx-auto flex min-w-0 items-center justify-end gap-2 overflow-hidden px-3 py-3 sm:gap-4 sm:px-4">
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
