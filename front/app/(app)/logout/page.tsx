"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LogoIcon } from "@/components/ui/logo"
import { Spinner } from "@/components/ui/spinner"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulate logout process
    const timer = setTimeout(() => {
      // In a real app, clear auth tokens/cookies here
      router.push("/wizard")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <LogoIcon size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Signing out...</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Thanks for using BoostMyDeal. See you soon!
          </p>
          <Spinner className="mx-auto" />
        </CardContent>
      </Card>
    </div>
  )
}
