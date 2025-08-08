"use client";

import {useState} from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {Progress} from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {DashboardHeader} from "@/components/dashboard-header";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";
import {Download, Eye} from "lucide-react";

interface BillingHistory {
    id: string;
    date: string;
    amount: string;
    status: "paid" | "pending" | "failed";
    description: string;
    invoiceUrl?: string;
}

interface UsageMetric {
    name: string;
    current: number;
    limit: number;
    unit: string;
}

const mockBillingHistory: BillingHistory[] = [
    {
        id: "1",
        date: "Dec 1, 2023",
        amount: "$49.00",
        status: "paid",
        description: "Professional Plan - Monthly",
        invoiceUrl: "#",
    },
    {
        id: "2",
        date: "Nov 1, 2023",
        amount: "$49.00",
        status: "paid",
        description: "Professional Plan - Monthly",
        invoiceUrl: "#",
    },
    {
        id: "3",
        date: "Oct 1, 2023",
        amount: "$49.00",
        status: "paid",
        description: "Professional Plan - Monthly",
        invoiceUrl: "#",
    },
    {
        id: "4",
        date: "Sep 1, 2023",
        amount: "$29.00",
        status: "paid",
        description: "Starter Plan - Monthly",
        invoiceUrl: "#",
    },
];

const usageMetrics: UsageMetric[] = [
    {name: "Team Members", current: 12, limit: 25, unit: "users"},
    {
        name: "Data Sources",
        current: 8,
        limit: 15,
        unit: "connections",
    },
    {
        name: "AI Conversations",
        current: 2847,
        limit: 5000,
        unit: "messages",
    },
    {name: "Storage Used", current: 2.3, limit: 10, unit: "GB"},
];

const plans = [
    {
        name: "Starter",
        price: "$29",
        period: "month",
        description: "Perfect for small teams getting started",
        features: [
            "Up to 5 team members",
            "5 data source connections",
            "1,000 AI conversations/month",
            "5GB storage",
            "Email support",
        ],
        current: false,
    },
    {
        name: "Professional",
        price: "$49",
        period: "month",
        description: "Ideal for growing businesses",
        features: [
            "Up to 25 team members",
            "15 data source connections",
            "5,000 AI conversations/month",
            "10GB storage",
            "Priority support",
            "Advanced analytics",
        ],
        current: true,
    },
    {
        name: "Enterprise",
        price: "$99",
        period: "month",
        description: "For large organizations with advanced needs",
        features: [
            "Unlimited team members",
            "Unlimited data sources",
            "Unlimited AI conversations",
            "100GB storage",
            "24/7 phone support",
            "Custom integrations",
            "SSO & advanced security",
        ],
        current: false,
    },
];

export default function BillingPage() {
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] =
        useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();

    const handlePlanChange = async (planName: string) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsUpgradeDialogOpen(false);
            toast({
                title: "Plan updated",
                description: `Successfully upgraded to ${planName} plan.`,
            });
        }, 2000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title="Billing & Usage" />

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                            Your active subscription
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold">
                                    Professional
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    $49/month
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Next billing date</span>
                                    <span>Jan 15, 2024</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Payment method</span>
                                    <span>•••• 4242</span>
                                </div>
                            </div>
                            <Dialog
                                open={isUpgradeDialogOpen}
                                onOpenChange={setIsUpgradeDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        Manage Plan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Choose Your Plan
                                        </DialogTitle>
                                        <DialogDescription>
                                            Select the plan that best
                                            fits your organization's
                                            needs
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {plans.map((plan) => (
                                            <Card
                                                key={plan.name}
                                                className={`cursor-pointer transition-colors ${
                                                    selectedPlan ===
                                                    plan.name
                                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                        : plan.current
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedPlan(
                                                        plan.name
                                                    )
                                                }
                                            >
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg">
                                                            {
                                                                plan.name
                                                            }
                                                        </CardTitle>
                                                        {plan.current && (
                                                            <Badge className="bg-blue-500">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-3xl font-bold">
                                                            {
                                                                plan.price
                                                            }
                                                        </span>
                                                        <span className="text-slate-600 dark:text-slate-400">
                                                            /
                                                            {
                                                                plan.period
                                                            }
                                                        </span>
                                                    </div>
                                                    <CardDescription>
                                                        {
                                                            plan.description
                                                        }
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <ul className="space-y-2">
                                                        {plan.features.map(
                                                            (
                                                                feature,
                                                                index
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        index
                                                                    }
                                                                    className="flex items-center gap-2 text-sm"
                                                                >
                                                                    <Icons.check className="w-4 h-4 text-green-500" />
                                                                    {
                                                                        feature
                                                                    }
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setIsUpgradeDialogOpen(
                                                    false
                                                )
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handlePlanChange(
                                                    selectedPlan
                                                )
                                            }
                                            disabled={
                                                isLoading ||
                                                !selectedPlan ||
                                                selectedPlan ===
                                                    "Professional"
                                            }
                                        >
                                            {isLoading && (
                                                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            {selectedPlan ===
                                            "Professional"
                                                ? "Current Plan"
                                                : `Upgrade to ${selectedPlan}`}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>This Month</CardTitle>
                        <CardDescription>
                            Current billing period usage
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold">
                                    $49.00
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Current charges
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Professional Plan</span>
                                    <span>$49.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Additional usage</span>
                                    <span>$0.00</span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>$49.00</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>
                            Your default payment method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        VISA
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        •••• •••• •••• 4242
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Expires 12/2025
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full bg-transparent"
                            >
                                <Icons.creditCard className="w-4 h-4 mr-2" />
                                Update Payment Method
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="usage" className="w-full">
                <TabsList>
                    <TabsTrigger value="usage">
                        Usage & Limits
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        Billing History
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                        Invoices
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="usage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Usage</CardTitle>
                            <CardDescription>
                                Monitor your plan limits and usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {usageMetrics.map((metric) => (
                                    <div
                                        key={metric.name}
                                        className="space-y-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold">
                                                {metric.name}
                                            </h3>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {metric.current} /{" "}
                                                {metric.limit}{" "}
                                                {metric.unit}
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                (metric.current /
                                                    metric.limit) *
                                                100
                                            }
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>
                                                {Math.round(
                                                    (metric.current /
                                                        metric.limit) *
                                                        100
                                                )}
                                                % used
                                            </span>
                                            <span>
                                                {metric.limit -
                                                    metric.current}{" "}
                                                {metric.unit}{" "}
                                                remaining
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>
                                Your past payments and charges
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockBillingHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div>
                                            <h3 className="font-semibold">
                                                {item.description}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {item.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">
                                                {item.amount}
                                            </span>
                                            {getStatusBadge(
                                                item.status
                                            )}
                                            {item.invoiceUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-transparent"
                                                >
                                                    <Icons.fileText className="w-4 h-4 mr-2" />
                                                    Invoice
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices & Receipts</CardTitle>
                            <CardDescription>
                                Download your invoices and receipts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockBillingHistory
                                    .filter(
                                        (item) =>
                                            item.status === "paid"
                                    )
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icons.fileText className="w-8 h-8 text-slate-400" />
                                                <div>
                                                    <h3 className="font-semibold">
                                                        Invoice #
                                                        {item.id.padStart(
                                                            6,
                                                            "0"
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {item.date} •{" "}
                                                        {item.amount}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-transparent"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-transparent"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
