"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Bot, Upload, Settings, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface AgentFormData {
  // Step 1: Basic Info
  name: string
  description: string
  purpose: string

  // Step 2: Personality & Behavior
  tone: "professional" | "casual" | "technical" | "friendly"
  responseStyle: "concise" | "detailed" | "balanced"
  responseLength: "short" | "medium" | "long"

  // Step 3: Knowledge Base
  knowledgeFiles: File[]
  knowledgeUrls: string[]
  knowledgeText: string

  // Step 4: Tool Selection
  selectedTools: string[]

  // Step 5: AI Provider
  provider: "openai" | "anthropic" | "google"
  model: string
  temperature: number
  maxTokens: number
}

const STEPS = [
  { id: 1, title: "Basic Information", description: "Name and purpose of your agent" },
  { id: 2, title: "Personality", description: "Define how your agent communicates" },
  { id: 3, title: "Knowledge Base", description: "Upload documents and information" },
  { id: 4, title: "Tools & Integrations", description: "Select available tools" },
  { id: 5, title: "AI Configuration", description: "Choose AI provider and settings" },
  { id: 6, title: "Review & Deploy", description: "Test and deploy your agent" },
]

const AVAILABLE_TOOLS = [
  { id: "web-search", name: "Web Search", description: "Search the internet for information" },
  { id: "knowledge-base", name: "Knowledge Base", description: "Search uploaded documents" },
  { id: "email", name: "Email Integration", description: "Send and receive emails" },
  { id: "calendar", name: "Calendar", description: "Schedule and manage appointments" },
  { id: "crm", name: "CRM Integration", description: "Access customer data" },
  { id: "database", name: "Database Query", description: "Query your databases" },
]

export default function CreateAgentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    purpose: "",
    tone: "professional",
    responseStyle: "balanced",
    responseLength: "medium",
    knowledgeFiles: [],
    knowledgeUrls: [],
    knowledgeText: "",
    selectedTools: [],
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
  })

  const updateFormData = (updates: Partial<AgentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // In production, this would call the API to create the agent
    console.log("[v0] Creating agent with data:", formData)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/agents")
  }

  const progress = (currentStep / STEPS.length) * 100

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
              <h1 className="text-2xl font-heading font-black text-foreground">Create New Agent</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between text-sm">
              {STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep
                      ? "text-primary font-medium"
                      : step.id < currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      step.id === currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id < currentStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs text-center hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading font-bold flex items-center">
                {currentStep === 1 && <Bot className="h-5 w-5 mr-2" />}
                {currentStep === 2 && <Settings className="h-5 w-5 mr-2" />}
                {currentStep === 3 && <Upload className="h-5 w-5 mr-2" />}
                {currentStep === 4 && <Zap className="h-5 w-5 mr-2" />}
                {currentStep === 5 && <Settings className="h-5 w-5 mr-2" />}
                {currentStep === 6 && <Bot className="h-5 w-5 mr-2" />}
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Customer Support Bot"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of what this agent does"
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose & Goals</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe what you want this agent to accomplish and how it should help users"
                      value={formData.purpose}
                      onChange={(e) => updateFormData({ purpose: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Personality & Behavior */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>Communication Tone</Label>
                    <Select value={formData.tone} onValueChange={(value: any) => updateFormData({ tone: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional - Formal and business-like</SelectItem>
                        <SelectItem value="friendly">Friendly - Warm and approachable</SelectItem>
                        <SelectItem value="casual">Casual - Relaxed and conversational</SelectItem>
                        <SelectItem value="technical">Technical - Precise and detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Response Style</Label>
                    <Select
                      value={formData.responseStyle}
                      onValueChange={(value: any) => updateFormData({ responseStyle: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise - Short and to the point</SelectItem>
                        <SelectItem value="balanced">Balanced - Moderate detail level</SelectItem>
                        <SelectItem value="detailed">Detailed - Comprehensive explanations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Typical Response Length</Label>
                    <Select
                      value={formData.responseLength}
                      onValueChange={(value: any) => updateFormData({ responseLength: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short - 1-2 sentences</SelectItem>
                        <SelectItem value="medium">Medium - 1-2 paragraphs</SelectItem>
                        <SelectItem value="long">Long - Multiple paragraphs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Knowledge Base */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label>Upload Documents</Label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                      <Button variant="outline" size="sm">
                        Choose Files
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports PDF, Word, Text files (Max 10MB each)
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="urls">Website URLs</Label>
                    <Textarea
                      id="urls"
                      placeholder="Enter URLs (one per line) that contain information your agent should know about"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="knowledge-text">Additional Information</Label>
                    <Textarea
                      id="knowledge-text"
                      placeholder="Paste any additional text, FAQs, or information your agent should know"
                      value={formData.knowledgeText}
                      onChange={(e) => updateFormData({ knowledgeText: e.target.value })}
                      className="mt-1"
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Tool Selection */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the tools and integrations your agent can use to help users
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_TOOLS.map((tool) => (
                      <div key={tool.id} className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                        <Checkbox
                          id={tool.id}
                          checked={formData.selectedTools.includes(tool.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData({ selectedTools: [...formData.selectedTools, tool.id] })
                            } else {
                              updateFormData({ selectedTools: formData.selectedTools.filter((t) => t !== tool.id) })
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={tool.id} className="font-medium cursor-pointer">
                            {tool.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: AI Configuration */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label>AI Provider</Label>
                    <Select
                      value={formData.provider}
                      onValueChange={(value: any) => updateFormData({ provider: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI - GPT Models</SelectItem>
                        <SelectItem value="anthropic">Anthropic - Claude Models</SelectItem>
                        <SelectItem value="google">Google - Gemini Models</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Select value={formData.model} onValueChange={(value) => updateFormData({ model: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.provider === "openai" && (
                          <>
                            <SelectItem value="gpt-4">GPT-4 - Most capable</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo - Faster and cheaper</SelectItem>
                          </>
                        )}
                        {formData.provider === "anthropic" && (
                          <>
                            <SelectItem value="claude-3-opus">Claude 3 Opus - Most capable</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet - Balanced</SelectItem>
                          </>
                        )}
                        {formData.provider === "google" && (
                          <>
                            <SelectItem value="gemini-pro">Gemini Pro - Most capable</SelectItem>
                            <SelectItem value="gemini-pro-vision">Gemini Pro Vision - With image support</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Creativity Level</Label>
                    <Select
                      value={formData.temperature.toString()}
                      onValueChange={(value) => updateFormData({ temperature: Number.parseFloat(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.1">Low - Very consistent and predictable</SelectItem>
                        <SelectItem value="0.7">Medium - Balanced creativity</SelectItem>
                        <SelectItem value="1.0">High - More creative and varied</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 6: Review & Deploy */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-heading font-bold mb-3">Agent Summary</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Name:</strong> {formData.name || "Untitled Agent"}
                      </p>
                      <p>
                        <strong>Purpose:</strong> {formData.purpose || "No purpose specified"}
                      </p>
                      <p>
                        <strong>Tone:</strong> {formData.tone}
                      </p>
                      <p>
                        <strong>Tools:</strong>{" "}
                        {formData.selectedTools.length > 0 ? formData.selectedTools.join(", ") : "None selected"}
                      </p>
                      <p>
                        <strong>AI Provider:</strong> {formData.provider} ({formData.model})
                      </p>
                    </div>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                    <h4 className="font-medium text-accent-foreground mb-2">Ready to Deploy!</h4>
                    <p className="text-sm text-muted-foreground">
                      Your agent is configured and ready to be deployed. You can test it first or deploy it directly.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-2">
              {currentStep === STEPS.length ? (
                <>
                  <Button variant="outline">Test Agent</Button>
                  <Button onClick={handleSubmit} className="flex items-center">
                    Deploy Agent
                    <Bot className="h-4 w-4 ml-2" />
                  </Button>
                </>
              ) : (
                <Button onClick={nextStep} disabled={currentStep === 1 && !formData.name} className="flex items-center">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
