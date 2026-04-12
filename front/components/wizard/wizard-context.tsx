"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { OnboardingData } from "@/lib/types"

export type WizardStep = 
  | "welcome"
  | "business"
  | "tools"
  | "workflow"
  | "ai-agent"
  | "report"
  | "go-live"

const STEPS: WizardStep[] = [
  "welcome",
  "business",
  "tools",
  "workflow",
  "ai-agent",
  "report",
  "go-live",
]

const STEP_LABELS: Record<WizardStep, string> = {
  "welcome": "Welcome",
  "business": "Business",
  "tools": "Tools",
  "workflow": "Workflow",
  "ai-agent": "AI Agent",
  "report": "Report",
  "go-live": "Go Live",
}

interface WizardContextType {
  currentStep: WizardStep
  stepIndex: number
  steps: WizardStep[]
  stepLabels: Record<WizardStep, string>
  data: Partial<OnboardingData>
  isLoading: boolean
  goToStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  updateData: (updates: Partial<OnboardingData>) => void
  canGoBack: boolean
  canGoNext: boolean
  isFirstStep: boolean
  isLastStep: boolean
  skipOnboarding: () => Promise<void>
  completeOnboarding: () => Promise<void>
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

interface WizardProviderProps {
  children: ReactNode
  initialStep?: WizardStep
  initialData?: Partial<OnboardingData>
}

export function WizardProvider({ 
  children, 
  initialStep = "welcome",
  initialData = {}
}: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep)
  const [data, setData] = useState<Partial<OnboardingData>>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const stepIndex = STEPS.indexOf(currentStep)
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex === STEPS.length - 1
  const canGoBack = stepIndex > 1 // Can't go back from welcome
  const canGoNext = stepIndex < STEPS.length - 1

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step)
  }, [])

  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(STEPS[stepIndex + 1])
    }
  }, [stepIndex, canGoNext])

  const prevStep = useCallback(() => {
    if (canGoBack) {
      setCurrentStep(STEPS[stepIndex - 1])
    }
  }, [stepIndex, canGoBack])

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }, [])

  const skipOnboarding = useCallback(async () => {
    setIsLoading(true)
    try {
      // In production, this would call api.skipOnboarding()
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = "/dashboard"
    } finally {
      setIsLoading(false)
    }
  }, [])

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true)
    try {
      // In production, this would call api.completeOnboarding()
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = "/dashboard"
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        stepIndex,
        steps: STEPS,
        stepLabels: STEP_LABELS,
        data,
        isLoading,
        goToStep,
        nextStep,
        prevStep,
        updateData,
        canGoBack,
        canGoNext,
        isFirstStep,
        isLastStep,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return context
}
