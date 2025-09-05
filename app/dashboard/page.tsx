import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCards } from "@/components/stats-cards"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { TenantInfo } from "@/components/tenant-info"
import { ProfileProgress } from "@/components/profile-progress"
import { getTenant } from "@/lib/actions/tenant/tenant"
import { getUser } from "@/lib/actions/auth/getUser"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic' // Force dynamic rendering

export default async function DashboardPage() {
  const user = await getUser();
  let tenantData = null;

  if (user?.status === "success" && user.response?.data?.tenant_id) {
    const tenant = await getTenant(user.response.data.tenant_id);
    if (tenant?.status === "success") {
      tenantData = tenant.response.data;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader />
      <TenantInfo />
      {tenantData && (
        <ProfileProgress
          hasOwnerInfoCompleted={tenantData.has_owner_information_completed}
          hasOrganizationInfoCompleted={tenantData.has_organization_info_completed}
          hasFirstDataSourceConnected={tenantData.has_first_data_source_connected}
        />
      )}
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
