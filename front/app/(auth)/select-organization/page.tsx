"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { ArrowLeft, AlertCircle, Building2, Users, ChevronRight, Plus } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  role: string
  memberCount: number
}

export default function SelectOrganizationPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSelecting, setIsSelecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tempToken, setTempToken] = useState<string>("")

  useEffect(() => {
    const storedToken = sessionStorage.getItem("auth_temp_token")
    if (!storedToken) {
      router.push("/login")
      return
    }
    setTempToken(storedToken)
    fetchOrganizations(storedToken)
  }, [router])

  const fetchOrganizations = async (token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.getUserOrganizations(token)

      if (response.success && response.data?.organizations) {
        setOrganizations(response.data.organizations)
        
        // If only one organization, auto-select it
        if (response.data.organizations.length === 1) {
          handleSelectOrganization(response.data.organizations[0].id, token)
        }
      } else {
        setError(response.error?.message || "Failed to load organizations")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectOrganization = async (organizationId: string, token?: string) => {
    const authToken = token || tempToken
    setIsSelecting(organizationId)
    setError(null)

    try {
      const response = await api.selectOrganization(authToken, organizationId)

      if (response.success && response.data) {
        // Clear temp auth data
        sessionStorage.removeItem("auth_email")
        sessionStorage.removeItem("auth_temp_token")

        // Check onboarding status and redirect accordingly
        const { onboarding, redirectTo } = response.data

        if (redirectTo) {
          router.push(redirectTo)
        } else if (onboarding && !onboarding.completed) {
          // Redirect to wizard with the current step
          const step = onboarding.currentStep || 0
          router.push(step > 0 ? `/wizard?step=${step}` : "/wizard")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError(response.error?.message || "Failed to select organization")
        setIsSelecting(null)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsSelecting(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
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
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-muted-foreground">Loading workspaces...</p>
              </div>
            ) : organizations.length === 0 ? (
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
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrganization(org.id)}
                      disabled={isSelecting !== null}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Avatar className="h-12 w-12">
                        {org.logo ? (
                          <AvatarImage src={org.logo} alt={org.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(org.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{org.name}</h3>
                          <Badge variant={getRoleBadgeVariant(org.role)} className="text-xs capitalize">
                            {org.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="truncate">{org.slug}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isSelecting === org.id ? (
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

            {/* Back to login */}
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
