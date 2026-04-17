"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLogin, type Tenant } from "@/hooks/use-auth"
import { ArrowLeft, AlertCircle, Building2, ChevronRight, Plus } from "lucide-react"

export default function SelectOrganizationPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isSelecting, setIsSelecting] = useState<string | null>(null)

  const login = useLogin()

  useEffect(() => {
    const stored = sessionStorage.getItem("auth_tenants")
    if (!stored) {
      router.push("/login")
      return
    }
    const parsed: Tenant[] = JSON.parse(stored)
    setTenants(parsed)

    if (parsed.length === 1) {
      handleSelect(parsed[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (tenantId: string) => {
    setIsSelecting(tenantId)

    login.mutate(tenantId, {
      onSuccess: () => {
        sessionStorage.removeItem("auth_email")
        sessionStorage.removeItem("auth_tenants")
        router.push("/dashboard")
      },
      onError: () => {
        setIsSelecting(null)
      },
    })
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Choose a workspace</CardTitle>
            <CardDescription className="text-base">
              Select the workspace you want to access
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {login.isError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {login.error instanceof Error
                    ? login.error.message
                    : "Failed to select workspace. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            {tenants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No workspaces found</h3>
                <p className="text-muted-foreground mb-6">
                  {"You're not a member of any workspace yet."}
                </p>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a workspace
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleSelect(tenant.id)}
                      disabled={isSelecting !== null}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(tenant.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{tenant.slug}</p>
                      </div>

                      <div className="flex-shrink-0">
                        {isSelecting === tenant.id ? (
                          <Spinner className="h-5 w-5 text-primary" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Create a new workspace
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sign in with a different email
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
