"use client";

import {Label} from "@/components/ui/label";

import {useState} from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {DashboardHeader} from "@/components/dashboard-header";
import {CanvasResponse} from "@/components/canvas-response";
import {Icons} from "@/components/icons";

interface ConversationItem {
    id: string;
    type: "voice" | "chat" | "data-query";
    title: string;
    content: string;
    response?: string;
    timestamp: Date;
    duration?: string;
    status: "completed" | "failed" | "processing";
    canvasData?: any;
    hasVoice?: boolean;
}

const mockConversations: ConversationItem[] = [
    {
        id: "1",
        type: "voice",
        title: "Sales Performance Analysis",
        content:
            "Show me the Q4 sales performance breakdown by region",
        response:
            "Your Q4 sales performance shows strong growth across all regions. The West Coast leads with 35% growth, followed by East Coast at 28%. Here's the detailed breakdown with visual analytics.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        duration: "2m 15s",
        status: "completed",
        hasVoice: true,
        canvasData: {
            type: "chart",
            data: {
                labels: [
                    "West Coast",
                    "East Coast",
                    "Midwest",
                    "South",
                ],
                datasets: [
                    {
                        label: "Sales Growth %",
                        data: [35, 28, 22, 18],
                        backgroundColor: [
                            "#10b981",
                            "#3b82f6",
                            "#8b5cf6",
                            "#f59e0b",
                        ],
                    },
                ],
            },
        },
    },
    {
        id: "2",
        type: "chat",
        title: "Customer Segmentation Query",
        content:
            "Analyze customer segmentation based on purchase behavior",
        response:
            "I've analyzed your customer base and identified 4 key segments: High-value customers (15%), Regular buyers (45%), Occasional shoppers (30%), and New customers (10%). Each segment shows distinct patterns.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        duration: "1m 45s",
        status: "completed",
        canvasData: {
            type: "metrics",
            data: {
                "High-Value": "15%",
                Regular: "45%",
                Occasional: "30%",
                New: "10%",
            },
        },
    },
    {
        id: "3",
        type: "data-query",
        title: "Google Analytics Integration",
        content:
            "Connect Google Analytics and pull website traffic metrics",
        response:
            "Successfully connected to Google Analytics. Your website traffic has increased by 23% this month with 45,678 unique visitors. Mobile traffic accounts for 68% of total visits.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        duration: "3m 20s",
        status: "completed",
    },
    {
        id: "4",
        type: "voice",
        title: "Inventory Management",
        content:
            "What are the current low stock alerts and reorder recommendations?",
        response:
            "You have 12 items with low stock levels. Priority reorders needed for: Product A (5 units left), Product B (8 units), Product C (3 units). Recommended reorder quantities calculated based on sales velocity.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        duration: "1m 30s",
        status: "completed",
        hasVoice: true,
    },
    {
        id: "5",
        type: "chat",
        title: "Financial Forecast",
        content:
            "Generate 6-month financial forecast based on historical data",
        response:
            "Error: Unable to access financial data source. Please check your connection settings.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        duration: "4m 10s",
        status: "failed",
    },
];

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedConversation, setSelectedConversation] =
        useState<ConversationItem | null>(null);

    const filteredHistory = mockConversations.filter((item) => {
        const matchesSearch =
            item.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            item.content
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesType =
            filterType === "all" || item.type === filterType;
        const matchesStatus =
            filterStatus === "all" || item.status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "voice":
                return <Icons.mic className="w-4 h-4" />;
            case "chat":
                return <Icons.messageSquare className="w-4 h-4" />;
            case "data-query":
                return <Icons.database className="w-4 h-4" />;
            default:
                return <Icons.activity className="w-4 h-4" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge variant="default" className="bg-green-500">
                        Completed
                    </Badge>
                );
            case "failed":
                return <Badge variant="destructive">Failed</Badge>;
            case "processing":
                return <Badge variant="secondary">Processing</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const speakText = (text: string) => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title="Conversation History" />

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                        <CardDescription>
                            Find your past conversations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full"
                        />
                        <Select
                            value={filterType}
                            onValueChange={setFilterType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Types
                                </SelectItem>
                                <SelectItem value="voice">
                                    Voice
                                </SelectItem>
                                <SelectItem value="chat">
                                    Chat
                                </SelectItem>
                                <SelectItem value="data-query">
                                    Data Query
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Status
                                </SelectItem>
                                <SelectItem value="completed">
                                    Completed
                                </SelectItem>
                                <SelectItem value="failed">
                                    Failed
                                </SelectItem>
                                <SelectItem value="processing">
                                    Processing
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                        <CardDescription>
                            {filteredHistory.length} conversation
                            {filteredHistory.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3">
                                {filteredHistory.map((item) => (
                                    <Card
                                        key={item.id}
                                        className={`border-l-4 border-l-green-500 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                                            selectedConversation?.id ===
                                            item.id
                                                ? "bg-slate-100 dark:bg-slate-800"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedConversation(
                                                item
                                            )
                                        }
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1">
                                                        {getTypeIcon(
                                                            item.type
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-sm">
                                                                {
                                                                    item.title
                                                                }
                                                            </h3>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    item.type
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                                                            {
                                                                item.content
                                                            }
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Icons.clock className="w-3 h-3" />
                                                                {item.timestamp.toLocaleString()}
                                                            </span>
                                                            {item.duration && (
                                                                <span className="flex items-center gap-1">
                                                                    <Icons.timer className="w-3 h-3" />
                                                                    {
                                                                        item.duration
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(
                                                        item.status
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {filteredHistory.length === 0 && (
                                    <div className="text-center py-8">
                                        <Icons.search className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No conversations found
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Try adjusting your search
                                            terms or filters
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {selectedConversation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(selectedConversation.type)}
                            {selectedConversation.title}
                            {selectedConversation.hasVoice && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        selectedConversation.response &&
                                        speakText(
                                            selectedConversation.response
                                        )
                                    }
                                >
                                    <Icons.volume2 className="w-4 h-4 mr-2" />
                                    Play Response
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Conversation details and AI response
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            defaultValue="conversation"
                            className="w-full"
                        >
                            <TabsList>
                                <TabsTrigger value="conversation">
                                    Conversation
                                </TabsTrigger>
                                <TabsTrigger value="analytics">
                                    Analytics
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="conversation"
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-2">
                                            Your Query:
                                        </h4>
                                        <p className="text-sm">
                                            {
                                                selectedConversation.content
                                            }
                                        </p>
                                    </div>
                                    {selectedConversation.response && (
                                        <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm mb-2">
                                                AI Response:
                                            </h4>
                                            <p className="text-sm mb-3">
                                                {
                                                    selectedConversation.response
                                                }
                                            </p>
                                            {selectedConversation.canvasData && (
                                                <CanvasResponse
                                                    data={
                                                        selectedConversation.canvasData
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="analytics"
                                className="space-y-4"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Duration
                                        </Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {selectedConversation.duration ||
                                                "N/A"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Status
                                        </Label>
                                        <div>
                                            {getStatusBadge(
                                                selectedConversation.status
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Type
                                        </Label>
                                        <Badge variant="outline">
                                            {
                                                selectedConversation.type
                                            }
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">
                                            Timestamp
                                        </Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {selectedConversation.timestamp.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
