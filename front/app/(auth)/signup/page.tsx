"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/ui/logo"
import { useSignup, useSendOtp } from "@/hooks/use-auth"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const signupSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationSlug: z
    .string()
    .min(1, "Organization slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "At least 6 characters")
    .regex(/\d/, "At least 1 number")
    .regex(/[!@#$%^&*(),.?":{}]/, 'At least 1 special character (!@#$%^&*(),.?":{}|<>)'),
  phone: z.string().optional(),
  website: z.string().optional(),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const signup = useSignup()
  const sendOtp = useSendOtp()

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      organizationName: "",
      organizationSlug: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      website: "",
    },
  })

  const password = form.watch("password")
  const passwordValidation = {
    minLength: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}]/.test(password),
  }

  const handleOrgNameChange = (value: string, onChange: (v: string) => void) => {
    onChange(value)
    if (!slugManuallyEdited) {
      form.setValue("organizationSlug", generateSlug(value), { shouldValidate: false })
    }
  }

  const onSubmit = (values: SignupFormValues) => {
    signup.mutate(
      {
        name: values.organizationName,
        slug: values.organizationSlug,
        email: values.email,
        password: values.password,
        first_Name: values.firstName,
        last_Name: values.lastName,
        phone: values.phone || undefined,
        website: values.website || undefined,
      },
      {
        onSuccess: (data) => {
          sendOtp.mutate(data.email, {
            onSuccess: () => {
              sessionStorage.setItem("auth_email", data.email)
              router.push("/verify-otp")
            },
          })
        },
      }
    )
  }

  const isLoading = signup.isPending || sendOtp.isPending
  const apiError =
    (signup.isError && signup.error instanceof Error ? signup.error.message : null) ??
    (sendOtp.isError && sendOtp.error instanceof Error ? sendOtp.error.message : null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription className="mt-2">
              Get started with BoostMyDeal in minutes
            </CardDescription>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {apiError && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Organization */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Organization</h3>

                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Inc."
                          {...field}
                          onChange={(e) => handleOrgNameChange(e.target.value, field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">boostmydeal.com/</span>
                          <Input
                            placeholder="acme-inc"
                            className="flex-1"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                              field.onChange(value)
                              setSlugManuallyEdited(true)
                            }}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Auto-generated from organization name. You can edit it manually.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            className="pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="mt-2 space-y-1">
                        {[
                          { ok: passwordValidation.minLength, label: "At least 6 characters" },
                          { ok: passwordValidation.hasNumber, label: "At least 1 number" },
                          { ok: passwordValidation.hasSpecial, label: 'At least 1 special character (!@#$%^&*(),.?":{}|<>)' },
                        ].map(({ ok, label }) => (
                          <div key={label} className="flex items-center gap-2 text-xs">
                            {ok ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className={ok ? "text-green-600" : "text-muted-foreground"}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Optional</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {signup.isPending ? "Creating account..." : "Sending code..."}
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
