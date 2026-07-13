import type { Metadata } from "next"

import { LegalDocumentPlaceholder } from "@/components/legal-document-placeholder"

export const metadata: Metadata = {
  title: "Terms of Service | Rapi Mobile Mechanic",
  description: "Terms of Service for Rapi Mobile Mechanic.",
  robots: { index: false, follow: false },
}

export default function TermsOfServicePage() {
  return <LegalDocumentPlaceholder title="Terms of Service" documentName="Terms of Service" />
}
