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
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {DashboardHeader} from "@/components/dashboard-header";
import {Icons} from "@/components/icons";
import {useRouter} from "next/navigation";
import {Signal} from "lucide-react";
import Image from "next/image";

interface DataSource {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string | React.ReactNode;
    status: "available" | "connected" | "coming-soon";
    supportLevel: "community" | "certified" | "enterprise";
    version?: string;
    lastUpdated?: string;
    popularity?: number;
}

const dataSources: DataSource[] = [
    {
        id: "google-sheets",
        name: "Google Sheets",
        description:
            "Connect to Google Sheets spreadsheets for data analysis and reporting",
        category: "Productivity",
        icon: "📊",
        status: "connected",
        supportLevel: "certified",
        version: "1.2.3",
        lastUpdated: "2 days ago",
        popularity: 95,
    },
    {
        id: "monday",
        name: "Monday.com",
        description:
            "Connect Monday.com for managing leads, projects, tasks and everything.",
        category: "CRM",
        icon: (
            <Image
                alt="Monday.com Logo"
                width={40}
                height={40}
                src={"/monday-sm-logo.png"}
            />
        ),
        status: "available",
        supportLevel: "certified",
        version: "1.2.3",
        lastUpdated: "2 days ago",
        popularity: 60,
    },
    {
        id: "postgresql",
        name: "PostgreSQL",
        description:
            "Connect to PostgreSQL databases for custom data analysis",
        category: "Database",
        icon: "🐘",
        status: "coming-soon",
        supportLevel: "enterprise",
        version: "2.0.5",
        lastUpdated: "1 week ago",
        popularity: 75,
    },
    {
        id: "mysql",
        name: "MySQL",
        description:
            "Connect to MySQL databases for data extraction and analysis",
        category: "Database",
        icon: "🗄️",
        status: "coming-soon",
        supportLevel: "certified",
        version: "1.7.3",
        lastUpdated: "4 days ago",
        popularity: 73,
    },
    {
        id: "google-analytics",
        name: "Google Analytics 4 (GA4)",
        description:
            "Pull website traffic data and user behavior analytics",
        category: "Analytics",
        icon: "📈",
        status: "coming-soon",
        supportLevel: "certified",
        version: "2.1.0",
        lastUpdated: "1 week ago",
        popularity: 88,
    },
    {
        id: "salesforce",
        name: "Salesforce",
        description:
            "Connect to Salesforce CRM for customer and sales data",
        category: "CRM",
        icon: "☁️",
        status: "coming-soon",
        supportLevel: "enterprise",
        version: "3.0.1",
        lastUpdated: "3 days ago",
        popularity: 92,
    },
    {
        id: "hubspot",
        name: "HubSpot",
        description:
            "Integrate with HubSpot for marketing and sales insights",
        category: "CRM",
        icon: "🧡",
        status: "coming-soon",
        supportLevel: "certified",
        version: "1.8.2",
        lastUpdated: "1 day ago",
        popularity: 85,
    },
    {
        id: "stripe",
        name: "Stripe",
        description:
            "Connect payment data for financial analysis and reporting",
        category: "Finance",
        icon: "💳",
        status: "coming-soon",
        supportLevel: "certified",
        version: "2.5.0",
        lastUpdated: "5 days ago",
        popularity: 78,
    },
    {
        id: "shopify",
        name: "Shopify",
        description:
            "E-commerce data including orders, products, and customer information",
        category: "E-commerce",
        icon: "🛍️",
        status: "coming-soon",
        supportLevel: "certified",
        version: "1.9.1",
        lastUpdated: "1 week ago",
        popularity: 82,
    },
    {
        id: "slack",
        name: "Slack",
        description:
            "Team communication data and workspace analytics",
        category: "Communication",
        icon: "💬",
        status: "coming-soon",
        supportLevel: "community",
        popularity: 70,
    },
    {
        id: "notion",
        name: "Notion",
        description:
            "Connect to Notion databases and pages for content analysis",
        category: "Productivity",
        icon: "📝",
        status: "coming-soon",
        supportLevel: "community",
        popularity: 65,
    },
];

export default function DataSourcesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const router = useRouter();

    const categories = [
        "all",
        ...Array.from(new Set(dataSources.map((ds) => ds.category))),
    ];

    const filteredSources = dataSources.filter((source) => {
        const matchesSearch =
            source.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            source.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" ||
            source.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "connected":
                return (
                    <Badge className="bg-green-500">Connected</Badge>
                );
            case "available":
                return <Badge variant="outline">Available</Badge>;
            case "coming-soon":
                return <Badge variant="secondary">Coming Soon</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getSupportBadge = (level: string) => {
        switch (level) {
            case "enterprise":
                return <Badge variant="default">Enterprise</Badge>;
            case "certified":
                return (
                    <Badge className="bg-blue-500">Certified</Badge>
                );
            case "community":
                return <Badge variant="secondary">Community</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const handleConnect = (sourceId: string) => {
        router.push(`/dashboard/data-sources/configure/${sourceId}`);
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title="Data Source Connectors" />

            <Card>
                <CardHeader>
                    <CardTitle>Connect Your Data Sources</CardTitle>
                    <CardDescription>
                        Choose from our catalog of available
                        connectors to integrate your business data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search connectors..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                className="w-full"
                            />
                        </div>
                    </div>

                    <Tabs
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8">
                            {categories.map((category) => (
                                <TabsTrigger
                                    key={category}
                                    value={category}
                                    className="text-xs"
                                >
                                    {category === "all"
                                        ? "All"
                                        : category}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent
                            value={selectedCategory}
                            className="mt-6"
                        >
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredSources.map((source) => (
                                    <Card
                                        key={source.id}
                                        className="relative hover:shadow-lg transition-shadow"
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">
                                                        {source.icon}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            {
                                                                source.name
                                                            }
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {getStatusBadge(
                                                                source.status
                                                            )}
                                                            {getSupportBadge(
                                                                source.supportLevel
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="mb-4">
                                                {source.description}
                                            </CardDescription>

                                            {source.popularity && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                        <span>
                                                            Popularity
                                                        </span>
                                                        <span>
                                                            {
                                                                source.popularity
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div
                                                            className="bg-slate-500 h-2 rounded-full"
                                                            style={{
                                                                width: `${source.popularity}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {source.version && (
                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                                    <span>
                                                        Version{" "}
                                                        {
                                                            source.version
                                                        }
                                                    </span>
                                                    <span>
                                                        Updated{" "}
                                                        {
                                                            source.lastUpdated
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {source.status ===
                                                "connected" ? (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 bg-transparent"
                                                            onClick={() =>
                                                                handleConnect(
                                                                    source.id
                                                                )
                                                            }
                                                        >
                                                            <Icons.settings className="w-4 h-4 mr-2" />
                                                            Configure
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            <Icons.unplug className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : source.status ===
                                                  "available" ? (
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-violet-900 text-white hover:bg-violet-700"
                                                        onClick={() =>
                                                            handleConnect(
                                                                source.id
                                                            )
                                                        }
                                                    >
                                                        <Icons.plus className="w-4 h-4 mr-2" />
                                                        Connect
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled
                                                        className="w-full"
                                                    >
                                                        <Icons.clock className="w-4 h-4 mr-2" />
                                                        Coming Soon
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredSources.length === 0 && (
                                <div className="text-center py-12">
                                    <Icons.search className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">
                                        No connectors found
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                                        Try adjusting your search
                                        terms or browse different
                                        categories
                                    </p>
                                    <Button variant="outline">
                                        <Icons.plus className="w-4 h-4 mr-2" />
                                        Request a Connector
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        >
                            <Icons.book className="w-6 h-6" />
                            <span className="font-semibold">
                                Documentation
                            </span>
                            <span className="text-xs text-slate-500">
                                Setup guides and tutorials
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        >
                            <Icons.messageSquare className="w-6 h-6" />
                            <span className="font-semibold">
                                Support
                            </span>
                            <span className="text-xs text-slate-500">
                                Get help from our team
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                        >
                            <Icons.code className="w-6 h-6" />
                            <span className="font-semibold">
                                Custom Connector
                            </span>
                            <span className="text-xs text-slate-500">
                                Build your own integration
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
