import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { TenantInfo } from "@/components/tenant-info"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader />
      <TenantInfo />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatsCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  )
}
