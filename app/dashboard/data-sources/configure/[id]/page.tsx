"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

interface DataSourceConfig {
  id: string
  name: string
  icon: string
  description: string
  fields: ConfigField[]
  steps: ConfigStep[]
  setupGuide: {
    description: string
    prerequisites: Array<{
      title: string
      description: string
    }>
    steps: string[]
  }
}

interface ConfigField {
  id: string
  name: string
  type: "text" | "password" | "select" | "textarea" | "url"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  description?: string
}

interface ConfigStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const dataSourceConfigs: Record<string, DataSourceConfig> = {
  "google-sheets": {
    id: "google-sheets",
    name: "Google Sheets",
    icon: "📊",
    description: "Connect to Google Sheets spreadsheets for data analysis and reporting",
    steps: [
      { id: "auth", title: "Authentication", description: "Connect your Google account", completed: false },
      { id: "source", title: "Source Configuration", description: "Configure spreadsheet settings", completed: false },
      { id: "streams", title: "Select Streams", description: "Choose data to sync", completed: false },
      { id: "test", title: "Test Connection", description: "Verify the connection works", completed: false },
    ],
    fields: [
      {
        id: "source_name",
        name: "source_name",
        type: "text",
        label: "Source Name",
        placeholder: "My Google Sheets Source",
        required: true,
        description: "A descriptive name for this data source",
      },
      {
        id: "spreadsheet_url",
        name: "spreadsheet_url",
        type: "url",
        label: "Spreadsheet URL",
        placeholder: "https://docs.google.com/spreadsheets/d/...",
        required: true,
        description: "The full URL of your Google Sheets spreadsheet",
      },
      {
        id: "auth_method",
        name: "auth_method",
        type: "select",
        label: "Authentication Method",
        required: true,
        options: ["OAuth2", "Service Account"],
        description: "Choose how to authenticate with Google Sheets",
      },
    ],
    setupGuide: {
      description:
        "The Google Sheets source connector pulls data from a single Google Sheets spreadsheet. Each sheet within a spreadsheet can be synced. To sync multiple spreadsheets, use our Google Drive connector or set up multiple Google Sheets source connectors in your instance.",
      prerequisites: [
        {
          title: "Spreadsheet Link",
          description: "The link to the Google spreadsheet you want to sync.",
        },
        {
          title: "For AI Assistant Cloud",
          description: "A Google Workspace user with access to the spreadsheet",
        },
      ],
      steps: [
        "Open your Google Sheets spreadsheet",
        "Copy the spreadsheet URL from your browser",
        "Ensure the spreadsheet is shared with appropriate permissions",
        "Use OAuth2 authentication for secure access",
      ],
    },
  },
  "google-analytics": {
    id: "google-analytics",
    name: "Google Analytics 4",
    icon: "📈",
    description: "Pull website traffic data and user behavior analytics",
    steps: [
      { id: "auth", title: "Authentication", description: "Connect your Google account", completed: false },
      { id: "property", title: "Property Selection", description: "Select GA4 property", completed: false },
      { id: "metrics", title: "Metrics & Dimensions", description: "Choose data to collect", completed: false },
      { id: "test", title: "Test Connection", description: "Verify the connection works", completed: false },
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
        options: ["Last 30 days", "Last 90 days", "Last 365 days", "Custom"],
      },
    ],
    setupGuide: {
      description:
        "The Google Analytics 4 source connector pulls website traffic data and user behavior analytics from your GA4 property. Connect multiple properties by setting up separate source connectors.",
      prerequisites: [
        {
          title: "GA4 Property ID",
          description: "Your Google Analytics 4 property ID (found in GA4 Admin settings)",
        },
        {
          title: "Google Account Access",
          description: "A Google account with read access to the GA4 property",
        },
      ],
      steps: [
        "Log into your Google Analytics account",
        "Navigate to Admin > Property Settings",
        "Copy your Property ID",
        "Ensure you have read permissions for the property",
      ],
    },
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    icon: "☁️",
    description: "Connect to Salesforce CRM for customer and sales data",
    steps: [
      { id: "auth", title: "Authentication", description: "Connect to Salesforce", completed: false },
      { id: "objects", title: "Object Selection", description: "Choose Salesforce objects", completed: false },
      { id: "fields", title: "Field Mapping", description: "Map fields to sync", completed: false },
      { id: "test", title: "Test Connection", description: "Verify the connection works", completed: false },
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
    setupGuide: {
      description:
        "The Salesforce source connector pulls customer and sales data from your Salesforce CRM. Connect to standard and custom objects with field-level control over what data to sync.",
      prerequisites: [
        {
          title: "Salesforce Instance URL",
          description: "Your organization's Salesforce instance URL",
        },
        {
          title: "User Credentials",
          description: "Username, password, and security token for a Salesforce user with API access",
        },
      ],
      steps: [
        "Log into your Salesforce org",
        "Go to Setup > Users > Reset Security Token",
        "Check your email for the security token",
        "Ensure your user has API access permissions",
      ],
    },
  },
}

export default function DataSourceConfigurePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [showSetupGuide, setShowSetupGuide] = useState(true)

  const sourceId = params.id as string
  const config = dataSourceConfigs[sourceId]

  useEffect(() => {
    if (!config) {
      router.push("/dashboard/data-sources")
    }
  }, [config, router])

  if (!config) {
    return <div>Loading...</div>
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleNextStep = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTestConnection = async () => {
    setConnectionStatus("testing")
    setIsLoading(true)

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      setConnectionStatus(success ? "success" : "error")
      setIsLoading(false)

      toast({
        title: success ? "Connection successful!" : "Connection failed",
        description: success
          ? "Your data source has been configured successfully."
          : "Please check your configuration and try again.",
        variant: success ? "default" : "destructive",
      })
    }, 3000)
  }

  const handleSaveConnection = async () => {
    setIsConnecting(true)

    // Simulate saving connection
    setTimeout(() => {
      setIsConnecting(false)
      toast({
        title: "Data source connected!",
        description: `${config.name} has been successfully connected to your account.`,
      })
      router.push("/dashboard/data-sources")
    }, 2000)
  }

  const progress = ((currentStep + 1) / config.steps.length) * 100

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title={`Configure ${config.name}`} />

      <div className="grid gap-4" style={{ gridTemplateColumns: showSetupGuide ? "1fr 400px" : "1fr" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{config.steps[currentStep].title}</CardTitle>
                <CardDescription>{config.steps[currentStep].description}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="bg-transparent"
              >
                {showSetupGuide ? (
                  <>
                    <Icons.x className="w-4 h-4 mr-2" />
                    Hide Guide
                  </>
                ) : (
                  <>
                    <Icons.book className="w-4 h-4 mr-2" />
                    Show Guide
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Existing TabsContent sections remain the same */}
            <Tabs value={config.steps[currentStep].id} className="w-full">
              <TabsContent value="auth" className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Connect securely to {config.name} using OAuth 2.0 authentication
                  </p>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Icons.externalLink className="w-4 h-4 mr-2" />
                    Authenticate with {config.name}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="source" className="space-y-4">
                <div className="grid gap-4">
                  {config.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === "select" ? (
                        <Select onValueChange={(value) => handleInputChange(field.id, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          id={field.id}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          required={field.required}
                        />
                      )}
                      {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="streams" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Select the data streams you want to sync from {config.name}
                  </p>
                  <div className="grid gap-3">
                    {["Users", "Sessions", "Page Views", "Events", "Conversions"].map((stream) => (
                      <div key={stream} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <div>
                            <p className="font-medium">{stream}</p>
                            <p className="text-xs text-slate-500">Sync {stream.toLowerCase()} data</p>
                          </div>
                        </div>
                        <Badge variant="outline">Recommended</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="test" className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {connectionStatus === "testing" ? (
                      <Icons.spinner className="w-8 h-8 text-white animate-spin" />
                    ) : connectionStatus === "success" ? (
                      <Icons.check className="w-8 h-8 text-white" />
                    ) : connectionStatus === "error" ? (
                      <Icons.x className="w-8 h-8 text-white" />
                    ) : (
                      <Icons.play className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {connectionStatus === "testing"
                      ? "Testing Connection..."
                      : connectionStatus === "success"
                        ? "Connection Successful!"
                        : connectionStatus === "error"
                          ? "Connection Failed"
                          : "Test Your Connection"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {connectionStatus === "testing"
                      ? "We're verifying your connection settings..."
                      : connectionStatus === "success"
                        ? "Your data source is configured correctly and ready to use."
                        : connectionStatus === "error"
                          ? "There was an issue connecting to your data source. Please check your settings."
                          : "Verify that your configuration is working correctly."}
                  </p>
                  {connectionStatus === "idle" && (
                    <Button size="lg" onClick={handleTestConnection} disabled={isLoading}>
                      <Icons.play className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                  )}
                  {connectionStatus === "success" && (
                    <Button size="lg" onClick={handleSaveConnection} disabled={isConnecting}>
                      {isConnecting && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                      Save & Connect
                    </Button>
                  )}
                  {connectionStatus === "error" && (
                    <div className="space-y-3">
                      <Button size="lg" onClick={handleTestConnection} disabled={isLoading}>
                        <Icons.refreshCw className="w-4 h-4 mr-2" />
                        Retry Test
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
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
                disabled={currentStep === config.steps.length - 1}
                className="bg-green-600 hover:bg-green-700"
              >
                Next
                <Icons.arrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {showSetupGuide && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Setup Guide</CardTitle>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Icons.externalLink className="w-4 h-4 mr-2" />
                  Open full docs
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{config.name}</h2>

              </div>

              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icons.lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-100">{config.setupGuide.description}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Prerequisites</h3>
                <ul className="space-y-3">
                  {config.setupGuide.prerequisites.map((prereq, index) => (
                    <li key={index}>
                      <div className="font-medium text-sm">{prereq.title}</div>
                      <div className="text-sm text-slate-400 ml-4">{prereq.description}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Setup guide</h3>
                <ol className="space-y-2">
                  {config.setupGuide.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-slate-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
