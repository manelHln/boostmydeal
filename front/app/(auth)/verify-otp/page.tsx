"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle } from "lucide-react"

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""))
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Get email from sessionStorage
    const storedEmail = sessionStorage.getItem("auth_email")
    if (!storedEmail) {
      router.push("/login")
      return
    }
    setEmail(storedEmail)
  }, [router])

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)
    setError(null)
    setResendSuccess(false)

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    
    if (pastedData) {
      const newOtp = [...otp]
      pastedData.split("").forEach((char, index) => {
        if (index < OTP_LENGTH) {
          newOtp[index] = char
        }
      })
      setOtp(newOtp)

      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex((digit) => digit === "")
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[OTP_LENGTH - 1]?.focus()
        // Auto-submit if all filled
        handleVerify(newOtp.join(""))
      }
    }
  }

  const handleVerify = async (otpCode: string) => {
    if (otpCode.length !== OTP_LENGTH) {
      setError("Please enter the complete verification code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.verifyOtp(email, otpCode)

      if (response.success && response.data?.tempToken) {
        // Store temp token for organization selection
        sessionStorage.setItem("auth_temp_token", response.data.tempToken)
        router.push("/select-organization")
      } else {
        setError(response.error?.message || "Invalid verification code. Please try again.")
        setOtp(new Array(OTP_LENGTH).fill(""))
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return

    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const response = await api.resendOtp(email)

      if (response.success) {
        setResendSuccess(true)
        setResendCooldown(RESEND_COOLDOWN)
        setOtp(new Array(OTP_LENGTH).fill(""))
        inputRefs.current[0]?.focus()
      } else {
        setError(response.error?.message || "Failed to resend code. Please try again.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : ""

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We sent a verification code to{" "}
              <span className="font-medium text-foreground">{maskedEmail}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert className="py-2 border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>A new code has been sent to your email.</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold"
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span>Verifying...</span>
              </div>
            )}

            {/* Resend */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {"Didn't receive the code?"}
              </p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-primary"
              >
                {isResending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend in {resendCooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend code
                  </>
                )}
              </Button>
            </div>

            {/* Back to login */}
            <div className="pt-4 border-t">
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
