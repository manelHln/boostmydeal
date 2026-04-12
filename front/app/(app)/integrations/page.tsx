"use client"

import { useState } from "react"
import { Search, Check, X, ExternalLink, Settings, RefreshCw, Plug, Database, Mail, Calendar, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface Integration {
  id: string
  name: string
  description: string
  category: "crm" | "phone" | "email" | "calendar" | "other"
  icon: string
  status: "connected" | "disconnected" | "error"
  lastSync?: string
  features: string[]
}

const integrations: Integration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts, deals, and activities with HubSpot CRM",
    category: "crm",
    icon: "/integrations/hubspot.svg",
    status: "connected",
    lastSync: "5 minutes ago",
    features: ["Contact sync", "Deal sync", "Activity logging", "Workflow triggers"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect your Salesforce CRM for bi-directional sync",
    category: "crm",
    icon: "/integrations/salesforce.svg",
    status: "disconnected",
    features: ["Contact sync", "Opportunity sync", "Task creation", "Custom fields"],
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Integrate with Zoho CRM for complete automation",
    category: "crm",
    icon: "/integrations/zoho.svg",
    status: "disconnected",
    features: ["Contact sync", "Deal sync", "Call logging", "Email tracking"],
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Sync your Pipedrive deals and contacts",
    category: "crm",
    icon: "/integrations/pipedrive.svg",
    status: "disconnected",
    features: ["Contact sync", "Deal sync", "Activity logging"],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Use Twilio for voice calls and SMS messaging",
    category: "phone",
    icon: "/integrations/twilio.svg",
    status: "connected",
    lastSync: "Active",
    features: ["Voice calls", "SMS", "Phone number management"],
  },
  {
    id: "vonage",
    name: "Vonage",
    description: "Connect Vonage for voice and messaging",
    category: "phone",
    icon: "/integrations/vonage.svg",
    status: "disconnected",
    features: ["Voice calls", "SMS", "Video"],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Send and track emails through Gmail",
    category: "email",
    icon: "/integrations/gmail.svg",
    status: "connected",
    lastSync: "2 minutes ago",
    features: ["Send emails", "Email tracking", "Template sync"],
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Integrate with Outlook for email and calendar",
    category: "email",
    icon: "/integrations/outlook.svg",
    status: "disconnected",
    features: ["Send emails", "Calendar sync", "Contact sync"],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Send transactional and marketing emails",
    category: "email",
    icon: "/integrations/sendgrid.svg",
    status: "disconnected",
    features: ["Transactional emails", "Templates", "Analytics"],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync meetings and availability with Google Calendar",
    category: "calendar",
    icon: "/integrations/google-calendar.svg",
    status: "connected",
    lastSync: "Just now",
    features: ["Meeting scheduling", "Availability sync", "Event creation"],
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Use Calendly for automated meeting scheduling",
    category: "calendar",
    icon: "/integrations/calendly.svg",
    status: "disconnected",
    features: ["Meeting links", "Availability", "Reminders"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications and updates in Slack",
    category: "other",
    icon: "/integrations/slack.svg",
    status: "connected",
    lastSync: "Active",
    features: ["Notifications", "Call summaries", "Team alerts"],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5000+ apps via Zapier",
    category: "other",
    icon: "/integrations/zapier.svg",
    status: "disconnected",
    features: ["Custom workflows", "Triggers", "Actions"],
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Send data to any endpoint via webhooks",
    category: "other",
    icon: "/integrations/webhook.svg",
    status: "connected",
    lastSync: "Active",
    features: ["Custom events", "Real-time data", "Flexible payload"],
  },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "crm":
      return <Database className="h-4 w-4" />
    case "phone":
      return <Phone className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    case "calendar":
      return <Calendar className="h-4 w-4" />
    default:
      return <Plug className="h-4 w-4" />
  }
}

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const connectedCount = integrations.filter(i => i.status === "connected").length

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConfigDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite tools and services</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {connectedCount} of {integrations.length} connected
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CRM</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.category === "crm" && i.status === "connected").length}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.category === "phone" && i.status === "connected").length}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.category === "email" && i.status === "connected").length}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calendar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.category === "calendar" && i.status === "connected").length}
            </div>
            <p className="text-xs text-muted-foreground">Connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    {getCategoryIcon(integration.category)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {integration.status === "connected" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      ) : integration.status === "error" ? (
                        <Badge variant="destructive">
                          <X className="mr-1 h-3 w-3" />
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Disconnected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {integration.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {integration.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {integration.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{integration.features.length - 3} more
                  </Badge>
                )}
              </div>
              {integration.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {integration.lastSync}
                </p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t">
                {integration.status === "connected" ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="mr-2 h-3 w-3" />
                      Configure
                    </Button>
                    <Button size="sm" variant="ghost">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConnect(integration)}
                  >
                    <Plug className="mr-2 h-3 w-3" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedIntegration?.category === "crm" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instance-url">Instance URL (optional)</Label>
                  <Input id="instance-url" placeholder="https://your-instance.hubspot.com" />
                </div>
              </>
            )}
            {selectedIntegration?.category === "phone" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="account-sid">Account SID</Label>
                  <Input id="account-sid" placeholder="Enter your Account SID" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="auth-token">Auth Token</Label>
                  <Input id="auth-token" type="password" placeholder="Enter your Auth Token" />
                </div>
              </>
            )}
            {selectedIntegration?.category === "email" && (
              <div className="flex flex-col items-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click below to authenticate with your {selectedIntegration.name} account
                </p>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Sign in with {selectedIntegration.name}
                </Button>
              </div>
            )}
            {selectedIntegration?.category === "calendar" && (
              <div className="flex flex-col items-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your calendar to sync meetings and availability
                </p>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect {selectedIntegration.name}
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label>Enable auto-sync</Label>
                <p className="text-xs text-muted-foreground">Sync data automatically every 5 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConfigDialogOpen(false)}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
