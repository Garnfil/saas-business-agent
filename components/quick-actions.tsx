import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import Link from "next/link"

const actions = [
  {
    title: "Start Voice Session",
    description: "Begin a new conversation with your AI assistant",
    icon: Icons.mic,
    href: "/dashboard/voice-assistant",
  },
  {
    title: "Connect Data Source",
    description: "Add a new data integration",
    icon: Icons.plus,
    href: "/dashboard/data-sources",
  },
  {
    title: "View Analytics",
    description: "Check your business metrics",
    icon: Icons.barChart,
    href: "/dashboard/analytics",
  },
  {
    title: "Generate Report",
    description: "Create a new business report",
    icon: Icons.fileText,
    href: "/dashboard/reports",
  },
]

export function QuickActions() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 bg-transparent"
            asChild
          >
            <Link href={action.href}>
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-semibold">{action.title}</span>
              </div>
              <span className="text-sm text-muted-foreground text-left">{action.description}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
