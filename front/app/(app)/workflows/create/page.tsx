"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { WorkflowEditor } from "@/components/workflows/workflow-editor"
import type { Node, Edge } from "reactflow"

export default function CreateWorkflowPage() {
  const router = useRouter()
  const [workflowName, setWorkflowName] = useState("Untitled Workflow")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    setIsSaving(true)
    
    try {
      // Transform nodes/edges to API format
      const payload = {
        name: workflowName,
        isActive: true,
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

      // API call: POST /api/workflows
      console.log("[v0] Saving workflow:", payload)
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      router.push("/workflows")
    } catch (error) {
      console.error("[v0] Failed to save workflow:", error)
    } finally {
      setIsSaving(false)
    }
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
        workflowName={workflowName}
        onWorkflowNameChange={setWorkflowName}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}
