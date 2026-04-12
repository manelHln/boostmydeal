"use client"

import { 
  LayoutDashboard, 
  Bot, 
  Phone, 
  GitBranch, 
  BarChart3, 
  Users, 
  Plug, 
  BookOpen, 
  Settings, 
  HelpCircle, 
  LogOut,
  CreditCard,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoIcon } from "@/components/ui/logo"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Bot, label: "AI Agents", href: "/agents" },
  { icon: Phone, label: "Call Logs", badge: "24", href: "/calls" },
  { icon: GitBranch, label: "Workflows", href: "/workflows" },
  { icon: BookOpen, label: "Knowledge Base", href: "/knowledge" },
  { icon: Plug, label: "Integrations", href: "/integrations" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
]

const teamItems = [
  { icon: Users, label: "Team", href: "/team" },
  { icon: Bell, label: "Notifications", badge: "5", href: "/notifications" },
]

const generalItems = [
  { icon: CreditCard, label: "Billing", href: "/billing" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
  { icon: LogOut, label: "Logout", href: "/logout" },
]

export function Sidebar() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const pathname = usePathname()

  const renderNavItem = (item: typeof menuItems[0]) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
    return (
      <Link
        key={item.label}
        href={item.href}
        onMouseEnter={() => setHoveredItem(item.label)}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-300",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          hoveredItem === item.label && !isActive && "translate-x-1",
        )}
      >
        <item.icon className="w-4 h-4" />
        <span className="text-sm">{item.label}</span>
        {"badge" in item && item.badge && (
          <span className={cn(
            "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            isActive 
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-primary text-primary-foreground"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="fixed top-0 left-0 w-64 bg-card border-r border-border p-4 h-screen overflow-y-auto lg:block custom-scrollbar">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 group cursor-pointer">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoIcon size="lg" />
          <span className="text-lg font-semibold text-foreground">BoostMyDeal</span>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Main Menu */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Main Menu
          </p>
          <nav className="space-y-0.5">
            {menuItems.map(renderNavItem)}
          </nav>
        </div>

        {/* Team */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Team
          </p>
          <nav className="space-y-0.5">
            {teamItems.map(renderNavItem)}
          </nav>
        </div>

        {/* General */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            General
          </p>
          <nav className="space-y-0.5">
            {generalItems.map(renderNavItem)}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
