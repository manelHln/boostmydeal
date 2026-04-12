"use client"

import { WizardProvider, useWizard } from "./wizard-context"
import { WelcomeStep } from "./steps/welcome-step"
import { BusinessStep } from "./steps/business-step"
import { ToolsStep } from "./steps/tools-step"
import { WorkflowStep } from "./steps/workflow-step"
import { AIAgentStep } from "./steps/ai-agent-step"
import { ReportStep } from "./steps/report-step"
import { GoLiveStep } from "./steps/go-live-step"

function WizardContent() {
  const { currentStep } = useWizard()

  switch (currentStep) {
    case "welcome":
      return <WelcomeStep />
    case "business":
      return <BusinessStep />
    case "tools":
      return <ToolsStep />
    case "workflow":
      return <WorkflowStep />
    case "ai-agent":
      return <AIAgentStep />
    case "report":
      return <ReportStep />
    case "go-live":
      return <GoLiveStep />
    default:
      return <WelcomeStep />
  }
}

export function OnboardingWizard() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}

export { WizardProvider, useWizard }
