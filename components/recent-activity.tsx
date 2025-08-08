import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Icons} from "@/components/icons";

const activities = [
    {
        id: "1",
        type: "voice",
        title: "Sales Analysis Request",
        time: "2 minutes ago",
        status: "completed",
    },
    {
        id: "2",
        type: "data",
        title: "Google Analytics Connected",
        time: "1 hour ago",
        status: "completed",
    },
    {
        id: "3",
        type: "chat",
        title: "Customer Insights Query",
        time: "3 hours ago",
        status: "completed",
    },
    {
        id: "4",
        type: "voice",
        title: "Financial Forecast",
        time: "1 day ago",
        status: "failed",
    },
];

export function RecentActivity() {
    const getIcon = (type: string) => {
        switch (type) {
            case "voice":
                return <Icons.mic className="h-4 w-4" />;
            case "data":
                return <Icons.database className="h-4 w-4" />;
            case "chat":
                return <Icons.messageSquare className="h-4 w-4" />;
            default:
                return <Icons.activity className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        return status === "completed" ? (
            <Badge variant="default" className="bg-green-500">
                Completed
            </Badge>
        ) : (
            <Badge variant="destructive">Failed</Badge>
        );
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Your latest interactions and data updates
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {getIcon(activity.type)}
                                <div>
                                    <p className="text-sm font-medium">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                            {getStatusBadge(activity.status)}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
