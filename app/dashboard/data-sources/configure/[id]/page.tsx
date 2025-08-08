"use client";

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {Progress} from "@/components/ui/progress";
import {DashboardHeader} from "@/components/dashboard-header";
import {Icons} from "@/components/icons";
import {useToast} from "@/hooks/use-toast";

interface DataSourceConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    fields: ConfigField[];
    steps: ConfigStep[];
}

interface ConfigField {
    id: string;
    name: string;
    type: "text" | "password" | "select" | "textarea" | "url";
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    description?: string;
}

interface ConfigStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

const dataSourceConfigs: Record<string, DataSourceConfig> = {
    "google-sheets": {
        id: "google-sheets",
        name: "Google Sheets",
        icon: "📊",
        description:
            "Connect to Google Sheets spreadsheets for data analysis and reporting",
        steps: [
            {
                id: "auth",
                title: "Authentication",
                description: "Connect your Google account",
                completed: false,
            },
            {
                id: "source",
                title: "Source Configuration",
                description: "Configure spreadsheet settings",
                completed: false,
            },
            {
                id: "streams",
                title: "Select Streams",
                description: "Choose data to sync",
                completed: false,
            },
            {
                id: "test",
                title: "Test Connection",
                description: "Verify the connection works",
                completed: false,
            },
        ],
        fields: [
            {
                id: "source_name",
                name: "source_name",
                type: "text",
                label: "Source Name",
                placeholder: "My Google Sheets Source",
                required: true,
                description:
                    "A descriptive name for this data source",
            },
            {
                id: "spreadsheet_url",
                name: "spreadsheet_url",
                type: "url",
                label: "Spreadsheet URL",
                placeholder:
                    "https://docs.google.com/spreadsheets/d/...",
                required: true,
                description:
                    "The full URL of your Google Sheets spreadsheet",
            },
            {
                id: "auth_method",
                name: "auth_method",
                type: "select",
                label: "Authentication Method",
                required: true,
                options: ["OAuth2", "Service Account"],
                description:
                    "Choose how to authenticate with Google Sheets",
            },
        ],
    },
    "google-analytics": {
        id: "google-analytics",
        name: "Google Analytics 4",
        icon: "📈",
        description:
            "Pull website traffic data and user behavior analytics",
        steps: [
            {
                id: "auth",
                title: "Authentication",
                description: "Connect your Google account",
                completed: false,
            },
            {
                id: "property",
                title: "Property Selection",
                description: "Select GA4 property",
                completed: false,
            },
            {
                id: "metrics",
                title: "Metrics & Dimensions",
                description: "Choose data to collect",
                completed: false,
            },
            {
                id: "test",
                title: "Test Connection",
                description: "Verify the connection works",
                completed: false,
            },
        ],
        fields: [
            {
                id: "source_name",
                name: "source_name",
                type: "text",
                label: "Source Name",
                placeholder: "My GA4 Source",
                required: true,
            },
            {
                id: "property_id",
                name: "property_id",
                type: "text",
                label: "GA4 Property ID",
                placeholder: "123456789",
                required: true,
                description: "Your Google Analytics 4 property ID",
            },
            {
                id: "date_range",
                name: "date_range",
                type: "select",
                label: "Date Range",
                required: true,
                options: [
                    "Last 30 days",
                    "Last 90 days",
                    "Last 365 days",
                    "Custom",
                ],
            },
        ],
    },
    salesforce: {
        id: "salesforce",
        name: "Salesforce",
        icon: "☁️",
        description:
            "Connect to Salesforce CRM for customer and sales data",
        steps: [
            {
                id: "auth",
                title: "Authentication",
                description: "Connect to Salesforce",
                completed: false,
            },
            {
                id: "objects",
                title: "Object Selection",
                description: "Choose Salesforce objects",
                completed: false,
            },
            {
                id: "fields",
                title: "Field Mapping",
                description: "Map fields to sync",
                completed: false,
            },
            {
                id: "test",
                title: "Test Connection",
                description: "Verify the connection works",
                completed: false,
            },
        ],
        fields: [
            {
                id: "source_name",
                name: "source_name",
                type: "text",
                label: "Source Name",
                placeholder: "My Salesforce Source",
                required: true,
            },
            {
                id: "instance_url",
                name: "instance_url",
                type: "url",
                label: "Salesforce Instance URL",
                placeholder: "https://mycompany.salesforce.com",
                required: true,
            },
            {
                id: "username",
                name: "username",
                type: "text",
                label: "Username",
                placeholder: "user@company.com",
                required: true,
            },
            {
                id: "password",
                name: "password",
                type: "password",
                label: "Password",
                required: true,
            },
            {
                id: "security_token",
                name: "security_token",
                type: "password",
                label: "Security Token",
                required: true,
                description: "Your Salesforce security token",
            },
        ],
    },
};

export default function DataSourceConfigurePage() {
    const params = useParams();
    const router = useRouter();
    const {toast} = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>(
        {}
    );
    const [connectionStatus, setConnectionStatus] = useState<
        "idle" | "testing" | "success" | "error"
    >("idle");

    const sourceId = params.id as string;
    const config = dataSourceConfigs[sourceId];

    useEffect(() => {
        if (!config) {
            router.push("/dashboard/data-sources");
        }
    }, [config, router]);

    if (!config) {
        return <div>Loading...</div>;
    }

    const handleInputChange = (fieldId: string, value: string) => {
        setFormData((prev) => ({...prev, [fieldId]: value}));
    };

    const handleNextStep = () => {
        if (currentStep < config.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleTestConnection = async () => {
        setConnectionStatus("testing");
        setIsLoading(true);

        // Simulate connection test
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% success rate
            setConnectionStatus(success ? "success" : "error");
            setIsLoading(false);

            toast({
                title: success
                    ? "Connection successful!"
                    : "Connection failed",
                description: success
                    ? "Your data source has been configured successfully."
                    : "Please check your configuration and try again.",
                variant: success ? "default" : "destructive",
            });
        }, 3000);
    };

    const handleSaveConnection = async () => {
        setIsConnecting(true);

        // Simulate saving connection
        setTimeout(() => {
            setIsConnecting(false);
            toast({
                title: "Data source connected!",
                description: `${config.name} has been successfully connected to your account.`,
            });
            router.push("/dashboard/data-sources");
        }, 2000);
    };

    const progress = ((currentStep + 1) / config.steps.length) * 100;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardHeader title={`Configure ${config.name}`} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">
                                {config.icon}
                            </span>
                            Setup Guide
                        </CardTitle>
                        <CardDescription>
                            Follow these steps to connect your data
                            source
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <Progress
                                    value={progress}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-3">
                                {config.steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                            index === currentStep
                                                ? "bg-slate-100 dark:bg-slate-900/20 border border-green-200 dark:border-green-800"
                                                : index < currentStep
                                                ? "bg-slate-100 dark:bg-slate-800"
                                                : "bg-slate-50 dark:bg-slate-900"
                                        }`}
                                        onClick={() =>
                                            setCurrentStep(index)
                                        }
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                                index < currentStep
                                                    ? "bg-slate-500 text-white"
                                                    : index ===
                                                      currentStep
                                                    ? "bg-slate-500 text-white"
                                                    : "bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                                            }`}
                                        >
                                            {index < currentStep ? (
                                                <Icons.check className="w-3 h-3" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {step.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>
                            {config.steps[currentStep].title}
                        </CardTitle>
                        <CardDescription>
                            {config.steps[currentStep].description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={config.steps[currentStep].id}
                            className="w-full"
                        >
                            <TabsContent
                                value="auth"
                                className="space-y-4"
                            >
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icons.shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        Secure Authentication
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                                        Connect securely to{" "}
                                        {config.name} using OAuth 2.0
                                        authentication
                                    </p>
                                    <Button
                                        size="lg"
                                        className="bg-violet-900 text-white hover:bg-violet-700"
                                    >
                                        <Icons.externalLink className="w-4 h-4 mr-2" />
                                        Authenticate with{" "}
                                        {config.name}
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="source"
                                className="space-y-4"
                            >
                                <div className="grid gap-4">
                                    {config.fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="space-y-2"
                                        >
                                            <Label htmlFor={field.id}>
                                                {field.label}
                                                {field.required && (
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                )}
                                            </Label>
                                            {field.type ===
                                            "select" ? (
                                                <Select
                                                    onValueChange={(
                                                        value
                                                    ) =>
                                                        handleInputChange(
                                                            field.id,
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={`Select ${field.label.toLowerCase()}`}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options?.map(
                                                            (
                                                                option
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        option
                                                                    }
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {
                                                                        option
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            ) : field.type ===
                                              "textarea" ? (
                                                <Textarea
                                                    id={field.id}
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                    value={
                                                        formData[
                                                            field.id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            field.id,
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    rows={3}
                                                />
                                            ) : (
                                                <Input
                                                    id={field.id}
                                                    type={field.type}
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                    value={
                                                        formData[
                                                            field.id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            field.id,
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    required={
                                                        field.required
                                                    }
                                                />
                                            )}
                                            {field.description && (
                                                <p className="text-xs text-slate-500">
                                                    {
                                                        field.description
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="streams"
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Select the data streams you
                                        want to sync from{" "}
                                        {config.name}
                                    </p>
                                    <div className="grid gap-3">
                                        {[
                                            "Users",
                                            "Sessions",
                                            "Page Views",
                                            "Events",
                                            "Conversions",
                                        ].map((stream) => (
                                            <div
                                                key={stream}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked
                                                        className="rounded"
                                                    />
                                                    <div>
                                                        <p className="font-medium">
                                                            {stream}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Sync{" "}
                                                            {stream.toLowerCase()}{" "}
                                                            data
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">
                                                    Recommended
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="test"
                                className="space-y-4"
                            >
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {connectionStatus ===
                                        "testing" ? (
                                            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
                                        ) : connectionStatus ===
                                          "success" ? (
                                            <Icons.check className="w-8 h-8 text-white" />
                                        ) : connectionStatus ===
                                          "error" ? (
                                            <Icons.x className="w-8 h-8 text-white" />
                                        ) : (
                                            <Icons.play className="w-8 h-8 text-white" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {connectionStatus ===
                                        "testing"
                                            ? "Testing Connection..."
                                            : connectionStatus ===
                                              "success"
                                            ? "Connection Successful!"
                                            : connectionStatus ===
                                              "error"
                                            ? "Connection Failed"
                                            : "Test Your Connection"}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                                        {connectionStatus ===
                                        "testing"
                                            ? "We're verifying your connection settings..."
                                            : connectionStatus ===
                                              "success"
                                            ? "Your data source is configured correctly and ready to use."
                                            : connectionStatus ===
                                              "error"
                                            ? "There was an issue connecting to your data source. Please check your settings."
                                            : "Verify that your configuration is working correctly."}
                                    </p>
                                    {connectionStatus === "idle" && (
                                        <Button
                                            size="lg"
                                            onClick={
                                                handleTestConnection
                                            }
                                            disabled={isLoading}
                                        >
                                            <Icons.play className="w-4 h-4 mr-2" />
                                            Test Connection
                                        </Button>
                                    )}
                                    {connectionStatus ===
                                        "success" && (
                                        <Button
                                            size="lg"
                                            onClick={
                                                handleSaveConnection
                                            }
                                            disabled={isConnecting}
                                        >
                                            {isConnecting && (
                                                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                                            )}
                                            Save & Connect
                                        </Button>
                                    )}
                                    {connectionStatus === "error" && (
                                        <div className="space-y-3">
                                            <Button
                                                size="lg"
                                                onClick={
                                                    handleTestConnection
                                                }
                                                disabled={isLoading}
                                            >
                                                <Icons.refreshCw className="w-4 h-4 mr-2" />
                                                Retry Test
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setCurrentStep(1)
                                                }
                                            >
                                                <Icons.arrowLeft className="w-4 h-4 mr-2" />
                                                Back to Configuration
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                                disabled={currentStep === 0}
                                className="bg-transparent"
                            >
                                <Icons.arrowLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>
                            <Button
                                onClick={handleNextStep}
                                disabled={
                                    currentStep ===
                                    config.steps.length - 1
                                }
                                className="bg-violet-900 text-white hover:bg-slate-700"
                            >
                                Next
                                <Icons.arrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
