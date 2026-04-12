"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { WorkflowEditor } from "@/components/workflows/workflow-editor"
import type { Node, Edge } from "reactflow"
import { Workflow } from "@/lib/types"

// Mock data - in real app, this would come from API
const mockWorkflows: Record<string, Workflow> = {
  "wf-1": {
    id: "wf-1",
    organizationId: "org-1",
    name: "New Lead Follow-up",
    description: "Automatically process new leads after call",
    isActive: true,
    nodes: [
      { id: "TRIGGER-1", type: "TRIGGER", position: { x: 250, y: 50 }, data: { label: "Trigger", config: { triggerType: "PHONE_CALL_ENDED" } } },
      { id: "AI_AGENT-1", type: "AI_AGENT", position: { x: 250, y: 150 }, data: { label: "AI Agent", config: { inputField: "transcript", prompt: "Analyze the call and extract key points" } } },
      { id: "HUBSPOT_TOOL-1", type: "HUBSPOT_TOOL", position: { x: 250, y: 250 }, data: { label: "HubSpot", config: { action: "create_deal", dealName: "{{lead_name}}" } } },
    ],
    edges: [
      { id: "e1", source: "TRIGGER-1", target: "AI_AGENT-1" },
      { id: "e2", source: "AI_AGENT-1", target: "HUBSPOT_TOOL-1" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "wf-2": {
    id: "wf-2",
    organizationId: "org-1",
    name: "Meeting Reminder Email",
    description: "Send confirmation emails after meetings are booked",
    isActive: true,
    nodes: [
      { id: "TRIGGER-1", type: "TRIGGER", position: { x: 250, y: 50 }, data: { label: "Trigger", config: { triggerType: "CALL_SUMMARY" } } },
      { id: "EMAIL_TOOL-1", type: "EMAIL_TOOL", position: { x: 250, y: 150 }, data: { label: "Send Email", config: { recipient: "{{lead_email}}", subject: "Meeting Confirmation", body: "Thank you for scheduling a meeting with us!" } } },
    ],
    edges: [
      { id: "e1", source: "TRIGGER-1", target: "EMAIL_TOOL-1" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "wf-3": {
    id: "wf-3",
    organizationId: "org-1",
    name: "Zoho CRM Sync",
    description: "Sync call data to Zoho CRM",
    isActive: false,
    nodes: [
      { id: "TRIGGER-1", type: "TRIGGER", position: { x: 250, y: 50 }, data: { label: "Trigger", config: { triggerType: "TRANSCRIPT_COMPLETE" } } },
      { id: "ZOHO_TOOL-1", type: "ZOHO_TOOL", position: { x: 250, y: 150 }, data: { label: "Zoho CRM", config: { action: "update_deal" } } },
    ],
    edges: [
      { id: "e1", source: "TRIGGER-1", target: "ZOHO_TOOL-1" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [workflowName, setWorkflowName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Fetch workflow data
    // API call: GET /api/workflows/:id
    const fetchWorkflow = async () => {
      setIsLoading(true)
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        
        const data = mockWorkflows[id]
        if (data) {
          setWorkflow(data)
          setWorkflowName(data.name)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch workflow:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflow()
  }, [id])

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    setIsSaving(true)
    
    try {
      // Transform nodes/edges to API format
      const payload = {
        name: workflowName,
        isActive: workflow?.isActive ?? true,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data.config || {},
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
        })),
      }

      // API call: PUT /api/workflows/:id
      console.log("[v0] Updating workflow:", payload)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      router.push("/workflows")
    } catch (error) {
      console.error("[v0] Failed to update workflow:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Transform workflow nodes to React Flow format
  const initialNodes: Node[] = workflow?.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data.label,
      config: node.data.config,
    },
  })) || []

  const initialEdges: Edge[] = workflow?.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    animated: true,
  })) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/workflows">
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </Link>
        </Button>
        <div className="flex items-center justify-center h-[calc(100vh-300px)]">
          <p className="text-muted-foreground">Workflow not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/workflows">
          <ArrowLeft className="w-4 h-4" />
          Back to Workflows
        </Link>
      </Button>

      {/* Editor */}
      <WorkflowEditor
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
