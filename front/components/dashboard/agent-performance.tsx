"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bot, ArrowRight, TrendingUp, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AgentStats {
  id: string
  name: string
  status: "active" | "inactive"
  totalCalls: number
  successRate: number
  emailsSent: number
  meetingsBooked: number
  trend: "up" | "down" | "neutral"
}

const agents: AgentStats[] = [
  {
    id: "1",
    name: "Sales Agent",
    status: "active",
    totalCalls: 156,
    successRate: 78,
    emailsSent: 89,
    meetingsBooked: 12,
    trend: "up",
  },
  {
    id: "2",
    name: "Support Agent",
    status: "active",
    totalCalls: 89,
    successRate: 92,
    emailsSent: 45,
    meetingsBooked: 3,
    trend: "up",
  },
  {
    id: "3",
    name: "Demo Agent",
    status: "inactive",
    totalCalls: 23,
    successRate: 65,
    emailsSent: 12,
    meetingsBooked: 5,
    trend: "down",
  },
]

export function AgentPerformance() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Agent Performance</CardTitle>
        <Link href="/agents">
          <Button variant="ghost" size="sm" className="text-sm gap-1">
            Manage Agents <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    agent.status === "active" ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Bot className={cn(
                      "w-5 h-5",
                      agent.status === "active" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{agent.name}</p>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        agent.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                      )} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {agent.totalCalls} calls today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {agent.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className={cn(
                    "font-semibold",
                    agent.trend === "up" ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    {agent.successRate}%
                  </span>
                </div>
              </div>

              {/* Success Rate Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">{agent.successRate}%</span>
                </div>
                <Progress value={agent.successRate} className="h-1.5" />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{agent.totalCalls} calls</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span>{agent.emailsSent} emails</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{agent.meetingsBooked} meetings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
