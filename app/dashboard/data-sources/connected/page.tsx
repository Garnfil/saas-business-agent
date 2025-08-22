"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Database, Eye, Pause } from "lucide-react"

interface ConnectedDataSource {
  id: string
  name: string
  type: string
  icon: string
  status: "active" | "error" | "syncing" | "paused"
  lastSync: string
  nextSync: string
  recordsSynced: number
  totalRecords: number
  syncFrequency: string
  connectedDate: string
  dataStreams: number
  activeStreams: number
  errorMessage?: string
  syncProgress?: number
}

const mockConnectedSources: ConnectedDataSource[] = [
  {
    id: "1",
    name: "Company Google Sheets",
    type: "Google Sheets",
    icon: "📊",
    status: "active",
    lastSync: "2 minutes ago",
    nextSync: "in 58 minutes",
    recordsSynced: 1250,
    totalRecords: 1250,
    syncFrequency: "Every hour",
    connectedDate: "Dec 1, 2025",
    dataStreams: 3,
    activeStreams: 3,
  },
  {
    id: "2",
    name: "Website Analytics",
    type: "Google Analytics 4",
    icon: "📈",
    status: "syncing",
    lastSync: "5 minutes ago",
    nextSync: "in progress",
    recordsSynced: 8750,
    totalRecords: 10000,
    syncFrequency: "Every 6 hours",
    connectedDate: "Nov 15, 2025",
    dataStreams: 5,
    activeStreams: 4,
    syncProgress: 87,
  },
  {
    id: "3",
    name: "Sales CRM",
    type: "Salesforce",
    icon: "☁️",
    status: "active",
    lastSync: "1 hour ago",
    nextSync: "in 5 hours",
    recordsSynced: 3420,
    totalRecords: 3420,
    syncFrequency: "Every 6 hours",
    connectedDate: "Oct 20, 2025",
    dataStreams: 8,
    activeStreams: 6,
  },
  {
    id: "4",
    name: "E-commerce Store",
    type: "Shopify",
    icon: "🛍️",
    status: "error",
    lastSync: "2 days ago",
    nextSync: "paused",
    recordsSynced: 0,
    totalRecords: 2500,
    syncFrequency: "Every 12 hours",
    connectedDate: "Nov 30, 2025",
    dataStreams: 4,
    activeStreams: 0,
    errorMessage: "Authentication failed. Please reconnect your account.",
  },
  {
    id: "5",
    name: "Payment Data",
    type: "Stripe",
    icon: "💳",
    status: "paused",
    lastSync: "1 week ago",
    nextSync: "paused",
    recordsSynced: 890,
    totalRecords: 890,
    syncFrequency: "Daily",
    connectedDate: "Sep 10, 2025",
    dataStreams: 3,
    activeStreams: 0,
  },
  {
    id: "6",
    name: "Customer Support",
    type: "HubSpot",
    icon: "🧡",
    status: "active",
    lastSync: "30 minutes ago",
    nextSync: "in 2.5 hours",
    recordsSynced: 1680,
    totalRecords: 1680,
    syncFrequency: "Every 3 hours",
    connectedDate: "Aug 25, 2025",
    dataStreams: 6,
    activeStreams: 5,
  },
]

export default function ConnectedDataSourcesPage() {
  const [dataSources, setDataSources] = useState<ConnectedDataSource[]>(mockConnectedSources)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedSource, setSelectedSource] = useState<ConnectedDataSource | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filteredSources = dataSources.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || source.status === statusFilter
    const matchesType = typeFilter === "all" || source.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "syncing":
        return <Badge className="bg-blue-500">Syncing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "paused":
        return <Badge variant="secondary">Paused</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Icons.check className="w-4 h-4 text-green-500" />
      case "syncing":
        return <Icons.spinner className="w-4 h-4 text-blue-500 animate-spin" />
      case "error":
        return <Icons.x className="w-4 h-4 text-red-500" />
      case "paused":
        return <Pause className="w-4 h-4 text-slate-500" />
      default:
        return <Icons.clock className="w-4 h-4 text-slate-500" />
    }
  }

  const handleSync = async (sourceId: string) => {
    setIsLoading(true)
    // Simulate sync operation
    setTimeout(() => {
      setDataSources((prev) =>
        prev.map((source) =>
          source.id === sourceId ? { ...source, status: "syncing" as const, syncProgress: 0 } : source,
        ),
      )
      setIsLoading(false)
      toast({
        title: "Sync started",
        description: "Data synchronization has been initiated.",
      })
    }, 1000)
  }

  const handlePause = async (sourceId: string) => {
    setDataSources((prev) =>
      prev.map((source) =>
        source.id === sourceId ? { ...source, status: "paused" as const, nextSync: "paused" } : source,
      ),
    )
    toast({
      title: "Sync paused",
      description: "Data synchronization has been paused.",
    })
  }

  const handleResume = async (sourceId: string) => {
    setDataSources((prev) =>
      prev.map((source) =>
        source.id === sourceId ? { ...source, status: "active" as const, nextSync: "in 1 hour" } : source,
      ),
    )
    toast({
      title: "Sync resumed",
      description: "Data synchronization has been resumed.",
    })
  }

  const handleDelete = async () => {
    if (!selectedSource) return

    setIsLoading(true)
    // Simulate delete operation
    setTimeout(() => {
      setDataSources((prev) => prev.filter((source) => source.id !== selectedSource.id))
      setIsDeleteDialogOpen(false)
      setSelectedSource(null)
      setIsLoading(false)
      toast({
        title: "Data source removed",
        description: `${selectedSource.name} has been disconnected.`,
      })
    }, 1000)
  }

  const handleConfigure = (sourceId: string, sourceType: string) => {
    const typeMap: Record<string, string> = {
      "Google Sheets": "google-sheets",
      "Google Analytics 4": "google-analytics",
      Salesforce: "salesforce",
      Shopify: "shopify",
      Stripe: "stripe",
      HubSpot: "hubspot",
    }
    router.push(`/dashboard/data-sources/configure/${typeMap[sourceType] || sourceType.toLowerCase()}`)
  }

  const totalSources = dataSources.length
  const activeSources = dataSources.filter((s) => s.status === "active").length
  const errorSources = dataSources.filter((s) => s.status === "error").length
  const totalRecords = dataSources.reduce((sum, s) => sum + s.recordsSynced, 0)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader title="Connected Data Sources" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Icons.database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSources}</div>
            <p className="text-xs text-muted-foreground">Connected integrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Icons.check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSources}</div>
            <p className="text-xs text-muted-foreground">Currently syncing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <Icons.x className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorSources}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Synced</CardTitle>
            <Icons.trendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total data points</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Manage your connected data integrations</CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/data-sources")} className="bg-green-600 hover:bg-green-700">
              <Icons.plus className="w-4 h-4 mr-2" />
              Add Data Source
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="syncing">Syncing</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Google Sheets">Google Sheets</SelectItem>
                <SelectItem value="Google Analytics 4">Google Analytics</SelectItem>
                <SelectItem value="Salesforce">Salesforce</SelectItem>
                <SelectItem value="Shopify">Shopify</SelectItem>
                <SelectItem value="Stripe">Stripe</SelectItem>
                <SelectItem value="HubSpot">HubSpot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Sources List */}
          <div className="space-y-4">
            {filteredSources.map((source) => (
              <Card key={source.id} className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{source.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{source.name}</h3>
                          {getStatusBadge(source.status)}
                          <Badge variant="outline">{source.type}</Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div>
                            <span className="text-slate-500">Last sync:</span>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(source.status)}
                              <span>{source.lastSync}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">Next sync:</span>
                            <div>{source.nextSync}</div>
                          </div>
                          <div>
                            <span className="text-slate-500">Records:</span>
                            <div>
                              {source.recordsSynced.toLocaleString()} / {source.totalRecords.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-500">Streams:</span>
                            <div>
                              {source.activeStreams} / {source.dataStreams} active
                            </div>
                          </div>
                        </div>

                        {source.status === "syncing" && source.syncProgress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Sync Progress</span>
                              <span>{source.syncProgress}%</span>
                            </div>
                            <Progress value={source.syncProgress} className="w-full" />
                          </div>
                        )}

                        {source.status === "error" && source.errorMessage && (
                          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Icons.x className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-700 dark:text-red-300">{source.errorMessage}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span>Connected: {source.connectedDate}</span>
                          <span>Frequency: {source.syncFrequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {source.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(source.id)}
                          disabled={isLoading}
                          className="bg-transparent"
                        >
                          <Icons.refreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </Button>
                      )}

                      {source.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResume(source.id)}
                          className="bg-transparent"
                        >
                          <Icons.play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}

                      {source.status === "error" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigure(source.id, source.type)}
                          className="bg-transparent"
                        >
                          <Icons.settings className="w-4 h-4 mr-2" />
                          Fix
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Icons.moreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleConfigure(source.id, source.type)}>
                            <Icons.settings className="w-4 h-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          {source.status === "active" && (
                            <DropdownMenuItem onClick={() => handlePause(source.id)}>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Sync
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleSync(source.id)}>
                            <Icons.refreshCw className="w-4 h-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedSource(source)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Icons.x className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSources.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No data sources found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search terms or filters"
                    : "Connect your first data source to get started"}
                </p>
                <Button
                  onClick={() => router.push("/dashboard/data-sources")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Icons.plus className="w-4 h-4 mr-2" />
                  Add Data Source
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Data Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect "{selectedSource?.name}"? This will stop all data synchronization and
              remove the connection.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
