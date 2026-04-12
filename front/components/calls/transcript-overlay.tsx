"use client"

import { useEffect, useState } from "react"
import { X, User, Bot, Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TranscriptSegment {
  speaker: "agent" | "customer"
  text: string
  timestamp: string
}

interface TranscriptOverlayProps {
  isOpen: boolean
  onClose: () => void
  callId: string
  contactName: string
  status: string
}

// Mock transcript data - in real app this would be fetched
const mockTranscript: TranscriptSegment[] = [
  { speaker: "agent", text: "Hi, this is Sarah from BoostMyDeal. Am I speaking with the decision maker regarding your sales operations?", timestamp: "0:00" },
  { speaker: "customer", text: "Yes, this is John. How can I help you?", timestamp: "0:08" },
  { speaker: "agent", text: "Great! I'm reaching out because we specialize in AI-powered sales automation. I noticed your company has been growing rapidly and wanted to see if you're currently looking to scale your outreach efforts.", timestamp: "0:12" },
  { speaker: "customer", text: "Actually, yes. We've been struggling to keep up with lead follow-ups. What does your solution offer?", timestamp: "0:28" },
  { speaker: "agent", text: "That's exactly what we help with. Our AI voice agents can handle outbound calls 24/7, qualify leads, and book meetings directly into your calendar. Most of our clients see a 40% increase in qualified meetings within the first month.", timestamp: "0:35" },
  { speaker: "customer", text: "That sounds interesting. What about integration with our existing CRM?", timestamp: "0:55" },
  { speaker: "agent", text: "We integrate seamlessly with HubSpot, Salesforce, Zoho, and most major CRMs. All call data, transcripts, and lead scores sync automatically.", timestamp: "1:02" },
  { speaker: "customer", text: "Great. What's the pricing like?", timestamp: "1:15" },
  { speaker: "agent", text: "We have plans starting at $99 per month for startups, and enterprise plans with custom pricing. Would you like me to schedule a demo so you can see it in action?", timestamp: "1:20" },
  { speaker: "customer", text: "Yes, that would be helpful. I'm available next Tuesday afternoon.", timestamp: "1:38" },
  { speaker: "agent", text: "Perfect! I'll send you a calendar invite for Tuesday at 2 PM. Is there anything specific you'd like us to cover in the demo?", timestamp: "1:45" },
  { speaker: "customer", text: "I'd like to see the CRM integration and how you handle objections.", timestamp: "1:58" },
  { speaker: "agent", text: "Absolutely, we'll make sure to cover those. You'll receive the invite shortly. Thank you for your time, John!", timestamp: "2:05" },
]

export function TranscriptOverlay({ isOpen, onClose, callId, contactName, status }: TranscriptOverlayProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && callId) {
      setIsLoading(true)
      // Simulate API call - in real app: fetch(`/api/calls/${callId}/transcript`)
      setTimeout(() => {
        setTranscript(mockTranscript)
        setIsLoading(false)
      }, 500)
    }
  }, [isOpen, callId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "answered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
      case "ringing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "failed":
      case "busy":
      case "no-answer":
      case "canceled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const copyTranscript = () => {
    const text = transcript
      .map(seg => `[${seg.timestamp}] ${seg.speaker === "agent" ? "Agent" : contactName}: ${seg.text}`)
      .join("\n\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTranscript = () => {
    const text = transcript
      .map(seg => `[${seg.timestamp}] ${seg.speaker === "agent" ? "Agent" : contactName}: ${seg.text}`)
      .join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcript-${callId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold">{contactName}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Call ID: {callId.slice(0, 8)}...</span>
              <Badge variant="secondary" className={cn("text-xs", getStatusColor(status))}>
                {status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={copyTranscript}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={downloadTranscript}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Transcript Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transcript.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transcript available for this call.
            </div>
          ) : (
            transcript.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={segment.speaker === "agent" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {segment.speaker === "agent" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {segment.speaker === "agent" ? "AI Agent" : contactName}
                    </span>
                    <span className="text-xs text-muted-foreground">{segment.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{segment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
