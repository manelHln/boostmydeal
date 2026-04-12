"use client"

import { useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  ArrowLeft, 
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  AlertCircle,
  Clock,
  Phone,
  Bot
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { WorkflowExecution } from "@/lib/types"

// Mock data
const mockWorkflowName = "New Lead Follow-up"

const mockExecutions: WorkflowExecution[] = [
  {
    id: "exec-1a2b3c4d5e6f7890",
    workflowId: "wf-1",
    callId: "call-123",
    assistantName: "Sales Agent",
    phoneNumber: "+1 202-555-0123",
    triggerType: "PHONE_CALL_ENDED",
    status: "COMPLETED",
    duration: 45,
    startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    nodeOutputs: {
      "TRIGGER-1": { triggered: true, callId: "call-123" },
      "AI_AGENT-1": { summary: "Customer interested in premium plan", sentiment: "positive" },
      "HUBSPOT_TOOL-1": { dealId: "deal-456", status: "created" },
    },
    callSessionPayloads: [
      { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), payload: { event: "call_started" } },
      { timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(), payload: { event: "call_ended", duration: 45 } },
    ],
  },
  {
    id: "exec-2b3c4d5e6f7890ab",
    workflowId: "wf-1",
    callId: "call-124",
    assistantName: "Sales Agent",
    phoneNumber: "+1 202-555-0198",
    triggerType: "PHONE_CALL_ENDED",
    status: "FAILED",
    duration: 12,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
    error: "HubSpot API rate limit exceeded",
    nodeOutputs: {
      "TRIGGER-1": { triggered: true, callId: "call-124" },
      "AI_AGENT-1": { summary: "Customer not interested", sentiment: "negative" },
    },
    callSessionPayloads: [],
  },
  {
    id: "exec-3c4d5e6f7890abcd",
    workflowId: "wf-1",
    callId: "call-125",
    assistantName: "Support Agent",
    phoneNumber: "+1 203-555-0175",
    triggerType: "PHONE_CALL_ENDED",
    status: "RUNNING",
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    nodeOutputs: {
      "TRIGGER-1": { triggered: true, callId: "call-125" },
    },
    callSessionPayloads: [],
  },
  {
    id: "exec-4d5e6f7890abcdef",
    workflowId: "wf-1",
    callId: "call-126",
    assistantName: "Sales Agent",
    phoneNumber: "+1 202-555-0147",
    triggerType: "PHONE_CALL_ENDED",
    status: "COMPLETED",
    duration: 78,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 78000).toISOString(),
    nodeOutputs: {
      "TRIGGER-1": { triggered: true, callId: "call-126" },
      "AI_AGENT-1": { summary: "Meeting scheduled for next week", sentiment: "positive" },
      "HUBSPOT_TOOL-1": { dealId: "deal-789", status: "created" },
    },
    callSessionPayloads: [],
  },
]

function ExecutionStatusBadge({ status }: { status: WorkflowExecution["status"] }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    case "FAILED":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )
    case "RUNNING":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Running
        </Badge>
      )
    default:
      return null
  }
}

function ExecutionRow({ execution }: { execution: WorkflowExecution }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-mono text-sm">
          {execution.id.slice(-8)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{execution.assistantName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {execution.phoneNumber}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">{execution.triggerType.replace(/_/g, " ")}</Badge>
        </TableCell>
        <TableCell>
          <ExecutionStatusBadge status={execution.status} />
        </TableCell>
        <TableCell>
          {execution.duration ? `${execution.duration}s` : "-"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
        </TableCell>
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-4">
            <div className="space-y-4">
              {/* Error Message */}
              {execution.error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Error</p>
                    <p className="text-sm text-red-600/80">{execution.error}</p>
                  </div>
                </div>
              )}

              {/* Node Outputs */}
              <div>
                <p className="text-sm font-medium mb-2">Node Outputs</p>
                <pre className="p-3 rounded-lg bg-muted text-sm overflow-x-auto">
                  {JSON.stringify(execution.nodeOutputs, null, 2)}
                </pre>
              </div>

              {/* Call Session Payloads */}
              {execution.callSessionPayloads && execution.callSessionPayloads.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Call Session Events</p>
                  <div className="space-y-2">
                    {execution.callSessionPayloads.map((payload, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded bg-muted">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payload.timestamp), "PPpp")}
                          </p>
                          <pre className="text-sm">{JSON.stringify(payload.payload)}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function WorkflowExecutionHistoryPage({ 
  params 
}: { 
  params: Promise<{ workflowId: string }> 
}) {
  const { workflowId } = use(params)
  const executions = mockExecutions

  // Compute stats
  const totalExecutions = executions.length
  const completedCount = executions.filter((e) => e.status === "COMPLETED").length
  const failedCount = executions.filter((e) => e.status === "FAILED").length
  const runningCount = executions.filter((e) => e.status === "RUNNING").length

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/workflows">
            <ArrowLeft className="w-4 h-4" />
            Back to Workflows
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Execution History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockWorkflowName} ({workflowId})
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-semibold">{totalExecutions}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
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
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-semibold text-red-600">{failedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-semibold text-blue-600">{runningCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Execution ID</TableHead>
                <TableHead>Call Details</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No executions yet
                  </TableCell>
                </TableRow>
              ) : (
                executions.map((execution) => (
                  <ExecutionRow key={execution.id} execution={execution} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
