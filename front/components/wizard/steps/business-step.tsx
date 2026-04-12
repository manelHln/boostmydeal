"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { Upload, FileText, X } from "lucide-react"

const INDUSTRIES = [
  "Technology",
  "Real Estate",
  "Healthcare",
  "Financial Services",
  "E-commerce",
  "Manufacturing",
  "Education",
  "Consulting",
  "Marketing & Advertising",
  "Legal Services",
  "Insurance",
  "Automotive",
  "Other",
]

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
]

const SALES_GOALS = [
  "Increase lead conversion",
  "Reduce response time",
  "Automate follow-ups",
  "Scale outbound calls",
  "Improve customer engagement",
  "Reduce sales team workload",
]

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "GMT (London)" },
  { value: "Europe/Paris", label: "CET (Paris)" },
  { value: "Asia/Tokyo", label: "JST (Tokyo)" },
  { value: "Asia/Shanghai", label: "CST (Shanghai)" },
]

interface UploadedFile {
  id: string
  name: string
  size: number
}

export function BusinessStep() {
  const { nextStep, updateData, data, isLoading } = useWizard()
  
  const [formData, setFormData] = useState({
    companyName: data.businessInfo?.companyName || "",
    industry: data.businessInfo?.industry || "",
    companySize: data.businessInfo?.companySize || "",
    salesGoal: data.businessInfo?.salesGoal || "",
    timezone: data.businessInfo?.timezone || "",
  })
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleContinue = () => {
    updateData({
      businessInfo: {
        ...formData,
        knowledgeBaseFiles: uploadedFiles.map(f => f.name),
      },
    })
    nextStep()
  }

  const isValid = formData.companyName && formData.industry && formData.companySize && formData.salesGoal

  return (
    <WizardLayout
      title="Tell Us About Your Business"
      subtitle="Help us understand your company to configure the AI agents appropriately."
    >
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
              />
            </div>

            {/* Industry & Company Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => handleInputChange("companySize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sales Goal */}
            <div className="space-y-2">
              <Label>Primary Sales Goal</Label>
              <Select
                value={formData.salesGoal}
                onValueChange={(value) => handleInputChange("salesGoal", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What's your main objective?" />
                </SelectTrigger>
                <SelectContent>
                  {SALES_GOALS.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => handleInputChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Knowledge Base Upload */}
            <div className="space-y-2">
              <Label>Knowledge Base Documents (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload PDFs with product info, FAQs, or sales scripts to train your AI agent.
              </p>
              
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop PDF files here, or
                </p>
                <label className="cursor-pointer">
                  <span className="text-primary hover:underline">browse files</span>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={!isValid || isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </div>
      </div>
    </WizardLayout>
  )
}
