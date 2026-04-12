"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CallItem {
  id: string
  contactName: string
  contactInitials: string
  phoneNumber: string
  direction: "inbound" | "outbound"
  status: "completed" | "missed" | "failed" | "in_progress"
  duration?: string
  time: string
  agent: string
}

const recentCalls: CallItem[] = [
  {
    id: "1",
    contactName: "Sarah Johnson",
    contactInitials: "SJ",
    phoneNumber: "+1 (555) 123-4567",
    direction: "outbound",
    status: "completed",
    duration: "5:32",
    time: "2 min ago",
    agent: "Sales Agent",
  },
  {
    id: "2",
    contactName: "Mike Chen",
    contactInitials: "MC",
    phoneNumber: "+1 (555) 234-5678",
    direction: "inbound",
    status: "completed",
    duration: "3:18",
    time: "15 min ago",
    agent: "Support Agent",
  },
  {
    id: "3",
    contactName: "Emily Davis",
    contactInitials: "ED",
    phoneNumber: "+1 (555) 345-6789",
    direction: "outbound",
    status: "missed",
    time: "32 min ago",
    agent: "Sales Agent",
  },
  {
    id: "4",
    contactName: "Alex Thompson",
    contactInitials: "AT",
    phoneNumber: "+1 (555) 456-7890",
    direction: "outbound",
    status: "in_progress",
    duration: "2:45",
    time: "Now",
    agent: "Demo Agent",
  },
  {
    id: "5",
    contactName: "Lisa Wang",
    contactInitials: "LW",
    phoneNumber: "+1 (555) 567-8901",
    direction: "inbound",
    status: "completed",
    duration: "8:12",
    time: "1 hr ago",
    agent: "Sales Agent",
  },
]

const statusConfig = {
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" },
  missed: { label: "Missed", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
}

export function RecentCalls() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Recent Calls</CardTitle>
        <Link href="/calls">
          <Button variant="ghost" size="sm" className="text-sm gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {call.contactInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{call.contactName}</p>
                    {call.direction === "inbound" ? (
                      <PhoneIncoming className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <PhoneOutgoing className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{call.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant="secondary" className={cn("text-xs", statusConfig[call.status].className)}>
                    {statusConfig[call.status].label}
                  </Badge>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    {call.duration && (
                      <>
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{call.duration}</span>
                        <span className="text-muted-foreground mx-1">-</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">{call.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
