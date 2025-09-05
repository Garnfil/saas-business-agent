"use client";

import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProfileProgressProps {
  hasOwnerInfoCompleted: number;
  hasOrganizationInfoCompleted: number;
  hasFirstDataSourceConnected: number;
}

export function ProfileProgress({
  hasOwnerInfoCompleted,
  hasOrganizationInfoCompleted,
  hasFirstDataSourceConnected,
}: ProfileProgressProps) {
  const router = useRouter();
  const completedSteps = hasOwnerInfoCompleted + hasOrganizationInfoCompleted + hasFirstDataSourceConnected;
  const totalSteps = 3;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getNextStepUrl = () => {
    if (!hasOwnerInfoCompleted) return "/dashboard/profile";
    if (!hasOrganizationInfoCompleted) return "/dashboard/profile?tab=organization";
    if (!hasFirstDataSourceConnected) return "/dashboard/data-sources";
    return "#";
  };

  const nextStepUrl = getNextStepUrl();
  const isComplete = completionPercentage === 100;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Profile Progress</h3>
          <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your profile to unlock all features
        </p>
        <Progress value={completionPercentage} className="h-2 [&>div]:bg-violet-600" />
        {!isComplete && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="text-violet-600 hover:bg-transparent hover:text-violet-700"
              onClick={() => router.push(nextStepUrl)}
            >
              {!hasOwnerInfoCompleted && "Complete Profile"}
              {hasOwnerInfoCompleted && !hasOrganizationInfoCompleted && "Add Organization Info"}
              {hasOwnerInfoCompleted && hasOrganizationInfoCompleted && !hasFirstDataSourceConnected && "Connect Data Source"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}