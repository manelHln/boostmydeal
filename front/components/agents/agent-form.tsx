"use client"

import { useState, useEffect } from "react"
import { X, Info, Plus, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import type { AgentFormData, AIAgent, Voice, PhoneNumber, Workflow, KnowledgeBase } from "@/lib/types"
import { AI_MODELS, SYSTEM_TAGS, GEMINI_VOICES, RIME_VOICES } from "@/lib/types"

interface AgentFormProps {
  agent?: AIAgent
  onSubmit: (data: AgentFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const defaultFormData: AgentFormData = {
  // Tab 1: Basics
  name: "",
  description: "",
  language: "en",
  modelProvider: "ChatGPT",
  aiModel: "gpt-4o-mini",
  phoneNumberId: "",
  firstMessage: "Hello! How can I help you today?",
  userSpeaksFirst: false,
  workflowIds: [],
  
  // Tab 2: Persona
  identity: "",
  style: "",
  goals: "",
  responseGuidelines: "",
  errorHandling: "",
  
  // Tab 3: Media & Knowledge
  voiceProvider: "ElevenLabs",
  transcriber: "Deepgram",
  voice: "",
  geminiLiveVoice: "Puck",
  knowledgeBase: [],
  speed: 1.0,
  
  // Tab 4: Settings
  callRecording: true,
  callRecordingFormat: "mp3",
  rememberLeadPreference: true,
  voicemailDetection: true,
  voicemailMessage: "Hi, this is an automated message. Please call us back at your earliest convenience.",
  enableCallTransfer: false,
  transferPhoneNumber: "",
  keyboardSound: false,
  temperature: 0.7,
  maxTokens: 1000,
  
  // Tab 5: Post Call Analysis
  userTags: [],
  systemTags: [],
}

// Parse systemPrompt back into persona fields
function parseSystemPrompt(systemPrompt: string): Partial<AgentFormData> {
  const fields: Partial<AgentFormData> = {}
  
  const patterns = {
    identity: /\*\*Identity:\*\*\s*([\s\S]*?)(?=\*\*Style:|$)/i,
    style: /\*\*Style:\*\*\s*([\s\S]*?)(?=\*\*Goals:|$)/i,
    goals: /\*\*Goals:\*\*\s*([\s\S]*?)(?=\*\*Response Guidelines:|$)/i,
    responseGuidelines: /\*\*Response Guidelines:\*\*\s*([\s\S]*?)(?=\*\*Error Handling\/Fallback:|$)/i,
    errorHandling: /\*\*Error Handling\/Fallback:\*\*\s*([\s\S]*?)$/i,
  }
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = systemPrompt.match(pattern)
    if (match) {
      fields[key as keyof AgentFormData] = match[1].trim() as never
    }
  }
  
  return fields
}

// Concatenate persona fields into systemPrompt
function buildSystemPrompt(data: AgentFormData): string {
  return `**Identity:** ${data.identity}
**Style:** ${data.style}
**Goals:** ${data.goals}
**Response Guidelines:** ${data.responseGuidelines}
**Error Handling/Fallback:** ${data.errorHandling}`
}

export function AgentForm({ agent, onSubmit, onCancel, isLoading }: AgentFormProps) {
  const [activeTab, setActiveTab] = useState("basics")
  const [formData, setFormData] = useState<AgentFormData>(defaultFormData)
  const [newTag, setNewTag] = useState("")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  
  // Mock data - in real app these would come from API
  const [phoneNumbers] = useState<PhoneNumber[]>([
    { id: "1", number: "+1 202-555-0123", label: "Main", isDefault: true, status: "active" },
    { id: "2", number: "+1 202-555-0198", label: "Sales", isDefault: false, status: "active" },
  ])
  const [workflows] = useState<Workflow[]>([
    { id: "1", organizationId: "1", name: "Lead Qualification", status: "active", trigger: "PHONE_CALL_CONNECTED", nodes: [], executionHistory: [], createdAt: "", updatedAt: "" },
    { id: "2", organizationId: "1", name: "Appointment Booking", status: "active", trigger: "TRANSCRIPT_COMPLETE", nodes: [], executionHistory: [], createdAt: "", updatedAt: "" },
  ])
  const [knowledgeBases] = useState<KnowledgeBase[]>([
    { id: "1", organizationId: "1", name: "Product FAQ", documents: [], createdAt: "", updatedAt: "" },
    { id: "2", organizationId: "1", name: "Sales Scripts", documents: [], createdAt: "", updatedAt: "" },
  ])
  const [voices] = useState<Voice[]>([
    { id: "rachel", name: "Rachel", provider: "ElevenLabs", gender: "female", language: "en", isCloned: false },
    { id: "josh", name: "Josh", provider: "ElevenLabs", gender: "male", language: "en", isCloned: false },
    { id: "sarah", name: "Sarah", provider: "ElevenLabs", gender: "female", language: "en", isCloned: false },
    { id: "michael", name: "Michael", provider: "ElevenLabs", gender: "male", language: "en", isCloned: false },
  ])
  
  // Initialize form with agent data if editing
  useEffect(() => {
    if (agent) {
      const parsedPersona = agent.systemPrompt ? parseSystemPrompt(agent.systemPrompt) : {}
      setFormData({
        ...defaultFormData,
        name: agent.name,
        description: agent.description || "",
        language: agent.language,
        modelProvider: agent.modelProvider,
        aiModel: agent.aiModel,
        phoneNumberId: agent.phoneNumberId || "",
        firstMessage: agent.firstMessage,
        userSpeaksFirst: agent.userSpeaksFirst,
        workflowIds: agent.workflowIds,
        voiceProvider: agent.voiceProvider,
        transcriber: agent.transcriber,
        voice: agent.voice,
        geminiLiveVoice: agent.geminiLiveVoice || "Puck",
        knowledgeBase: agent.knowledgeBase,
        speed: agent.speed,
        callRecording: agent.callRecording,
        callRecordingFormat: agent.callRecordingFormat,
        rememberLeadPreference: agent.rememberLeadPreference,
        voicemailDetection: agent.voicemailDetection,
        voicemailMessage: agent.voicemailMessage,
        enableCallTransfer: agent.enableCallTransfer,
        transferPhoneNumber: agent.transferPhoneNumber,
        keyboardSound: agent.keyboardSound,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        userTags: agent.userTags,
        systemTags: agent.systemTags,
        ...parsedPersona,
      })
    }
  }, [agent])
  
  const updateField = <K extends keyof AgentFormData>(field: K, value: AgentFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = async () => {
    // Build systemPrompt from persona fields before submitting
    const dataToSubmit = {
      ...formData,
    }
    await onSubmit(dataToSubmit)
  }
  
  const addUserTag = () => {
    if (newTag.trim() && !formData.userTags.includes(newTag.trim())) {
      updateField("userTags", [...formData.userTags, newTag.trim()])
      setNewTag("")
    }
  }
  
  const removeUserTag = (tag: string) => {
    updateField("userTags", formData.userTags.filter(t => t !== tag))
  }
  
  const toggleSystemTag = (tag: string) => {
    if (formData.systemTags.includes(tag)) {
      updateField("systemTags", formData.systemTags.filter(t => t !== tag))
    } else {
      updateField("systemTags", [...formData.systemTags, tag])
    }
  }
  
  const isGeminiLive = formData.modelProvider === "Gemini Live"
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-xl font-semibold">
          {agent ? "Edit Agent" : "Create New Agent"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-6">
          <TabsList className="h-12 w-full justify-start gap-4 bg-transparent p-0">
            <TabsTrigger value="basics" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3">
              Basics
            </TabsTrigger>
            <TabsTrigger value="persona" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3">
              Persona
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3">
              Media & Knowledge
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3">
              Settings
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3">
              Post Call Analysis
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Basics */}
          <TabsContent value="basics" className="mt-0 space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g., Sales Outreach Agent"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description of what this agent does..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(v) => updateField("language", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>AI Provider</Label>
                  <Select 
                    value={formData.modelProvider} 
                    onValueChange={(v: "ChatGPT" | "Gemini Live") => {
                      updateField("modelProvider", v)
                      updateField("aiModel", AI_MODELS[v][0])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                      <SelectItem value="Gemini Live">Gemini Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={formData.aiModel} onValueChange={(v) => updateField("aiModel", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS[formData.modelProvider].map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Select value={formData.phoneNumberId} onValueChange={(v) => updateField("phoneNumberId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phone number" />
                    </SelectTrigger>
                    <SelectContent>
                      {phoneNumbers.map((phone) => (
                        <SelectItem key={phone.id} value={phone.id}>
                          {phone.number} {phone.label && `(${phone.label})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="firstMessage">First Message</Label>
                <Textarea
                  id="firstMessage"
                  value={formData.firstMessage}
                  onChange={(e) => updateField("firstMessage", e.target.value)}
                  placeholder="What the agent says first when the call connects..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>User Speaks First</Label>
                  <p className="text-sm text-muted-foreground">
                    Wait for the user to speak before the agent responds
                  </p>
                </div>
                <Switch
                  checked={formData.userSpeaksFirst}
                  onCheckedChange={(v) => updateField("userSpeaksFirst", v)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Workflows</Label>
                <div className="flex flex-wrap gap-2">
                  {workflows.map((workflow) => (
                    <label
                      key={workflow.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                        formData.workflowIds.includes(workflow.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={formData.workflowIds.includes(workflow.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateField("workflowIds", [...formData.workflowIds, workflow.id])
                          } else {
                            updateField("workflowIds", formData.workflowIds.filter(id => id !== workflow.id))
                          }
                        }}
                      />
                      <span className="text-sm">{workflow.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 2: Persona */}
          <TabsContent value="persona" className="mt-0 space-y-6">
            <p className="text-sm text-muted-foreground">
              Define your agent&apos;s personality and behavior. These fields will be combined into the system prompt.
            </p>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="identity">Identity</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Who is this agent? Define their role, name, and background.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="identity"
                  value={formData.identity}
                  onChange={(e) => updateField("identity", e.target.value)}
                  placeholder="You are Sarah, a friendly sales representative at Acme Corp..."
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="style">Style</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>How should the agent communicate? Formal, casual, enthusiastic?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="style"
                  value={formData.style}
                  onChange={(e) => updateField("style", e.target.value)}
                  placeholder="Speak in a warm, professional tone. Be concise but friendly..."
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="goals">Goals</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>What should this agent accomplish during the call?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => updateField("goals", e.target.value)}
                  placeholder="1. Qualify the lead by understanding their needs\n2. Schedule a demo if interested\n3. Collect contact information..."
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="responseGuidelines">Response Guidelines</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Rules for how the agent should respond in various situations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="responseGuidelines"
                  value={formData.responseGuidelines}
                  onChange={(e) => updateField("responseGuidelines", e.target.value)}
                  placeholder="Keep responses under 3 sentences. Always confirm understanding before moving forward..."
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="errorHandling">Error Handling / Fallback</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>How should the agent handle errors or situations it cannot handle?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="errorHandling"
                  value={formData.errorHandling}
                  onChange={(e) => updateField("errorHandling", e.target.value)}
                  placeholder="If you don't understand, politely ask for clarification. If the question is outside your scope, offer to transfer to a human agent..."
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 3: Media & Knowledge */}
          <TabsContent value="media" className="mt-0 space-y-6">
            {isGeminiLive ? (
              // Gemini Live voice selection
              <div className="grid gap-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Gemini Live uses Google&apos;s built-in voices. Select one below.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label>Gemini Voice</Label>
                  <Select value={formData.geminiLiveVoice} onValueChange={(v) => updateField("geminiLiveVoice", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GEMINI_VOICES.map((voice) => (
                        <SelectItem key={voice} value={voice}>{voice}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              // Standard voice providers
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Voice Provider</Label>
                    <Select 
                      value={formData.voiceProvider} 
                      onValueChange={(v: "ElevenLabs" | "Rime" | "StreamElements" | "Smallest AI") => {
                        updateField("voiceProvider", v)
                        updateField("voice", "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ElevenLabs">ElevenLabs</SelectItem>
                        <SelectItem value="Rime">Rime</SelectItem>
                        <SelectItem value="StreamElements">StreamElements</SelectItem>
                        <SelectItem value="Smallest AI">Smallest AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Transcriber</Label>
                    <Select 
                      value={formData.transcriber} 
                      onValueChange={(v: "Deepgram" | "OpenAI Whisper") => updateField("transcriber", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deepgram">Deepgram</SelectItem>
                        <SelectItem value="OpenAI Whisper">OpenAI Whisper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label>Voice</Label>
                  {formData.voiceProvider === "Rime" ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {RIME_VOICES.map((voice) => (
                        <button
                          key={voice.id}
                          type="button"
                          onClick={() => updateField("voice", voice.id)}
                          className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                            formData.voice === voice.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{voice.gender}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPlayingVoice(playingVoice === voice.id ? null : voice.id)
                            }}
                          >
                            {playingVoice === voice.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <Select value={formData.voice} onValueChange={(v) => updateField("voice", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices
                          .filter(v => v.provider === formData.voiceProvider)
                          .map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.gender})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Speech Speed</Label>
                    <span className="text-sm text-muted-foreground">{formData.speed.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[formData.speed]}
                    onValueChange={([v]) => updateField("speed", v)}
                    min={0.25}
                    max={4}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.25x</span>
                    <span>1x</span>
                    <span>4x</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Knowledge Base</Label>
              <div className="flex flex-wrap gap-2">
                {knowledgeBases.map((kb) => (
                  <label
                    key={kb.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                      formData.knowledgeBase.includes(kb.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={formData.knowledgeBase.includes(kb.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField("knowledgeBase", [...formData.knowledgeBase, kb.id])
                        } else {
                          updateField("knowledgeBase", formData.knowledgeBase.filter(id => id !== kb.id))
                        }
                      }}
                    />
                    <span className="text-sm">{kb.name}</span>
                  </label>
                ))}
              </div>
              {knowledgeBases.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No knowledge bases available. Create one in the Knowledge section.
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Tab 4: Settings */}
          <TabsContent value="settings" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Recording</h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Call Recording</Label>
                  <p className="text-sm text-muted-foreground">
                    Record all calls for quality assurance and training
                  </p>
                </div>
                <Switch
                  checked={formData.callRecording}
                  onCheckedChange={(v) => updateField("callRecording", v)}
                />
              </div>
              
              {formData.callRecording && (
                <div className="grid gap-2">
                  <Label>Recording Format</Label>
                  <Select 
                    value={formData.callRecordingFormat} 
                    onValueChange={(v: "mp3" | "wav" | "m4a") => updateField("callRecordingFormat", v)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="m4a">M4A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Lead Preferences</h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Remember Lead Preference</Label>
                  <p className="text-sm text-muted-foreground">
                    Remember context from previous calls with the same lead
                  </p>
                </div>
                <Switch
                  checked={formData.rememberLeadPreference}
                  onCheckedChange={(v) => updateField("rememberLeadPreference", v)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Voicemail</h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Voicemail Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Detect voicemail and leave a message automatically
                  </p>
                </div>
                <Switch
                  checked={formData.voicemailDetection}
                  onCheckedChange={(v) => updateField("voicemailDetection", v)}
                />
              </div>
              
              {formData.voicemailDetection && (
                <div className="grid gap-2">
                  <Label htmlFor="voicemailMessage">Voicemail Message</Label>
                  <Textarea
                    id="voicemailMessage"
                    value={formData.voicemailMessage}
                    onChange={(e) => updateField("voicemailMessage", e.target.value)}
                    placeholder="Message to leave on voicemail..."
                    rows={3}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Call Transfer</h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Enable Call Transfer</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the agent to transfer calls to a human
                  </p>
                </div>
                <Switch
                  checked={formData.enableCallTransfer}
                  onCheckedChange={(v) => updateField("enableCallTransfer", v)}
                />
              </div>
              
              {formData.enableCallTransfer && (
                <div className="grid gap-2">
                  <Label htmlFor="transferPhoneNumber">Transfer Phone Number</Label>
                  <Input
                    id="transferPhoneNumber"
                    value={formData.transferPhoneNumber}
                    onChange={(e) => updateField("transferPhoneNumber", e.target.value)}
                    placeholder="+1 555-123-4567"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Advanced</h3>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Keyboard Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play typing sounds during pauses
                  </p>
                </div>
                <Switch
                  checked={formData.keyboardSound}
                  onCheckedChange={(v) => updateField("keyboardSound", v)}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">{formData.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[formData.temperature]}
                  onValueChange={([v]) => updateField("temperature", v)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Focused</span>
                  <span>More Creative</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Max Tokens</Label>
                  <span className="text-sm text-muted-foreground">{formData.maxTokens}</span>
                </div>
                <Slider
                  value={[formData.maxTokens]}
                  onValueChange={([v]) => updateField("maxTokens", v)}
                  min={1}
                  max={4000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>4000</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab 5: Post Call Analysis */}
          <TabsContent value="analysis" className="mt-0 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Custom Tags</h3>
              <p className="text-sm text-muted-foreground">
                Add custom tags that will be applied during post-call analysis.
              </p>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter a custom tag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUserTag())}
                />
                <Button type="button" onClick={addUserTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.userTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.userTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeUserTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">System Tags</h3>
              <p className="text-sm text-muted-foreground">
                Select predefined tags to automatically classify calls.
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SYSTEM_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                      formData.systemTags.includes(tag)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={formData.systemTags.includes(tag)}
                      onCheckedChange={() => toggleSystemTag(tag)}
                    />
                    <span className="text-sm capitalize">{tag.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Footer */}
      <div className="flex items-center justify-between border-t px-6 py-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={isLoading || !formData.name}
          >
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
          </Button>
        </div>
      </div>
    </div>
  )
}
