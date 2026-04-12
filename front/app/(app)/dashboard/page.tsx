import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { CallsChart } from "@/components/dashboard/calls-chart"
import { RecentCalls } from "@/components/dashboard/recent-calls"
import { AgentPerformance } from "@/components/dashboard/agent-performance"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 md:p-6 lg:ml-64">
        <DashboardHeader />
        
        <div className="mt-6 space-y-6">
          {/* Stats Cards */}
          <DashboardStats />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CallsChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Recent Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentCalls />
            <AgentPerformance />
          </div>
        </div>
      </main>
    </div>
  )
}
