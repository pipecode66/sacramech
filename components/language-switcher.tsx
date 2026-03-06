// components/language-switcher.tsx
"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "en" | "es")}
      className="border rounded px-2 py-1 text-sm bg-background"
    >
      <option value="en">🇺🇸 ENGLISH</option>
      <option value="es">🇪🇸 ESPAÑOL</option>
    </select>
  );
}