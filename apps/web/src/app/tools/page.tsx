"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Mail,
  Calendar,
  Database,
  Users,
  FileText,
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Tool {
  id: string
  name: string
  type: string
  description: string
  icon: React.ReactNode
  status: "active" | "inactive" | "error"
  lastUsed?: Date
  usageCount: number
  configuration: Record<string, any>
  requiredFields: Array<{
    key: string
    label: string
    type: "text" | "password" | "url" | "select"
    required: boolean
    options?: string[]
    placeholder?: string
  }>
}

const AVAILABLE_TOOLS: Tool[] = [
  {
    id: "web-search",
    name: "Web Search",
    type: "search",
    description: "Search the internet for real-time information using Google or Bing APIs",
    icon: <Search className="h-5 w-5" />,
    status: "active",
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    usageCount: 1247,
    configuration: { provider: "google", apiKey: "sk-***" },
    requiredFields: [
      { key: "provider", label: "Search Provider", type: "select", required: true, options: ["google", "bing"] },
      { key: "apiKey", label: "API Key", type: "password", required: true, placeholder: "Enter your API key" },
      { key: "maxResults", label: "Max Results", type: "text", required: false, placeholder: "10" },
    ],
  },
  {
    id: "knowledge-base",
    name: "Knowledge Base",
    type: "storage",
    description: "Search through uploaded documents and knowledge base content",
    icon: <FileText className="h-5 w-5" />,
    status: "active",
    lastUsed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    usageCount: 892,
    configuration: { vectorStore: "pinecone", indexName: "kb-index" },
    requiredFields: [
      {
        key: "vectorStore",
        label: "Vector Store",
        type: "select",
        required: true,
        options: ["pinecone", "weaviate", "chroma"],
      },
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "indexName", label: "Index Name", type: "text", required: true, placeholder: "knowledge-base" },
    ],
  },
  {
    id: "email",
    name: "Email Integration",
    type: "communication",
    description: "Send and receive emails through SMTP/IMAP integration",
    icon: <Mail className="h-5 w-5" />,
    status: "inactive",
    usageCount: 0,
    configuration: {},
    requiredFields: [
      { key: "smtpHost", label: "SMTP Host", type: "text", required: true, placeholder: "smtp.gmail.com" },
      { key: "smtpPort", label: "SMTP Port", type: "text", required: true, placeholder: "587" },
      { key: "username", label: "Email Address", type: "text", required: true, placeholder: "your-email@domain.com" },
      { key: "password", label: "Password/App Password", type: "password", required: true },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    type: "productivity",
    description: "Schedule meetings and manage calendar events via Google Calendar or Outlook",
    icon: <Calendar className="h-5 w-5" />,
    status: "error",
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    usageCount: 156,
    configuration: { provider: "google", clientId: "invalid" },
    requiredFields: [
      { key: "provider", label: "Calendar Provider", type: "select", required: true, options: ["google", "outlook"] },
      { key: "clientId", label: "Client ID", type: "text", required: true },
      { key: "clientSecret", label: "Client Secret", type: "password", required: true },
      {
        key: "redirectUri",
        label: "Redirect URI",
        type: "url",
        required: true,
        placeholder: "https://your-domain.com/callback",
      },
    ],
  },
  {
    id: "crm",
    name: "CRM Integration",
    type: "business",
    description: "Access customer data from Salesforce, HubSpot, or other CRM systems",
    icon: <Users className="h-5 w-5" />,
    status: "inactive",
    usageCount: 0,
    configuration: {},
    requiredFields: [
      {
        key: "provider",
        label: "CRM Provider",
        type: "select",
        required: true,
        options: ["salesforce", "hubspot", "pipedrive"],
      },
      { key: "apiKey", label: "API Key", type: "password", required: true },
      {
        key: "domain",
        label: "Domain/Instance",
        type: "text",
        required: true,
        placeholder: "your-company.salesforce.com",
      },
    ],
  },
  {
    id: "database",
    name: "Database Query",
    type: "data",
    description: "Execute queries on your databases (PostgreSQL, MySQL, MongoDB)",
    icon: <Database className="h-5 w-5" />,
    status: "inactive",
    usageCount: 0,
    configuration: {},
    requiredFields: [
      {
        key: "type",
        label: "Database Type",
        type: "select",
        required: true,
        options: ["postgresql", "mysql", "mongodb"],
      },
      { key: "host", label: "Host", type: "text", required: true, placeholder: "localhost" },
      { key: "port", label: "Port", type: "text", required: true, placeholder: "5432" },
      { key: "database", label: "Database Name", type: "text", required: true },
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
    ],
  },
]

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>(AVAILABLE_TOOLS)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [testingConnection, setTestingConnection] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    setTools(tools.map((tool) => (tool.id === toolId ? { ...tool, status: enabled ? "active" : "inactive" } : tool)))
  }

  const handleConfigurationSave = (toolId: string, config: Record<string, any>) => {
    setTools(tools.map((tool) => (tool.id === toolId ? { ...tool, configuration: config, status: "active" } : tool)))
    setIsConfiguring(false)
    setSelectedTool(null)
  }

  const handleTestConnection = async (tool: Tool) => {
    setTestingConnection(true)
    // Simulate API call to test connection
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock success/failure
    const success = Math.random() > 0.3
    setTools(tools.map((t) => (t.id === tool.id ? { ...t, status: success ? "active" : "error" } : t)))
    setTestingConnection(false)
  }

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-heading font-black text-foreground">Tool Management</h1>
              <span className="text-sm text-muted-foreground">Configure integrations and tools</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                Back to Dashboard
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Tool
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configure">Configure Tools</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tools.filter((t) => t.status === "active").length}</div>
                  <p className="text-xs text-muted-foreground">of {tools.length} total tools</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tools.reduce((sum, tool) => sum + tool.usageCount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">API calls this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tools.filter((t) => t.status === "error").length}</div>
                  <p className="text-xs text-muted-foreground">tools need attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">{tool.icon}</div>
                        <div>
                          <CardTitle className="font-heading font-bold text-base">{tool.name}</CardTitle>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(tool.status)}`}>
                            {getStatusIcon(tool.status)}
                            <span className="ml-1 capitalize">{tool.status}</span>
                          </Badge>
                        </div>
                      </div>
                      <Switch
                        checked={tool.status === "active"}
                        onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{tool.description}</CardDescription>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {tool.lastUsed && <p>Last used: {tool.lastUsed.toLocaleDateString()}</p>}
                      <p>Usage: {tool.usageCount.toLocaleString()} calls</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTool(tool)} className="flex-1">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-heading font-bold">Configure {tool.name}</DialogTitle>
                            <DialogDescription>{tool.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {tool.requiredFields.map((field) => (
                              <div key={field.key}>
                                <Label htmlFor={field.key}>
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                {field.type === "select" ? (
                                  <Select defaultValue={tool.configuration[field.key]}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder={`Select ${field.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="relative">
                                    <Input
                                      id={field.key}
                                      type={
                                        field.type === "password" && !showPasswords[field.key] ? "password" : "text"
                                      }
                                      placeholder={field.placeholder}
                                      defaultValue={
                                        field.type === "password" && tool.configuration[field.key]
                                          ? "••••••••"
                                          : tool.configuration[field.key]
                                      }
                                      className="mt-1"
                                    />
                                    {field.type === "password" && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-1 h-8 w-8 p-0"
                                        onClick={() => togglePasswordVisibility(field.key)}
                                      >
                                        {showPasswords[field.key] ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => handleTestConnection(tool)}
                              disabled={testingConnection}
                            >
                              {testingConnection ? "Testing..." : "Test Connection"}
                            </Button>
                            <div className="space-x-2">
                              <Button variant="outline">Cancel</Button>
                              <Button onClick={() => handleConfigurationSave(tool.id, {})}>Save Configuration</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(tool)}
                        disabled={testingConnection || tool.status === "inactive"}
                      >
                        {testingConnection ? "Testing..." : "Test"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configure Tools Tab */}
          <TabsContent value="configure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading font-bold">Tool Configuration</CardTitle>
                <CardDescription>
                  Set up and configure your tools and integrations. Each tool requires specific credentials and
                  settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tools.map((tool) => (
                    <div key={tool.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">{tool.icon}</div>
                          <div>
                            <h3 className="font-heading font-bold">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(tool.status)}>
                          {getStatusIcon(tool.status)}
                          <span className="ml-1 capitalize">{tool.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.requiredFields.slice(0, 2).map((field) => (
                          <div key={field.key}>
                            <Label htmlFor={`${tool.id}-${field.key}`}>
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.type === "select" ? (
                              <Select defaultValue={tool.configuration[field.key]}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder={`Select ${field.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={`${tool.id}-${field.key}`}
                                type={field.type === "password" ? "password" : "text"}
                                placeholder={field.placeholder}
                                defaultValue={
                                  field.type === "password" && tool.configuration[field.key]
                                    ? "••••••••"
                                    : tool.configuration[field.key]
                                }
                                className="mt-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          Reset
                        </Button>
                        <Button size="sm">Save Changes</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Analytics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading font-bold">Usage by Tool</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tools
                      .sort((a, b) => b.usageCount - a.usageCount)
                      .map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-primary/10 rounded text-primary">{tool.icon}</div>
                            <span className="font-medium">{tool.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{tool.usageCount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">calls</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading font-bold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tools
                      .filter((tool) => tool.lastUsed)
                      .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                      .map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-primary/10 rounded text-primary">{tool.icon}</div>
                            <span className="font-medium">{tool.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{tool.lastUsed?.toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{tool.lastUsed?.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
