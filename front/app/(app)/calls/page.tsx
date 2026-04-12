"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  Filter, 
  Phone, 
  PhoneOutgoing,
  Play, 
  Download, 
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TranscriptOverlay } from "@/components/calls/transcript-overlay"
import { cn } from "@/lib/utils"
import type { Call, CallStatus, CallFilters, AIAgent } from "@/lib/types"

// Mock data
const mockAgents: AIAgent[] = [
  { id: "1", name: "Sales Outreach Agent", status: "active" } as AIAgent,
  { id: "2", name: "Appointment Setter", status: "active" } as AIAgent,
  { id: "3", name: "Lead Qualifier", status: "active" } as AIAgent,
]

const mockCalls: Call[] = [
  {
    id: "call_001",
    organizationId: "org_1",
    agentId: "1",
    assistantId: { _id: "1", name: "Sales Outreach Agent" },
    contactName: "John Smith",
    contactPhone: "+15551234567",
    callType: "outbound",
    status: "completed",
    duration: 272,
    cost: 0.0845,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    roomName: "room_abc123",
    user_tags: ["qualified", "demo-scheduled", "hot-lead"],
    recording: "https://example.com/recording1.mp3",
    crmSynced: true,
  },
  {
    id: "call_002",
    organizationId: "org_1",
    agentId: "2",
    assistantId: { _id: "2", name: "Appointment Setter" },
    contactName: "Emily Johnson",
    contactPhone: "+15552345678",
    callType: "outbound",
    status: "answered",
    duration: 195,
    cost: 0.0612,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    twilioSid: "CA1234567890",
    user_tags: ["interested", "needs-info"],
    crmSynced: false,
  },
  {
    id: "call_003",
    organizationId: "org_1",
    agentId: "1",
    assistantId: { _id: "1", name: "Sales Outreach Agent" },
    contactName: "Michael Brown",
    contactPhone: "+15553456789",
    callType: "inbound",
    status: "in-progress",
    duration: 0,
    cost: 0,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    roomName: "room_def456",
    user_tags: [],
    crmSynced: false,
  },
  {
    id: "call_004",
    organizationId: "org_1",
    agentId: "3",
    assistantId: { _id: "3", name: "Lead Qualifier" },
    contactName: "Sarah Wilson",
    contactPhone: "+15554567890",
    callType: "outbound",
    status: "failed",
    duration: 0,
    cost: 0,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user_tags: ["retry"],
    errorMessage: "Network timeout - could not establish connection",
    crmSynced: false,
  },
  {
    id: "call_005",
    organizationId: "org_1",
    agentId: "1",
    assistantId: { _id: "1", name: "Sales Outreach Agent" },
    contactName: "David Lee",
    contactPhone: "+15555678901",
    callType: "outbound",
    status: "no-answer",
    duration: 45,
    cost: 0.0125,
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    voxsunCallId: "vox_789",
    user_tags: ["voicemail"],
    endReason: "No answer after 6 rings",
    crmSynced: true,
  },
  {
    id: "call_006",
    organizationId: "org_1",
    agentId: "2",
    assistantId: { _id: "2", name: "Appointment Setter" },
    contactName: "Lisa Chen",
    contactPhone: "+15556789012",
    callType: "outbound",
    status: "busy",
    duration: 0,
    cost: 0,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user_tags: ["callback-requested"],
    endReason: "Line busy",
    crmSynced: false,
  },
]

const CALL_STATUSES: CallStatus[] = [
  "queued",
  "in-progress", 
  "ringing",
  "answered",
  "completed",
  "failed",
  "busy",
  "no-answer",
  "canceled",
  "voicemail"
]

export default function CallLogsPage() {
  // Data state
  const [calls, setCalls] = useState<Call[]>(mockCalls)
  const [agents] = useState<AIAgent[]>(mockAgents)
  const [isLoading, setIsLoading] = useState(false)

  // Filter state (user inputs)
  const [filters, setFilters] = useState<CallFilters>({})
  // Applied filters (triggers API call)
  const [appliedFilters, setAppliedFilters] = useState<CallFilters>({})

  // UI state
  const [expandedTagRows, setExpandedTagRows] = useState<Set<string>>(new Set())
  const [transcriptOverlay, setTranscriptOverlay] = useState<{
    isOpen: boolean
    callId: string
    contactName: string
    status: string
  }>({ isOpen: false, callId: "", contactName: "", status: "" })

  // Outbound call modal
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false)
  const [outboundCallData, setOutboundCallData] = useState({
    assistantId: "",
    toNumber: "",
    contactName: "",
  })
  const [isInitiatingCall, setIsInitiatingCall] = useState(false)

  // Polling for calls data
  useEffect(() => {
    const fetchCalls = async () => {
      // In real app: const params = new URLSearchParams(appliedFilters as any)
      // const response = await fetch(`/api/calls?${params}`)
      // setCalls(response.data)
      setIsLoading(true)
      setTimeout(() => {
        setCalls(mockCalls)
        setIsLoading(false)
      }, 300)
    }

    fetchCalls()
    const interval = setInterval(fetchCalls, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [appliedFilters])

  // Format phone number as (XXX) XXX-XXXX
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  }

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Format cost to 4 decimal places
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  // Format date as MM/DD/YYYY HH:MM AM/PM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get call ID display
  const getCallId = (call: Call) => {
    return call.roomName || call.twilioSid || call.voxsunCallId || call.id.slice(0, 12)
  }

  // Get status badge color
  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case "in-progress":
      case "ringing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "completed":
      case "answered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "failed":
      case "busy":
      case "no-answer":
      case "canceled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "voicemail":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Check if status needs tooltip
  const needsTooltip = (status: CallStatus) => {
    return ["failed", "no-answer", "busy"].includes(status)
  }

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilters({})
    setAppliedFilters({})
  }

  // Toggle tag expansion
  const toggleTagExpansion = (callId: string) => {
    setExpandedTagRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(callId)) {
        newSet.delete(callId)
      } else {
        newSet.add(callId)
      }
      return newSet
    })
  }

  // Open transcript overlay
  const openTranscript = (call: Call) => {
    setTranscriptOverlay({
      isOpen: true,
      callId: call.id,
      contactName: call.contactName,
      status: call.status,
    })
  }

  // Export calls to CSV
  const handleExport = async () => {
    // In real app: const params = new URLSearchParams(appliedFilters as any)
    // const response = await fetch(`/api/calls/export?${params}`)
    // Download the CSV
    const csvContent = "Name,Contact Number,Assistant,Date,Duration,Cost,Call ID,Status,Tags\n" +
      calls.map(call => 
        `"${call.contactName}","${formatPhone(call.contactPhone)}","${call.assistantId.name}","${formatDate(call.startedAt || call.createdAt)}","${formatDuration(call.duration)}","${formatCost(call.cost)}","${getCallId(call)}","${call.status}","${call.user_tags.join(", ")}"`
      ).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "call_logs.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Initiate outbound call
  const handleInitiateCall = async () => {
    if (!outboundCallData.assistantId || !outboundCallData.toNumber || !outboundCallData.contactName) {
      return
    }

    setIsInitiatingCall(true)
    try {
      // In real app: await fetch("/api/calls/initiate", { method: "POST", body: JSON.stringify(...) })
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Reset form and close modal
      setOutboundCallData({ assistantId: "", toNumber: "", contactName: "" })
      setIsOutboundModalOpen(false)
      // Invalidate calls query would happen here
    } catch (error: any) {
      // Handle specific error codes
      if (error?.status === 402 || error?.message?.includes("low credits")) {
        alert("Low Credits - Please add more credits to your account")
      } else if (error?.status === 409 || error?.message?.includes("already in progress")) {
        alert("Duplicate Call Detected - A call to this number is already in progress")
      } else {
        alert("Call Failed - Could not initiate the call")
      }
    } finally {
      setIsInitiatingCall(false)
    }
  }

  // Filter calls based on applied filters
  const filteredCalls = calls.filter((call) => {
    if (appliedFilters.contactName && !call.contactName.toLowerCase().includes(appliedFilters.contactName.toLowerCase())) {
      return false
    }
    if (appliedFilters.callType && call.callType !== appliedFilters.callType) {
      return false
    }
    if (appliedFilters.agentId && call.assistantId._id !== appliedFilters.agentId) {
      return false
    }
    if (appliedFilters.status && call.status !== appliedFilters.status) {
      return false
    }
    if (appliedFilters.dateFrom) {
      const fromDate = new Date(appliedFilters.dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      if (new Date(call.startedAt || call.createdAt) < fromDate) {
        return false
      }
    }
    if (appliedFilters.dateTo) {
      const toDate = new Date(appliedFilters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (new Date(call.startedAt || call.createdAt) > toDate) {
        return false
      }
    }
    return true
  })

  // Stats
  const totalCalls = filteredCalls.length
  const completedCalls = filteredCalls.filter(c => c.status === "completed" || c.status === "answered").length
  const inProgressCalls = filteredCalls.filter(c => c.status === "in-progress" || c.status === "ringing").length
  const failedCalls = filteredCalls.filter(c => c.status === "failed").length

  return (
    <div className={cn("flex flex-col gap-6", transcriptOverlay.isOpen && "mr-[400px]")}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Call Logs</h1>
          <p className="text-muted-foreground">View and manage all AI agent calls</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsOutboundModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Outbound Call
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Phone className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Phone className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Phone className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCalls}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom?.split("T")[0] || ""}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo?.split("T")[0] || ""}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label>Call Type</Label>
              <Select
                value={filters.callType || "all"}
                onValueChange={(v) => setFilters({ ...filters, callType: v === "all" ? undefined : v as "inbound" | "outbound" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select
                value={filters.agentId || "all"}
                onValueChange={(v) => setFilters({ ...filters, agentId: v === "all" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? undefined : v as CallStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CALL_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                placeholder="Search by name..."
                value={filters.contactName || ""}
                onChange={(e) => setFilters({ ...filters, contactName: e.target.value || undefined })}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call Table */}
      <Card>
        <CardContent className="p-0">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Call ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Recording</TableHead>
                  <TableHead>Transcript</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCalls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      No calls found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">{call.contactName}</TableCell>
                      <TableCell>{formatPhone(call.contactPhone)}</TableCell>
                      <TableCell>{call.assistantId.name}</TableCell>
                      <TableCell>{formatDate(call.startedAt || call.createdAt)}</TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell>{formatCost(call.cost)}</TableCell>
                      <TableCell className="font-mono text-xs">{getCallId(call)}</TableCell>
                      <TableCell>
                        {needsTooltip(call.status) && (call.errorMessage || call.endReason) ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className={cn("cursor-help", getStatusColor(call.status))}>
                                {call.status}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{call.errorMessage || call.endReason}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="secondary" className={getStatusColor(call.status)}>
                            {call.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {call.user_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {expandedTagRows.has(call.id) ? (
                              <>
                                {call.user_tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                                <button
                                  onClick={() => toggleTagExpansion(call.id)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  Show less
                                </button>
                              </>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">{call.user_tags[0]}</Badge>
                                {call.user_tags.length > 1 && (
                                  <button
                                    onClick={() => toggleTagExpansion(call.id)}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    +{call.user_tags.length - 1} more
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {call.recording ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(call.recording, "_blank")}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTranscript(call)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Transcript
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Create Outbound Call Modal */}
      <Dialog open={isOutboundModalOpen} onOpenChange={setIsOutboundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Outbound Call</DialogTitle>
            <DialogDescription>
              Initiate a new outbound call using an AI agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assistant">Select Assistant</Label>
              <Select
                value={outboundCallData.assistantId}
                onValueChange={(v) => setOutboundCallData({ ...outboundCallData, assistantId: v })}
              >
                <SelectTrigger id="assistant">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toNumber">To Number</Label>
              <Input
                id="toNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={outboundCallData.toNumber}
                onChange={(e) => setOutboundCallData({ ...outboundCallData, toNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNameModal">Contact Name</Label>
              <Input
                id="contactNameModal"
                placeholder="John Smith"
                value={outboundCallData.contactName}
                onChange={(e) => setOutboundCallData({ ...outboundCallData, contactName: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOutboundModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInitiateCall}
              disabled={!outboundCallData.assistantId || !outboundCallData.toNumber || !outboundCallData.contactName || isInitiatingCall}
            >
              {isInitiatingCall ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Initiating...
                </>
              ) : (
                <>
                  <PhoneOutgoing className="mr-2 h-4 w-4" />
                  Start Call
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transcript Overlay */}
      <TranscriptOverlay
        isOpen={transcriptOverlay.isOpen}
        onClose={() => setTranscriptOverlay({ ...transcriptOverlay, isOpen: false })}
        callId={transcriptOverlay.callId}
        contactName={transcriptOverlay.contactName}
        status={transcriptOverlay.status}
      />
    </div>
  )
}
