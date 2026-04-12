"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { Phone, Mail, Calendar, Database, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowTrigger {
  id: string
  name: string
  description: string
  icon: typeof Phone
  enabled: boolean
}

interface AutomationAction {
  id: string
  name: string
  description: string
  icon: typeof Mail
  enabled: boolean
}

const DEFAULT_TRIGGERS: WorkflowTrigger[] = [
  {
    id: "call_completed",
    name: "Call Completed",
    description: "Trigger when an AI call ends successfully",
    icon: Phone,
    enabled: true,
  },
  {
    id: "transcript_ready",
    name: "Transcript Ready",
    description: "Trigger when call transcription is available",
    icon: Database,
    enabled: true,
  },
  {
    id: "call_summary",
    name: "Call Summary Generated",
    description: "Trigger after AI generates call summary",
    icon: Zap,
    enabled: false,
  },
]

const DEFAULT_ACTIONS: AutomationAction[] = [
  {
    id: "send_followup_email",
    name: "Send Follow-up Email",
    description: "Automatically email prospects after calls",
    icon: Mail,
    enabled: true,
  },
  {
    id: "update_crm",
    name: "Update CRM Record",
    description: "Sync call data to your CRM",
    icon: Database,
    enabled: true,
  },
  {
    id: "book_meeting",
    name: "Book Meeting",
    description: "Schedule calendar meetings automatically",
    icon: Calendar,
    enabled: false,
  },
  {
    id: "trigger_outbound",
    name: "Trigger Outbound Call",
    description: "Initiate follow-up calls based on rules",
    icon: Phone,
    enabled: false,
  },
]

export function WorkflowStep() {
  const { nextStep, updateData, isLoading } = useWizard()
  
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>(DEFAULT_TRIGGERS)
  const [actions, setActions] = useState<AutomationAction[]>(DEFAULT_ACTIONS)

  const toggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const handleContinue = () => {
    updateData({
      workflow: {
        triggers: triggers
          .filter((t) => t.enabled)
          .map((t) => t.id as "PHONE_CALL_CONNECTED" | "TRANSCRIPT_COMPLETE" | "CALL_SUMMARY" | "PHONE_CALL_ENDED" | "LIVE_TRANSCRIPT" | "MANUAL" | "SCHEDULED"),
        automationRules: actions
          .filter((a) => a.enabled)
          .map((a) => ({
            id: a.id,
            name: a.name,
            condition: "always",
            action: a.id,
            enabled: true,
          })),
      },
    })
    nextStep()
  }

  const enabledTriggers = triggers.filter((t) => t.enabled)
  const enabledActions = actions.filter((a) => a.enabled)

  return (
    <WizardLayout
      title="Configure Your Workflow"
      subtitle="Set up automation triggers and actions for your AI agents."
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Triggers */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Triggers
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose events that start your automation workflows.
            </p>
            <div className="space-y-3">
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    trigger.enabled ? "border-primary/30 bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      trigger.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      <trigger.icon className={cn(
                        "w-4 h-4",
                        trigger.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trigger.name}</p>
                      <p className="text-xs text-muted-foreground">{trigger.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={trigger.enabled}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Actions
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select what happens when triggers are activated.
            </p>
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    action.enabled ? "border-primary/30 bg-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      action.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      <action.icon className={cn(
                        "w-4 h-4",
                        action.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.name}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={action.enabled}
                    onCheckedChange={() => toggleAction(action.id)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary */}
        {(enabledTriggers.length > 0 || enabledActions.length > 0) && (
          <Card className="mt-6 p-4 bg-muted/30">
            <h4 className="font-medium text-sm mb-2">Workflow Summary</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{enabledTriggers.length}</strong> triggers enabled
              </span>
              <ArrowRight className="w-4 h-4" />
              <span>
                <strong className="text-foreground">{enabledActions.length}</strong> actions configured
              </span>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </div>
      </div>
    </WizardLayout>
  )
}
