"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Zap, 
  Mail, 
  Bot, 
  X, 
  Save,
  Trash2,
  Plus,
  Search,
  Webhook,
  Phone,
  Calendar,
  MessageSquare,
  Database,
  FileText,
  Clock,
  GitBranch,
  Filter,
  Code,
  Globe,
  Send,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  WorkflowNodeType, 
  WORKFLOW_TRIGGER_TYPES,
  HUBSPOT_ACTIONS,
  ZOHO_ACTIONS 
} from "@/lib/types"

// Extended node types for n8n-style categories
type ExtendedNodeType = WorkflowNodeType | 
  "WEBHOOK" | 
  "DELAY" | 
  "CONDITION" | 
  "HTTP_REQUEST" | 
  "CODE" | 
  "SMS" | 
  "SLACK" | 
  "GOOGLE_SHEETS" | 
  "CALENDAR" |
  "SALESFORCE" |
  "PIPEDRIVE"

// Node categories like n8n
interface NodeCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  nodes: {
    type: ExtendedNodeType
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    available: boolean
  }[]
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: "triggers",
    name: "Triggers",
    icon: Zap,
    color: "text-green-500",
    nodes: [
      {
        type: "TRIGGER",
        label: "Event Trigger",
        description: "Start workflow on call events",
        icon: Zap,
        color: "text-green-600",
        bgColor: "bg-green-500/10 border-green-500/30",
        available: true,
      },
      {
        type: "WEBHOOK",
        label: "Webhook",
        description: "Receive data via HTTP webhook",
        icon: Webhook,
        color: "text-emerald-600",
        bgColor: "bg-emerald-500/10 border-emerald-500/30",
        available: true,
      },
    ],
  },
  {
    id: "ai",
    name: "AI & Agents",
    icon: Bot,
    color: "text-purple-500",
    nodes: [
      {
        type: "AI_AGENT",
        label: "AI Agent",
        description: "Process data with AI",
        icon: Bot,
        color: "text-purple-600",
        bgColor: "bg-purple-500/10 border-purple-500/30",
        available: true,
      },
    ],
  },
  {
    id: "crm",
    name: "CRM",
    icon: Users,
    color: "text-orange-500",
    nodes: [
      {
        type: "HUBSPOT_TOOL",
        label: "HubSpot",
        description: "Create deals, contacts, notes",
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978V3.07A2.074 2.074 0 0017.36 1h-.036a2.074 2.074 0 00-2.071 2.071v.035c0 .858.497 1.6 1.218 1.96v2.865a5.998 5.998 0 00-2.786 1.47l-7.453-5.794a2.548 2.548 0 00.065-.54A2.475 2.475 0 003.822 .592 2.475 2.475 0 001.346 3.067a2.475 2.475 0 002.476 2.476c.498 0 .96-.149 1.347-.403l7.32 5.69a5.986 5.986 0 00-.538 2.485c0 .903.2 1.76.558 2.529l-2.246 2.245a2.136 2.136 0 00-.633-.1 2.142 2.142 0 00-2.14 2.14 2.142 2.142 0 002.14 2.14 2.142 2.142 0 002.14-2.14c0-.225-.035-.441-.1-.644l2.217-2.217a5.991 5.991 0 003.428 1.074 6.02 6.02 0 006.015-6.015 6.005 6.005 0 00-5.166-5.937zm-2.85 9.121a3.201 3.201 0 01-3.197-3.197 3.201 3.201 0 013.197-3.197 3.201 3.201 0 013.197 3.197 3.201 3.201 0 01-3.197 3.197z"/>
          </svg>
        ),
        color: "text-orange-600",
        bgColor: "bg-orange-500/10 border-orange-500/30",
        available: true,
      },
      {
        type: "ZOHO_TOOL",
        label: "Zoho CRM",
        description: "Manage deals and leads",
        icon: () => (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.31l8.25 4.69v9.38L12 21.07l-8.25-4.69V7L12 2.31z"/>
          </svg>
        ),
        color: "text-red-600",
        bgColor: "bg-red-500/10 border-red-500/30",
        available: true,
      },
      {
        type: "SALESFORCE",
        label: "Salesforce",
        description: "Sync with Salesforce CRM",
        icon: Database,
        color: "text-blue-600",
        bgColor: "bg-blue-500/10 border-blue-500/30",
        available: false,
      },
      {
        type: "PIPEDRIVE",
        label: "Pipedrive",
        description: "Manage Pipedrive deals",
        icon: BarChart3,
        color: "text-slate-600",
        bgColor: "bg-slate-500/10 border-slate-500/30",
        available: false,
      },
    ],
  },
  {
    id: "communication",
    name: "Communication",
    icon: MessageSquare,
    color: "text-blue-500",
    nodes: [
      {
        type: "EMAIL_TOOL",
        label: "Send Email",
        description: "Send emails via SMTP",
        icon: Mail,
        color: "text-blue-600",
        bgColor: "bg-blue-500/10 border-blue-500/30",
        available: true,
      },
      {
        type: "SMS",
        label: "Send SMS",
        description: "Send SMS via Twilio/Vonage",
        icon: Phone,
        color: "text-teal-600",
        bgColor: "bg-teal-500/10 border-teal-500/30",
        available: false,
      },
      {
        type: "SLACK",
        label: "Slack",
        description: "Send Slack messages",
        icon: MessageSquare,
        color: "text-violet-600",
        bgColor: "bg-violet-500/10 border-violet-500/30",
        available: false,
      },
    ],
  },
  {
    id: "flow",
    name: "Flow Control",
    icon: GitBranch,
    color: "text-amber-500",
    nodes: [
      {
        type: "CONDITION",
        label: "IF Condition",
        description: "Branch based on conditions",
        icon: Filter,
        color: "text-amber-600",
        bgColor: "bg-amber-500/10 border-amber-500/30",
        available: false,
      },
      {
        type: "DELAY",
        label: "Wait / Delay",
        description: "Pause workflow execution",
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-500/10 border-gray-500/30",
        available: false,
      },
    ],
  },
  {
    id: "data",
    name: "Data & APIs",
    icon: Database,
    color: "text-cyan-500",
    nodes: [
      {
        type: "HTTP_REQUEST",
        label: "HTTP Request",
        description: "Make API calls",
        icon: Globe,
        color: "text-cyan-600",
        bgColor: "bg-cyan-500/10 border-cyan-500/30",
        available: false,
      },
      {
        type: "CODE",
        label: "Code",
        description: "Run custom JavaScript",
        icon: Code,
        color: "text-pink-600",
        bgColor: "bg-pink-500/10 border-pink-500/30",
        available: false,
      },
      {
        type: "GOOGLE_SHEETS",
        label: "Google Sheets",
        description: "Read/write spreadsheets",
        icon: FileText,
        color: "text-green-600",
        bgColor: "bg-green-500/10 border-green-500/30",
        available: false,
      },
    ],
  },
  {
    id: "scheduling",
    name: "Scheduling",
    icon: Calendar,
    color: "text-indigo-500",
    nodes: [
      {
        type: "CALENDAR",
        label: "Google Calendar",
        description: "Create calendar events",
        icon: Calendar,
        color: "text-indigo-600",
        bgColor: "bg-indigo-500/10 border-indigo-500/30",
        available: false,
      },
    ],
  },
]

// Node type configurations for available nodes
const NODE_CONFIGS: Record<string, {
  label: string
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }>
  fields: {
    name: string
    label: string
    type: "text" | "textarea" | "select"
    options?: { value: string; label: string }[]
    condition?: (data: Record<string, unknown>) => boolean
  }[]
}> = {
  TRIGGER: {
    label: "Event Trigger",
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/30",
    icon: Zap,
    fields: [
      { 
        name: "triggerType", 
        label: "Trigger Type", 
        type: "select",
        options: WORKFLOW_TRIGGER_TYPES.map(t => ({ value: t.value, label: t.label }))
      },
      { 
        name: "webhookUrl", 
        label: "Webhook URL", 
        type: "text",
        condition: (data) => data.triggerType === "WEBHOOK"
      },
    ]
  },
  WEBHOOK: {
    label: "Webhook",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    icon: Webhook,
    fields: [
      { name: "method", label: "HTTP Method", type: "select", options: [
        { value: "POST", label: "POST" },
        { value: "GET", label: "GET" },
        { value: "PUT", label: "PUT" },
      ]},
      { name: "path", label: "Path", type: "text" },
    ]
  },
  EMAIL_TOOL: {
    label: "Send Email",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    icon: Mail,
    fields: [
      { name: "recipient", label: "Recipient", type: "text" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "body", label: "Body", type: "textarea" },
    ]
  },
  AI_AGENT: {
    label: "AI Agent",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    icon: Bot,
    fields: [
      { 
        name: "inputField", 
        label: "Input Field", 
        type: "select",
        options: [
          { value: "transcript", label: "Transcript" },
          { value: "summary", label: "Summary" },
          { value: "custom", label: "Custom Input" },
        ]
      },
      { name: "prompt", label: "Prompt", type: "textarea" },
      { 
        name: "tool", 
        label: "Tool", 
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "web_search", label: "Web Search" },
          { value: "calculator", label: "Calculator" },
        ]
      },
    ]
  },
  HUBSPOT_TOOL: {
    label: "HubSpot",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978V3.07A2.074 2.074 0 0017.36 1h-.036a2.074 2.074 0 00-2.071 2.071v.035c0 .858.497 1.6 1.218 1.96v2.865a5.998 5.998 0 00-2.786 1.47l-7.453-5.794a2.548 2.548 0 00.065-.54A2.475 2.475 0 003.822 .592 2.475 2.475 0 001.346 3.067a2.475 2.475 0 002.476 2.476c.498 0 .96-.149 1.347-.403l7.32 5.69a5.986 5.986 0 00-.538 2.485c0 .903.2 1.76.558 2.529l-2.246 2.245a2.136 2.136 0 00-.633-.1 2.142 2.142 0 00-2.14 2.14 2.142 2.142 0 002.14 2.14 2.142 2.142 0 002.14-2.14c0-.225-.035-.441-.1-.644l2.217-2.217a5.991 5.991 0 003.428 1.074 6.02 6.02 0 006.015-6.015 6.005 6.005 0 00-5.166-5.937zm-2.85 9.121a3.201 3.201 0 01-3.197-3.197 3.201 3.201 0 013.197-3.197 3.201 3.201 0 013.197 3.197 3.201 3.201 0 01-3.197 3.197z"/>
      </svg>
    ),
    fields: [
      { 
        name: "action", 
        label: "Action", 
        type: "select",
        options: HUBSPOT_ACTIONS.map(a => ({ value: a.value, label: a.label }))
      },
      { 
        name: "dealId", 
        label: "Deal ID", 
        type: "text",
        condition: (data) => ["update_deal", "get_deal"].includes(data.action as string)
      },
      { 
        name: "dealName", 
        label: "Deal Name", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "amount", 
        label: "Amount", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "stage", 
        label: "Stage", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "description", 
        label: "Description", 
        type: "textarea",
        condition: (data) => ["create_deal", "update_deal", "create_note"].includes(data.action as string)
      },
    ]
  },
  ZOHO_TOOL: {
    label: "Zoho CRM",
    color: "text-red-600",
    bgColor: "bg-red-500/10 border-red-500/30",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0L1.5 6v12L12 24l10.5-6V6L12 0zm0 2.31l8.25 4.69v9.38L12 21.07l-8.25-4.69V7L12 2.31z"/>
      </svg>
    ),
    fields: [
      { 
        name: "action", 
        label: "Action", 
        type: "select",
        options: ZOHO_ACTIONS.map(a => ({ value: a.value, label: a.label }))
      },
      { 
        name: "dealId", 
        label: "Deal ID", 
        type: "text",
        condition: (data) => ["update_deal", "get_deal"].includes(data.action as string)
      },
      { 
        name: "dealName", 
        label: "Deal Name", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "amount", 
        label: "Amount", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "stage", 
        label: "Stage", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "closingDate", 
        label: "Closing Date", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "dealType", 
        label: "Deal Type", 
        type: "text",
        condition: (data) => ["create_deal", "update_deal"].includes(data.action as string)
      },
      { 
        name: "description", 
        label: "Description", 
        type: "textarea",
        condition: (data) => ["create_deal", "update_deal", "create_note"].includes(data.action as string)
      },
    ]
  },
}

// Custom Node Component
function CustomNode({ id, data, type, selected }: NodeProps) {
  const config = NODE_CONFIGS[type as string]
  if (!config) return null
  
  const Icon = config.icon as React.ComponentType<{ className?: string }>

  return (
    <div 
      className={cn(
        "px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm transition-shadow",
        config.bgColor,
        selected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background"
      />
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded", config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
          {data.config?.triggerType && (
            <p className="text-xs text-muted-foreground">
              {WORKFLOW_TRIGGER_TYPES.find(t => t.value === data.config.triggerType)?.label}
            </p>
          )}
          {data.config?.action && (
            <p className="text-xs text-muted-foreground capitalize">
              {(data.config.action as string).replace(/_/g, " ")}
            </p>
          )}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-muted-foreground !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  )
}

// n8n-style Node Selector Panel
function NodeSelectorPanel({ 
  isOpen, 
  onClose,
  onAddNode 
}: { 
  isOpen: boolean
  onClose: () => void
  onAddNode: (type: ExtendedNodeType) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>("triggers")

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return NODE_CATEGORIES

    const query = searchQuery.toLowerCase()
    return NODE_CATEGORIES.map(category => ({
      ...category,
      nodes: category.nodes.filter(
        node => 
          node.label.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query)
      )
    })).filter(category => category.nodes.length > 0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div className="absolute left-4 top-4 z-50 w-80 bg-background border rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Add Node</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {filteredCategories.map((category) => (
            <div key={category.id} className="mb-1">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(
                  expandedCategory === category.id ? null : category.id
                )}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <category.icon className={cn("w-4 h-4", category.color)} />
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {category.nodes.length}
                  </span>
                </div>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    expandedCategory === category.id && "rotate-90"
                  )} 
                />
              </button>

              {/* Category Nodes */}
              {(expandedCategory === category.id || searchQuery) && (
                <div className="ml-2 pl-4 border-l border-muted">
                  {category.nodes.map((node) => {
                    const NodeIcon = node.icon as React.ComponentType<{ className?: string }>
                    return (
                      <button
                        key={node.type}
                        onClick={() => {
                          if (node.available) {
                            onAddNode(node.type)
                            onClose()
                          }
                        }}
                        disabled={!node.available}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left",
                          node.available 
                            ? "hover:bg-muted/50 cursor-pointer" 
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg border",
                          node.bgColor
                        )}>
                          <NodeIcon className={cn("w-5 h-5", node.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{node.label}</p>
                            {!node.available && (
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {node.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Node Config Sidebar
function NodeConfigSidebar({ 
  node, 
  onUpdate, 
  onClose,
  onDelete 
}: { 
  node: Node | null
  onUpdate: (nodeId: string, config: Record<string, unknown>) => void
  onClose: () => void
  onDelete: (nodeId: string) => void
}) {
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(
    node?.data?.config || {}
  )

  if (!node) return null

  const config = NODE_CONFIGS[node.type as string]
  if (!config) return null

  const handleSave = () => {
    onUpdate(node.id, localConfig)
    onClose()
  }

  return (
    <Card className="w-80 h-full border-l rounded-none">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-4 border-b">
        <CardTitle className="text-base">Configure {config.label}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        {config.fields.map((field) => {
          if (field.condition && !field.condition(localConfig)) {
            return null
          }

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "text" && (
                <Input
                  id={field.name}
                  value={(localConfig[field.name] as string) || ""}
                  onChange={(e) => setLocalConfig({ ...localConfig, [field.name]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  value={(localConfig[field.name] as string) || ""}
                  onChange={(e) => setLocalConfig({ ...localConfig, [field.name]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  rows={4}
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  value={(localConfig[field.name] as string) || ""}
                  onValueChange={(value) => setLocalConfig({ ...localConfig, [field.name]: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )
        })}

        <div className="pt-4 space-y-2">
          <Button className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Workflow Editor Component
interface WorkflowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  workflowName: string
  onWorkflowNameChange: (name: string) => void
  onSave: (nodes: Node[], edges: Edge[]) => void
  isSaving?: boolean
}

export function WorkflowEditor({
  initialNodes = [],
  initialEdges = [],
  workflowName,
  onWorkflowNameChange,
  onSave,
  isSaving = false,
}: WorkflowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showNodeSelector, setShowNodeSelector] = useState(false)

  const nodeTypes = useMemo(() => ({
    TRIGGER: CustomNode,
    WEBHOOK: CustomNode,
    EMAIL_TOOL: CustomNode,
    AI_AGENT: CustomNode,
    HUBSPOT_TOOL: CustomNode,
    ZOHO_TOOL: CustomNode,
  }), [])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 }
    }, eds)),
    [setEdges]
  )

  const handleAddNode = useCallback((type: ExtendedNodeType) => {
    const config = NODE_CONFIGS[type]
    if (!config) return

    // Calculate center position
    const centerX = (reactFlowWrapper.current?.clientWidth || 500) / 2 - 90
    const centerY = (nodes.length * 100) + 100

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: centerX, y: centerY },
      data: { 
        label: config.label,
        config: {} 
      },
    }

    setNodes((nds) => [...nds, newNode])
  }, [nodes.length, setNodes])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowNodeSelector(false)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleUpdateNodeConfig = useCallback((nodeId: string, config: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
            },
          }
        }
        return node
      })
    )
  }, [setNodes])

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const handleSave = () => {
    onSave(nodes, edges)
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Input
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            className="max-w-md text-lg font-medium"
            placeholder="Workflow Name"
          />
          <Button 
            variant="outline" 
            onClick={() => setShowNodeSelector(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </Button>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Workflow"}
        </Button>
      </div>

      {/* Canvas + Sidebars */}
      <div className="flex-1 flex relative">
        {/* Node Selector Panel (n8n style) */}
        <NodeSelectorPanel
          isOpen={showNodeSelector}
          onClose={() => setShowNodeSelector(false)}
          onAddNode={handleAddNode}
        />

        {/* React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-muted/20"
            defaultEdgeOptions={{
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { strokeWidth: 2 }
            }}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === "TRIGGER") return "#22c55e"
                if (node.type === "WEBHOOK") return "#10b981"
                if (node.type === "EMAIL_TOOL") return "#3b82f6"
                if (node.type === "AI_AGENT") return "#a855f7"
                if (node.type === "HUBSPOT_TOOL") return "#f97316"
                if (node.type === "ZOHO_TOOL") return "#ef4444"
                return "#6b7280"
              }}
            />
          </ReactFlow>
        </div>

        {/* Config Sidebar */}
        {selectedNode && (
          <NodeConfigSidebar
            node={selectedNode}
            onUpdate={handleUpdateNodeConfig}
            onClose={() => setSelectedNode(null)}
            onDelete={handleDeleteNode}
          />
        )}
      </div>
    </div>
  )
}
