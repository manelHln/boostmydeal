"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  History, 
  Trash2,
  GitBranch,
  Play,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Workflow } from "@/lib/types"

// Mock data
const mockWorkflows: Workflow[] = [
  {
    id: "wf-1",
    organizationId: "org-1",
    name: "New Lead Follow-up",
    description: "Automatically process new leads after call",
    isActive: true,
    nodes: [
      { id: "TRIGGER-1", type: "TRIGGER", position: { x: 250, y: 50 }, data: { label: "Trigger", config: { triggerType: "PHONE_CALL_ENDED" } } },
      { id: "AI_AGENT-1", type: "AI_AGENT", position: { x: 250, y: 150 }, data: { label: "AI Agent", config: {} } },
      { id: "HUBSPOT_TOOL-1", type: "HUBSPOT_TOOL", position: { x: 250, y: 250 }, data: { label: "HubSpot", config: { action: "create_deal" } } },
    ],
    edges: [
      { id: "e1", source: "TRIGGER-1", target: "AI_AGENT-1" },
      { id: "e2", source: "AI_AGENT-1", target: "HUBSPOT_TOOL-1" },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "wf-2",
    organizationId: "org-1",
    name: "Meeting Reminder Email",
    description: "Send confirmation emails after meetings are booked",
    isActive: true,
    nodes: [
      { id: "TRIGGER-1", type: "TRIGGER", position: { x: 250, y: 50 }, data: { label: "Trigger", config: { triggerType: "CALL_SUMMARY" } } },
      { id: "EMAIL_TOOL-1", type: "EMAIL_TOOL", position: { x: 250, y: 150 }, data: { label: "Send Email", config: {} } },
    ],
    edges: [
      { id: "e1", source: "TRIGGER-1", target: "EMAIL_TOOL-1" },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
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
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function WorkflowsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)
  const [deleteWorkflow, setDeleteWorkflow] = useState<Workflow | null>(null)

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = workflows.filter((w) => w.isActive).length
  const totalExecutions = 4867 // Mock stat
  const successRate = 87 // Mock stat
  const failedToday = 12 // Mock stat

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId ? { ...w, isActive: !w.isActive } : w
      )
    )
    // API call: POST /api/workflows/:id/toggle
  }

  const handleDeleteWorkflow = () => {
    if (!deleteWorkflow) return
    setWorkflows((prev) => prev.filter((w) => w.id !== deleteWorkflow.id))
    setDeleteWorkflow(null)
    // API call: DELETE /api/workflows/:id
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate your sales process with AI-powered workflows
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/workflows/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-semibold">{activeCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-semibold">{totalExecutions.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-semibold">{successRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Today</p>
                <p className="text-2xl font-semibold">{failedToday}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workflows Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No workflows found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GitBranch className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          {workflow.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {workflow.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                        />
                        <Badge variant={workflow.isActive ? "default" : "secondary"}>
                          {workflow.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/workflows/edit/${workflow.id}`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/workflows/execution-history/${workflow.id}`}>
                              <History className="w-4 h-4 mr-2" />
                              View Execution History
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={() => setDeleteWorkflow(workflow)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWorkflow} onOpenChange={() => setDeleteWorkflow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteWorkflow?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkflow}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
