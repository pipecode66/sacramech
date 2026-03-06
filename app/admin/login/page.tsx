import { redirect } from "next/navigation"
import Link from "next/link"
import { LoginForm } from "@/components/admin/login-form"
import { getAdminSession } from "@/app/admin/actions"
import { Wrench, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLoginPage() {
  const session = await getAdminSession()

  if (session) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Inicio / Back to Home
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Rapi Mobile Mechanic</h1>
                <p className="text-sm text-muted-foreground">Portal de Administración / Admin Portal</p>
              </div>
            </div>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  )
}
