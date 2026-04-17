"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Phone, Play, Pause, Settings, Trash2, Copy, BarChart3, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentForm } from "@/components/agents/agent-form"
import type { AIAgent, AgentFormData } from "@/lib/types"

// Mock agents data
const mockAgents: AIAgent[] = [
  {
    id: "1",
    organizationId: "org1",
    name: "Sales Outreach Agent",
    description: "Handles initial outbound calls to qualified leads",
    language: "en",
    languages: ["en"],
    modelProvider: "ChatGPT",
    aiModel: "gpt-4o-mini",
    phoneNumberId: "1",
    firstMessage: "Hi! This is Sarah from Acme Corp. How are you doing today?",
    userSpeaksFirst: false,
    workflowIds: ["1"],
    systemPrompt: "**Identity:** You are Sarah, a friendly sales representative.\n**Style:** Warm, professional, and concise.\n**Goals:** Qualify leads and schedule demos.\n**Response Guidelines:** Keep responses short.\n**Error Handling/Fallback:** Offer to transfer to a human.",
    voiceProvider: "ElevenLabs",
    transcriber: "Deepgram",
    voice: "rachel",
    knowledgeBase: ["1"],
    speed: 1.0,
    callRecording: true,
    callRecordingFormat: "mp3",
    rememberLeadPreference: true,
    voicemailDetection: true,
    voicemailMessage: "Hi, this is Sarah from Acme Corp. Please call us back.",
    enableCallTransfer: true,
    transferPhoneNumber: "+1 555-123-4567",
    keyboardSound: false,
    temperature: 0.7,
    maxTokens: 1000,
    userTags: ["high_value", "enterprise"],
    systemTags: ["interested", "demo_scheduled"],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "2",
    organizationId: "org1",
    name: "Appointment Setter",
    description: "Books meetings and demos with interested prospects",
    language: "en",
    languages: ["en"],
    modelProvider: "ChatGPT",
    aiModel: "gpt-4o",
    phoneNumberId: "2",
    firstMessage: "Hello! I am calling to help you schedule a demo. Do you have a few minutes?",
    userSpeaksFirst: false,
    workflowIds: ["2"],
    systemPrompt: "**Identity:** You are an appointment setter.\n**Style:** Efficient and friendly.\n**Goals:** Book demos.\n**Response Guidelines:** Be direct.\n**Error Handling/Fallback:** Offer alternatives.",
    voiceProvider: "ElevenLabs",
    transcriber: "Deepgram",
    voice: "josh",
    knowledgeBase: [],
    speed: 1.1,
    callRecording: true,
    callRecordingFormat: "mp3",
    rememberLeadPreference: true,
    voicemailDetection: true,
    voicemailMessage: "Hi, we tried to reach you about scheduling a demo. Please call us back.",
    enableCallTransfer: false,
    transferPhoneNumber: "",
    keyboardSound: false,
    temperature: 0.5,
    maxTokens: 800,
    userTags: [],
    systemTags: ["demo_scheduled"],
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-25T15:30:00Z",
  },
  {
    id: "3",
    organizationId: "org1",
    name: "Lead Qualifier",
    description: "Qualifies inbound leads and gathers information",
    language: "en",
    languages: ["en", "es"],
    modelProvider: "Gemini Live",
    aiModel: "gemini-2.0-flash-live-preview",
    phoneNumberId: "1",
    firstMessage: "Thank you for your interest! I have a few quick questions to better understand your needs.",
    userSpeaksFirst: true,
    workflowIds: ["1", "2"],
    systemPrompt: "**Identity:** You are a lead qualifier.\n**Style:** Curious and helpful.\n**Goals:** Gather lead information.\n**Response Guidelines:** Ask open-ended questions.\n**Error Handling/Fallback:** Clarify confusion.",
    voiceProvider: "ElevenLabs",
    transcriber: "OpenAI Whisper",
    voice: "sarah",
    geminiLiveVoice: "Athena",
    knowledgeBase: ["1", "2"],
    speed: 1.0,
    callRecording: true,
    callRecordingFormat: "wav",
    rememberLeadPreference: true,
    voicemailDetection: false,
    voicemailMessage: "",
    enableCallTransfer: true,
    transferPhoneNumber: "+1 555-987-6543",
    keyboardSound: true,
    temperature: 0.8,
    maxTokens: 1200,
    userTags: ["qualification"],
    systemTags: ["qualified", "hot_lead"],
    status: "inactive",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-10T15:30:00Z",
  },
  {
    id: "4",
    organizationId: "org1",
    name: "Re-engagement Agent",
    description: "Reaches out to cold leads to re-engage them",
    language: "en",
    languages: ["en"],
    modelProvider: "ChatGPT",
    aiModel: "gpt-4o-mini",
    firstMessage: "Hi! We noticed you were interested in our services a while back. Has anything changed?",
    userSpeaksFirst: false,
    workflowIds: [],
    systemPrompt: "",
    voiceProvider: "Rime",
    transcriber: "Deepgram",
    voice: "mist",
    knowledgeBase: [],
    speed: 1.0,
    callRecording: false,
    callRecordingFormat: "mp3",
    rememberLeadPreference: false,
    voicemailDetection: true,
    voicemailMessage: "Hi, we wanted to reconnect with you. Please call us back!",
    enableCallTransfer: false,
    transferPhoneNumber: "",
    keyboardSound: false,
    temperature: 0.7,
    maxTokens: 1000,
    userTags: [],
    systemTags: [],
    status: "draft",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
]

// Stats calculation
function calculateStats(agents: AIAgent[]) {
  const active = agents.filter(a => a.status === "active").length
  const total = agents.length
  // Mock call data
  const callsToday = 234
  const avgSuccessRate = 76

  return { total, active, callsToday, avgSuccessRate }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<AIAgent | undefined>(undefined)
  const [deletingAgent, setDeletingAgent] = useState<AIAgent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const stats = calculateStats(agents)

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesStatus = selectedStatus === "all" || agent.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "inactive":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "draft":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent => {
      if (agent.id === agentId && agent.status !== "draft") {
        return {
          ...agent,
          status: agent.status === "active" ? "inactive" : "active"
        }
      }
      return agent
    }))
  }

  const handleCreateAgent = () => {
    setEditingAgent(undefined)
    setIsFormOpen(true)
  }

  const handleEditAgent = (agent: AIAgent) => {
    setEditingAgent(agent)
    setIsFormOpen(true)
  }

  const handleDuplicateAgent = (agent: AIAgent) => {
    const newAgent: AIAgent = {
      ...agent,
      id: `${Date.now()}`,
      name: `${agent.name} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setAgents([...agents, newAgent])
  }

  const handleDeleteAgent = (agent: AIAgent) => {
    setDeletingAgent(agent)
  }

  const confirmDelete = () => {
    if (deletingAgent) {
      setAgents(agents.filter(a => a.id !== deletingAgent.id))
      setDeletingAgent(null)
    }
  }

  const handleFormSubmit = async (data: AgentFormData) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingAgent) {
      // Update existing agent
      setAgents(agents.map(agent => {
        if (agent.id === editingAgent.id) {
          return {
            ...agent,
            ...data,
            languages: [data.language],
            updatedAt: new Date().toISOString(),
          }
        }
        return agent
      }))
    } else {
      // Create new agent
      const newAgent: AIAgent = {
        id: `${Date.now()}`,
        organizationId: "org1",
        ...data,
        languages: [data.language],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setAgents([...agents, newAgent])
    }

    setIsLoading(false)
    setIsFormOpen(false)
    setEditingAgent(undefined)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingAgent(undefined)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI voice agents</p>
        </div>
        <Button onClick={handleCreateAgent} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.callsToday}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">Across all agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === "draft").length} in draft
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <Badge variant="secondary" className={`mt-1 ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateAgent(agent)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteAgent(agent)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-2 line-clamp-2">
                {agent.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p className="font-medium">{agent.aiModel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Voice</p>
                  <p className="font-medium capitalize">
                    {agent.modelProvider === "Gemini Live"
                      ? agent.geminiLiveVoice
                      : agent.voice || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {agent.systemTags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize">
                    {tag.replace(/_/g, " ")}
                  </Badge>
                ))}
                {agent.systemTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{agent.systemTags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={agent.status === "active"}
                    onCheckedChange={() => toggleAgentStatus(agent.id)}
                    disabled={agent.status === "draft"}
                  />
                  <span className="text-sm text-muted-foreground">
                    {agent.status === "active" ? "Active" : agent.status === "draft" ? "Draft" : "Inactive"}
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEditAgent(agent)}>
                  <Settings className="mr-2 h-3 w-3" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No agents found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? "Try adjusting your search" : "Create your first AI agent to get started"}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={handleCreateAgent}>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          )}
        </Card>
      )}

      {/* Agent Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
          <AgentForm
            agent={editingAgent}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAgent} onOpenChange={() => setDeletingAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingAgent?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
