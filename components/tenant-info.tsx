import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { getTenant } from "@/lib/actions/tenant/tenant";
import { getUser } from "@/lib/actions/auth/getUser";
import { redirect } from "next/navigation";

export async function TenantInfo() {
  const userResponse = await getUser();
  const tenantResult = await getTenant(userResponse?.response?.data?.tenant_id);

  const tenantData = tenantResult.response.data;

  if (tenantResult.status === 'failed') {
    redirect('/login');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.building className="w-5 h-5" />
          Business Overview
        </CardTitle>
        <CardDescription>
          {tenantData.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Organization
            </p>
            <p className="text-2xl font-bold">
              {tenantData.name}
            </p>
            <p className="text-xs text-slate-500">
              acme.aiassistant.com
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Plan</p>
            <Badge className="bg-violet-800 text-white">
              Professional
            </Badge>
            <p className="text-xs text-slate-500">
              $49/month
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Users</p>
            <p className="text-2xl font-bold">12/25</p>
            <p className="text-xs text-slate-500">
              Active users
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Data Sources
            </p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-slate-500">
              Connected
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
