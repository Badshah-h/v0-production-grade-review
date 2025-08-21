"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Copy, Eye, Code, Smartphone, Monitor, Palette, Settings, ArrowLeft, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"

interface WidgetConfig {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  theme: "light" | "dark" | "auto"
  primaryColor: string
  size: "small" | "medium" | "large"
  showBranding: boolean
  welcomeMessage: string
  placeholder: string
  buttonText: string
  autoOpen: boolean
  openDelay: number
}

interface Agent {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
}

export default function DeployPage({ params }: { params: { agentId: string } }) {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent>({
    id: params.agentId,
    name: "Customer Support Bot",
    description: "Handles customer inquiries and support tickets",
    status: "active",
  })

  const [config, setConfig] = useState<WidgetConfig>({
    position: "bottom-right",
    theme: "light",
    primaryColor: "#0891b2",
    size: "medium",
    showBranding: true,
    welcomeMessage: `Hi! I'm ${agent.name}. How can I help you today?`,
    placeholder: "Type your message...",
    buttonText: "Chat with us",
    autoOpen: false,
    openDelay: 3000,
  })

  const [activeTab, setActiveTab] = useState("customize")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const generateEmbedCode = (type: "script" | "iframe" | "react") => {
    const baseUrl = "https://axonstream.ai"
    const widgetUrl = `${baseUrl}/widget/${agent.id}`

    switch (type) {
      case "script":
        return `<!-- AxonStreamAI Widget -->
<script src="${baseUrl}/widget.js"></script>
<script>
  AxonWidget.init({
    agentId: "${agent.id}",
    position: "${config.position}",
    theme: "${config.theme}",
    primaryColor: "${config.primaryColor}",
    size: "${config.size}",
    welcomeMessage: "${config.welcomeMessage}",
    placeholder: "${config.placeholder}",
    autoOpen: ${config.autoOpen},
    openDelay: ${config.openDelay}
  });
</script>`

      case "iframe":
        return `<!-- AxonStreamAI Widget (iframe) -->
<iframe 
  src="${widgetUrl}?theme=${config.theme}&color=${encodeURIComponent(config.primaryColor)}"
  width="400" 
  height="600"
  frameborder="0"
  style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>`

      case "react":
        return `import { ChatWidget } from '@axonstream/react-widget'

function App() {
  return (
    <div>
      {/* Your app content */}
      
      <ChatWidget
        agentId="${agent.id}"
        position="${config.position}"
        theme="${config.theme}"
        primaryColor="${config.primaryColor}"
        size="${config.size}"
        welcomeMessage="${config.welcomeMessage}"
        placeholder="${config.placeholder}"
        autoOpen={${config.autoOpen}}
        openDelay={${config.openDelay}}
      />
    </div>
  )
}`

      default:
        return ""
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const platformInstructions = {
    wordpress: {
      title: "WordPress",
      steps: [
        "Go to your WordPress admin dashboard",
        "Navigate to Appearance > Theme Editor or use a page builder",
        "Paste the script code before the closing </body> tag",
        "Save your changes and refresh your website",
      ],
    },
    shopify: {
      title: "Shopify",
      steps: [
        "Go to your Shopify admin panel",
        "Navigate to Online Store > Themes",
        "Click 'Actions' > 'Edit code' on your active theme",
        "Open the theme.liquid file",
        "Paste the script code before the closing </body> tag",
        "Save the file",
      ],
    },
    squarespace: {
      title: "Squarespace",
      steps: [
        "Go to your Squarespace dashboard",
        "Navigate to Settings > Advanced > Code Injection",
        "Paste the script code in the 'Footer' section",
        "Save your changes",
      ],
    },
    wix: {
      title: "Wix",
      steps: [
        "Go to your Wix dashboard",
        "Navigate to Settings > Custom Code",
        "Click 'Add Custom Code'",
        "Paste the script code and set it to load on 'All Pages'",
        "Choose 'Body - end' as the placement",
        "Save and publish your site",
      ],
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-black text-foreground">Deploy Widget</h1>
                <p className="text-sm text-muted-foreground">
                  Deploy <strong>{agent.name}</strong> to your website
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {agent.status === "active" ? "Ready to Deploy" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Test Agent
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="embed">Embed Code</TabsTrigger>
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
              </TabsList>

              {/* Customize Tab */}
              <TabsContent value="customize" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading font-bold flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Appearance
                    </CardTitle>
                    <CardDescription>Customize the look and feel of your widget</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Select
                          value={config.position}
                          onValueChange={(value: any) => updateConfig({ position: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="size">Size</Label>
                        <Select value={config.size} onValueChange={(value: any) => updateConfig({ size: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={config.theme} onValueChange={(value: any) => updateConfig({ theme: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading font-bold flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Behavior
                    </CardTitle>
                    <CardDescription>Configure how your widget behaves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={config.welcomeMessage}
                        onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="placeholder">Input Placeholder</Label>
                      <Input
                        id="placeholder"
                        value={config.placeholder}
                        onChange={(e) => updateConfig({ placeholder: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-open widget</Label>
                        <p className="text-sm text-muted-foreground">Automatically open the chat after page load</p>
                      </div>
                      <Switch
                        checked={config.autoOpen}
                        onCheckedChange={(checked) => updateConfig({ autoOpen: checked })}
                      />
                    </div>

                    {config.autoOpen && (
                      <div>
                        <Label htmlFor="openDelay">Auto-open delay (seconds)</Label>
                        <Input
                          id="openDelay"
                          type="number"
                          value={config.openDelay / 1000}
                          onChange={(e) => updateConfig({ openDelay: Number.parseInt(e.target.value) * 1000 })}
                          className="mt-1"
                          min="1"
                          max="30"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show AxonStreamAI branding</Label>
                        <p className="text-sm text-muted-foreground">Display "Powered by AxonStreamAI" in widget</p>
                      </div>
                      <Switch
                        checked={config.showBranding}
                        onCheckedChange={(checked) => updateConfig({ showBranding: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Embed Code Tab */}
              <TabsContent value="embed" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading font-bold flex items-center">
                      <Code className="h-5 w-5 mr-2" />
                      JavaScript Widget (Recommended)
                    </CardTitle>
                    <CardDescription>Copy and paste this code before the closing &lt;/body&gt; tag</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        value={generateEmbedCode("script")}
                        readOnly
                        className="font-mono text-sm min-h-[200px] resize-none"
                      />
                      <Button
                        onClick={() => copyToClipboard(generateEmbedCode("script"))}
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading font-bold">iframe Embed</CardTitle>
                    <CardDescription>Alternative embed method using iframe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Textarea
                        value={generateEmbedCode("iframe")}
                        readOnly
                        className="font-mono text-sm min-h-[120px] resize-none"
                      />
                      <Button
                        onClick={() => copyToClipboard(generateEmbedCode("iframe"))}
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading font-bold">React Component</CardTitle>
                    <CardDescription>For React applications using our NPM package</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <code className="text-sm">npm install @axonstream/react-widget</code>
                      </div>
                      <div className="relative">
                        <Textarea
                          value={generateEmbedCode("react")}
                          readOnly
                          className="font-mono text-sm min-h-[200px] resize-none"
                        />
                        <Button
                          onClick={() => copyToClipboard(generateEmbedCode("react"))}
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="space-y-6">
                {Object.entries(platformInstructions).map(([key, platform]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="font-heading font-bold flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2" />
                        {platform.title}
                      </CardTitle>
                      <CardDescription>Step-by-step instructions for {platform.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {platform.steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                      <Separator className="my-4" />
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">Code to paste:</p>
                        <code className="text-xs break-all">{generateEmbedCode("script").split("\n")[0]}...</code>
                        <Button
                          onClick={() => copyToClipboard(generateEmbedCode("script"))}
                          size="sm"
                          variant="outline"
                          className="ml-2"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading font-bold flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Live Preview
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>See how your widget will look on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`relative border border-border rounded-lg overflow-hidden ${
                    previewDevice === "mobile" ? "w-80 h-96 mx-auto" : "w-full h-96"
                  }`}
                  style={{ backgroundColor: config.theme === "dark" ? "#1a1a1a" : "#ffffff" }}
                >
                  {/* Mock website content */}
                  <div className="p-6 h-full">
                    <div className="space-y-4">
                      <div className="h-8 bg-muted rounded w-1/3"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-32 bg-muted rounded"></div>
                    </div>
                  </div>

                  {/* Widget Preview */}
                  <div className="absolute inset-0 pointer-events-none">
                    <ChatWidget
                      agentId={agent.id}
                      agentName={agent.name}
                      position={config.position}
                      theme={config.theme}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading font-bold">Widget Analytics</CardTitle>
                <CardDescription>Track your widget performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Conversations</span>
                    <span className="text-2xl font-bold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-lg font-semibold">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Response Time</span>
                    <span className="text-lg font-semibold">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Satisfaction</span>
                    <span className="text-lg font-semibold">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <a href={`/chat/${agent.id}`} target="_blank" rel="noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Test Widget
                  </a>
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Code className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
