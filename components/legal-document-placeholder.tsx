import Image from "next/image"
import Link from "next/link"

import { Header } from "@/components/header"
import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164 } from "@/lib/business"

interface LegalDocumentPlaceholderProps {
  title: string
  documentName: string
}

export function LegalDocumentPlaceholder({ title, documentName }: LegalDocumentPlaceholderProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-10 sm:py-14">
        <article className="mx-auto w-full max-w-3xl rounded-2xl border bg-card p-6 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-2xl border bg-background p-2">
              <Image src="/rapi-logo.jpeg" alt={`${BUSINESS_NAME} logo`} fill className="object-contain p-2" sizes="96px" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{BUSINESS_NAME}</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
          </div>

          <div className="min-h-72 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 sm:p-8">
            {/* Replace this block with the client-approved legal document before Twilio resubmission. */}
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              The final {documentName} content is pending client review and approval. This reserved area will be
              replaced with the complete document before the Toll-Free Verification request is resubmitted.
            </p>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>
              Questions: <a href={`tel:${BUSINESS_PHONE_E164}`} className="font-medium text-primary underline underline-offset-2">{BUSINESS_PHONE_DISPLAY}</a>
            </p>
            <Link href="/" className="mt-3 inline-block font-medium text-primary underline underline-offset-2">
              Return to booking
            </Link>
          </div>
        </article>
      </main>
    </div>
  )
}
