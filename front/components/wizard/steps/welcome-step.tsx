"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { Briefcase, Plug, MessageSquare, AlertTriangle } from "lucide-react"

const OVERVIEW_CARDS = [
  {
    icon: Briefcase,
    title: "Business Information",
    items: ["Industry, company size,", "sales goals"],
  },
  {
    icon: Plug,
    title: "Tools & Integrations",
    items: ["CRM, phone system,", "email & calendar"],
  },
  {
    icon: MessageSquare,
    title: "AI Behavior & Messaging",
    items: ["Call tone, email style,", "Automation rules"],
  },
]

export function WelcomeStep() {
  const { nextStep, skipOnboarding, isLoading } = useWizard()

  return (
    <WizardLayout
      title="Get Ready to Launch BoostMyDeal"
      subtitle="This guide setup takes about 15 minutes and well configure AI agents to match your sales workflow."
      showSteps={false}
      showBackButton={false}
    >
      <div className="max-w-4xl mx-auto">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {OVERVIEW_CARDS.map((card, index) => (
            <Card
              key={index}
              className={`p-6 text-center border transition-all duration-200 hover:shadow-md ${
                index === 1 ? "bg-info/5 border-info/20" : "bg-card"
              }`}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-lg ${index === 1 ? "bg-info/10" : "bg-muted"}`}>
                  <card.icon className={`w-6 h-6 ${index === 1 ? "text-info" : "text-muted-foreground"}`} />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-3">{card.title}</h3>
              <ul className="space-y-1">
                {card.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${index === 1 ? "bg-info" : "bg-muted-foreground/50"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Warning Notice */}
        <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg mb-8">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <p className="text-sm text-muted-foreground">
            You can pause and edit everything later. Nothing goes live without your confirmation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={nextStep}
            disabled={isLoading}
            className="px-8 py-6 text-base bg-primary hover:bg-primary/90"
          >
            Start Setup
          </Button>
          <button
            onClick={skipOnboarding}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {"I'll gather this information later"}
          </button>
        </div>
      </div>
    </WizardLayout>
  )
}
