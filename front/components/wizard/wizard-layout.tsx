"use client"

import { LogoIcon } from "@/components/ui/logo"
import { useWizard, type WizardStep } from "./wizard-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface WizardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showSteps?: boolean
  showBackButton?: boolean
}

const DISPLAY_STEPS: WizardStep[] = ["business", "tools", "workflow", "ai-agent", "report", "go-live"]

export function WizardLayout({
  children,
  title,
  subtitle,
  showSteps = true,
  showBackButton = true,
}: WizardLayoutProps) {
  const { currentStep, stepIndex, stepLabels, prevStep, canGoBack } = useWizard()

  // Calculate progress for display steps only (excluding welcome)
  const displayStepIndex = DISPLAY_STEPS.indexOf(currentStep)
  const showProgressBar = showSteps && currentStep !== "welcome"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <LogoIcon size="lg" />
          <Link 
            href="/help" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Help / Docs
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Step Progress Bar */}
        {showProgressBar && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {/* Back Button */}
              {showBackButton && canGoBack ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div className="w-12" />
              )}

              {/* Steps */}
              <div className="flex items-center gap-2">
                {DISPLAY_STEPS.map((step, index) => {
                  const isCompleted = displayStepIndex > index
                  const isCurrent = step === currentStep
                  const isPending = displayStepIndex < index

                  return (
                    <div key={step} className="flex items-center">
                      {/* Step Circle and Label */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full border-2 transition-all duration-200",
                            isCompleted && "bg-muted-foreground/50 border-muted-foreground/50",
                            isCurrent && "bg-primary border-primary ring-4 ring-primary/20",
                            isPending && "bg-transparent border-muted-foreground/30"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs mt-1 whitespace-nowrap",
                            isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {stepLabels[step]}
                        </span>
                      </div>

                      {/* Connector Line */}
                      {index < DISPLAY_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "w-12 h-0.5 mx-1 mb-5 transition-all duration-200",
                            displayStepIndex > index ? "bg-muted-foreground/50" : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Spacer for alignment */}
              <div className="w-12" />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
