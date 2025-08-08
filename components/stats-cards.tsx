import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const stats = [
  {
    title: "Total Conversations",
    value: "2,847",
    description: "+12% from last month",
    icon: Icons.messageSquare,
    trend: "up",
  },
  {
    title: "Data Sources Connected",
    value: "8",
    description: "3 new this month",
    icon: Icons.database,
    trend: "up",
  },
  {
    title: "Insights Generated",
    value: "1,234",
    description: "+8% from last month",
    icon: Icons.lightbulb,
    trend: "up",
  },
]

export function StatsCards() {
  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
