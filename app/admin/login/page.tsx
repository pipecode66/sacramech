import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LoginForm } from "@/components/admin/login-form"
import { getAdminSession } from "@/app/admin/actions"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export default async function AdminLoginPage() {
  const session = await getAdminSession()

  if (session) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio / Back to Home
          </Button>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <BrandLogo
              title="Rapi Mobile Mechanic"
              subtitle="Portal de Administración / Admin Portal"
              imageWrapperClassName="h-14 w-14"
              titleClassName="text-xl"
              subtitleClassName="text-sm"
              priority
            />
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  )
}
