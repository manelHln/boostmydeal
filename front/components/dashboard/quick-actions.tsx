"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Bot, Upload, GitBranch, Plug, Settings } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface QuickAction {
  icon: typeof Phone
  label: string
  description: string
  href: string
  variant: "primary" | "secondary"
}

const actions: QuickAction[] = [
  {
    icon: Phone,
    label: "Start New Call",
    description: "Initiate an outbound call",
    href: "/calls/new",
    variant: "primary",
  },
  {
    icon: Bot,
    label: "Create Agent",
    description: "Configure a new AI agent",
    href: "/agents/new",
    variant: "secondary",
  },
  {
    icon: Upload,
    label: "Import Leads",
    description: "Upload contacts for calling",
    href: "/leads/import",
    variant: "secondary",
  },
  {
    icon: GitBranch,
    label: "Build Workflow",
    description: "Create automation rules",
    href: "/workflows/new",
    variant: "secondary",
  },
  {
    icon: Plug,
    label: "Add Integration",
    description: "Connect your CRM or tools",
    href: "/integrations",
    variant: "secondary",
  },
]

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant={action.variant === "primary" ? "default" : "outline"}
              className={cn(
                "w-full justify-start gap-3 h-auto py-3 px-4",
                action.variant === "primary" && "bg-primary hover:bg-primary/90"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg",
                action.variant === "primary" 
                  ? "bg-primary-foreground/20" 
                  : "bg-muted"
              )}>
                <action.icon className={cn(
                  "w-4 h-4",
                  action.variant === "primary" 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground"
                )} />
              </div>
              <div className="text-left">
                <p className={cn(
                  "font-medium text-sm",
                  action.variant === "primary" 
                    ? "text-primary-foreground" 
                    : "text-foreground"
                )}>
                  {action.label}
                </p>
                <p className={cn(
                  "text-xs",
                  action.variant === "primary" 
                    ? "text-primary-foreground/70" 
                    : "text-muted-foreground"
                )}>
                  {action.description}
                </p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
