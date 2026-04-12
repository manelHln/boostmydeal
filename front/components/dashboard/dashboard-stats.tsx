"use client"

import { Card } from "@/components/ui/card"
import { Phone, PhoneIncoming, PhoneOff, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: typeof Phone
  iconBg: string
  iconColor: string
}

const stats: StatCardProps[] = [
  {
    title: "Total Calls Today",
    value: "247",
    change: "+12.5%",
    trend: "up",
    icon: Phone,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Successful Calls",
    value: "189",
    change: "+8.2%",
    trend: "up",
    icon: PhoneIncoming,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "Missed / Failed",
    value: "58",
    change: "-3.1%",
    trend: "down",
    icon: PhoneOff,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
  },
  {
    title: "Avg Duration",
    value: "4:32",
    change: "+15s",
    trend: "up",
    icon: Clock,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
]

function StatCard({ title, value, change, trend, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className={cn(
            "flex items-center gap-1 mt-2 text-sm",
            trend === "up" ? "text-emerald-500" : "text-red-500"
          )}>
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
            <span className="text-muted-foreground ml-1">vs last week</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
