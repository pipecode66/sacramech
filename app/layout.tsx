import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { I18nProvider } from '@/lib/i18n'
import './globals.css'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Rapi Mobile Mechanic | Mobile Mechanic Services',
  description: 'Appointment-based mobile vehicle diagnostics across approved California service areas. Rapi Mobile Mechanic comes to you.',
  icons: {
    icon: '/rapi-logo.jpeg',
    apple: '/rapi-logo.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <I18nProvider>
          {children}
          <Analytics />
        </I18nProvider>
      </body>
    </html>
  )
}
