import type { Metadata } from "next"

import { LegalDocumentPlaceholder } from "@/components/legal-document-placeholder"

export const metadata: Metadata = {
  title: "Privacy Policy | Rapi Mobile Mechanic",
  description: "Privacy Policy for Rapi Mobile Mechanic.",
  robots: { index: false, follow: false },
}

export default function PrivacyPolicyPage() {
  return <LegalDocumentPlaceholder title="Privacy Policy" documentName="Privacy Policy" />
}
