"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { Check, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface IntegrationOption {
  id: string
  name: string
  logo: string
  description: string
  connected?: boolean
}

const CRM_OPTIONS: IntegrationOption[] = [
  { id: "hubspot", name: "HubSpot", logo: "/integrations/hubspot.svg", description: "Connect your HubSpot CRM" },
  { id: "zoho", name: "Zoho CRM", logo: "/integrations/zoho.svg", description: "Connect your Zoho CRM" },
  { id: "salesforce", name: "Salesforce", logo: "/integrations/salesforce.svg", description: "Connect your Salesforce" },
  { id: "none", name: "Skip for now", logo: "", description: "I'll connect later" },
]

const PHONE_OPTIONS: IntegrationOption[] = [
  { id: "twilio", name: "Twilio", logo: "/integrations/twilio.svg", description: "Use your Twilio account" },
  { id: "voxsun", name: "VoxSun", logo: "/integrations/voxsun.svg", description: "Use VoxSun for calls" },
  { id: "boostmydeal", name: "BoostMyDeal Numbers", logo: "/logo.svg", description: "Get new phone numbers" },
]

const EMAIL_OPTIONS: IntegrationOption[] = [
  { id: "smtp", name: "SMTP", logo: "/integrations/smtp.svg", description: "Configure SMTP server" },
  { id: "sendgrid", name: "SendGrid", logo: "/integrations/sendgrid.svg", description: "Use SendGrid API" },
  { id: "none", name: "Skip for now", logo: "", description: "I'll configure later" },
]

const CALENDAR_OPTIONS: IntegrationOption[] = [
  { id: "google", name: "Google Calendar", logo: "/integrations/google.svg", description: "Connect Google Calendar" },
  { id: "outlook", name: "Outlook Calendar", logo: "/integrations/outlook.svg", description: "Connect Outlook" },
  { id: "none", name: "Skip for now", logo: "", description: "I'll connect later" },
]

interface IntegrationSelectorProps {
  title: string
  options: IntegrationOption[]
  selected: string
  onSelect: (id: string) => void
  showConfig?: boolean
  configFields?: { key: string; label: string; type?: string; placeholder?: string }[]
  configValues?: Record<string, string>
  onConfigChange?: (key: string, value: string) => void
}

function IntegrationSelector({
  title,
  options,
  selected,
  onSelect,
  showConfig,
  configFields,
  configValues,
  onConfigChange,
}: IntegrationSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-primary/50",
              selected === option.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            {selected === option.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-success-foreground" />
              </div>
            )}
            {option.logo ? (
              <div className="w-8 h-8 mb-2 bg-muted rounded flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">
                  {option.name.charAt(0)}
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 mb-2" />
            )}
            <p className="font-medium text-sm text-foreground">{option.name}</p>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      {/* Configuration Fields */}
      {showConfig && selected && selected !== "none" && configFields && (
        <Card className="p-4 mt-4 bg-muted/30">
          <div className="space-y-4">
            {configFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={configValues?.[field.key] || ""}
                  onChange={(e) => onConfigChange?.(field.key, e.target.value)}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Test Connection
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export function ToolsStep() {
  const { nextStep, updateData, data, isLoading } = useWizard()
  
  const [selectedCRM, setSelectedCRM] = useState(data.tools?.crm?.provider || "")
  const [selectedPhone, setSelectedPhone] = useState(data.tools?.phoneSystem?.provider || "")
  const [selectedEmail, setSelectedEmail] = useState(data.tools?.email?.provider || "")
  const [selectedCalendar, setSelectedCalendar] = useState(data.tools?.calendar?.provider || "")
  
  const [crmConfig, setCrmConfig] = useState<Record<string, string>>({})
  const [emailConfig, setEmailConfig] = useState<Record<string, string>>({})

  const handleContinue = () => {
    updateData({
      tools: {
        crm: {
          provider: selectedCRM as "hubspot" | "zoho" | "salesforce" | "none",
          connected: selectedCRM !== "none",
        },
        phoneSystem: {
          provider: selectedPhone as "twilio" | "voxsun" | "none",
          phoneNumbers: [],
          connected: selectedPhone !== "",
        },
        email: {
          provider: selectedEmail as "smtp" | "sendgrid" | "none",
          connected: selectedEmail !== "none",
        },
        calendar: {
          provider: selectedCalendar as "google" | "outlook" | "none",
          connected: selectedCalendar !== "none",
        },
      },
    })
    nextStep()
  }

  const isValid = selectedPhone !== ""

  return (
    <WizardLayout
      title="Connect Your Tools"
      subtitle="Integrate your existing systems to enable AI-powered automation."
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* CRM Integration */}
        <Card className="p-6">
          <IntegrationSelector
            title="CRM Integration"
            options={CRM_OPTIONS}
            selected={selectedCRM}
            onSelect={setSelectedCRM}
            showConfig={selectedCRM === "hubspot" || selectedCRM === "zoho" || selectedCRM === "salesforce"}
            configFields={[
              { key: "apiKey", label: "API Key", type: "password", placeholder: "Enter your API key" },
            ]}
            configValues={crmConfig}
            onConfigChange={(key, value) => setCrmConfig((prev) => ({ ...prev, [key]: value }))}
          />
        </Card>

        {/* Phone System */}
        <Card className="p-6">
          <IntegrationSelector
            title="Phone System"
            options={PHONE_OPTIONS}
            selected={selectedPhone}
            onSelect={setSelectedPhone}
          />
        </Card>

        {/* Email */}
        <Card className="p-6">
          <IntegrationSelector
            title="Email Integration"
            options={EMAIL_OPTIONS}
            selected={selectedEmail}
            onSelect={setSelectedEmail}
            showConfig={selectedEmail === "smtp"}
            configFields={[
              { key: "host", label: "SMTP Host", placeholder: "smtp.example.com" },
              { key: "port", label: "Port", placeholder: "587" },
              { key: "username", label: "Username", placeholder: "your@email.com" },
              { key: "password", label: "Password", type: "password", placeholder: "Your password" },
            ]}
            configValues={emailConfig}
            onConfigChange={(key, value) => setEmailConfig((prev) => ({ ...prev, [key]: value }))}
          />
        </Card>

        {/* Calendar */}
        <Card className="p-6">
          <IntegrationSelector
            title="Calendar Integration"
            options={CALENDAR_OPTIONS}
            selected={selectedCalendar}
            onSelect={setSelectedCalendar}
          />
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <div />
          <Button
            onClick={handleContinue}
            disabled={!isValid || isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </div>
      </div>
    </WizardLayout>
  )
}
