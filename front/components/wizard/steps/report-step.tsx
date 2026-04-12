"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { BarChart3, Mail, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const METRICS = [
  { id: "total_calls", name: "Total Calls", description: "Number of calls made" },
  { id: "success_rate", name: "Success Rate", description: "Percentage of successful calls" },
  { id: "avg_duration", name: "Average Duration", description: "Average call length" },
  { id: "meetings_booked", name: "Meetings Booked", description: "Calendar meetings scheduled" },
  { id: "emails_sent", name: "Emails Sent", description: "Follow-up emails delivered" },
  { id: "crm_updates", name: "CRM Updates", description: "Records synced to CRM" },
]

const FREQUENCIES = [
  { id: "daily", name: "Daily", description: "Every day at 9 AM" },
  { id: "weekly", name: "Weekly", description: "Every Monday morning" },
  { id: "monthly", name: "Monthly", description: "First day of each month" },
]

export function ReportStep() {
  const { nextStep, updateData, data, isLoading } = useWizard()
  
  const [emailReports, setEmailReports] = useState(data.reporting?.emailReports ?? true)
  const [frequency, setFrequency] = useState(data.reporting?.reportFrequency || "weekly")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(
    data.reporting?.metrics || ["total_calls", "success_rate", "avg_duration"]
  )

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    )
  }

  const handleContinue = () => {
    updateData({
      reporting: {
        emailReports,
        reportFrequency: frequency as "daily" | "weekly" | "monthly",
        metrics: selectedMetrics,
      },
    })
    nextStep()
  }

  return (
    <WizardLayout
      title="Set Your Reporting Preferences"
      subtitle="Configure how you want to receive performance reports and analytics."
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Reports Toggle */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Email Reports</h3>
                  <Switch
                    checked={emailReports}
                    onCheckedChange={setEmailReports}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive automated performance summaries directly in your inbox.
                </p>
              </div>
            </div>

            {emailReports && (
              <div className="mt-6 space-y-3">
                <Label>Report Frequency</Label>
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => setFrequency(freq.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                      frequency === freq.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Clock className={cn(
                      "w-4 h-4",
                      frequency === freq.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <p className="font-medium text-sm">{freq.name}</p>
                      <p className="text-xs text-muted-foreground">{freq.description}</p>
                    </div>
                    {frequency === freq.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Metrics Selection */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Dashboard Metrics</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which metrics to display on your dashboard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {METRICS.map((metric) => {
                const isSelected = selectedMetrics.includes(metric.id)
                return (
                  <button
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div>
                      <p className="font-medium text-sm">{metric.name}</p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && (
                        <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedMetrics.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Select at least one metric to display on your dashboard.
              </p>
            )}
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-6 p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Report Configuration</p>
              <p className="text-xs text-muted-foreground">
                {emailReports
                  ? `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} email reports with ${selectedMetrics.length} metrics`
                  : "Email reports disabled"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedMetrics.length} metrics selected
              </span>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={selectedMetrics.length === 0 || isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </div>
      </div>
    </WizardLayout>
  )
}
