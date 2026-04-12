"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Plus, 
  Search, 
  FileText,
  Globe,
  Upload,
  MoreVertical,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Database
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const documents = [
  {
    id: "1",
    name: "Product Catalog 2024",
    type: "pdf",
    status: "indexed",
    chunks: 156,
    lastUpdated: "2 hours ago",
    size: "2.4 MB"
  },
  {
    id: "2",
    name: "Sales Scripts",
    type: "document",
    status: "indexed",
    chunks: 89,
    lastUpdated: "1 day ago",
    size: "845 KB"
  },
  {
    id: "3",
    name: "FAQ Database",
    type: "document",
    status: "processing",
    chunks: 0,
    lastUpdated: "5 minutes ago",
    size: "1.2 MB"
  },
  {
    id: "4",
    name: "Pricing Guide",
    type: "pdf",
    status: "indexed",
    chunks: 45,
    lastUpdated: "3 days ago",
    size: "567 KB"
  },
  {
    id: "5",
    name: "Company Website",
    type: "url",
    status: "indexed",
    chunks: 234,
    lastUpdated: "6 hours ago",
    size: "N/A"
  },
]

const statusConfig = {
  indexed: { label: "Indexed", color: "bg-green-500", icon: CheckCircle2 },
  processing: { label: "Processing", color: "bg-yellow-500", icon: Clock },
  failed: { label: "Failed", color: "bg-red-500", icon: AlertCircle },
}

const typeIcons = {
  pdf: FileText,
  document: FileText,
  url: Globe,
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks, 0)
  const indexedCount = documents.filter(d => d.status === "indexed").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Train your AI agents with your business data
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Knowledge Source</DialogTitle>
              <DialogDescription>
                Upload documents or add URLs to train your AI agents
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="upload" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="url">Add URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <Input placeholder="https://example.com" />
                  <p className="text-xs text-muted-foreground">
                    We will crawl and index all pages from this URL
                  </p>
                </div>
                <Button className="w-full">Add URL</Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-semibold">{documents.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indexed</p>
                <p className="text-2xl font-semibold">{indexedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Chunks</p>
                <p className="text-2xl font-semibold">{totalChunks}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-semibold">5.0 MB</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <Progress value={25} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">25% of 20 MB</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const StatusIcon = statusConfig[doc.status as keyof typeof statusConfig]?.icon || CheckCircle2
              const TypeIcon = typeIcons[doc.type as keyof typeof typeIcons] || FileText
              return (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border">
                      <TypeIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{doc.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                        <span className="text-xs text-muted-foreground">
                          {doc.chunks > 0 ? `${doc.chunks} chunks` : "Processing..."}
                        </span>
                        <span className="text-xs text-muted-foreground">{doc.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary"
                      className={`${
                        doc.status === "indexed" ? "bg-green-500/10 text-green-600" :
                        doc.status === "processing" ? "bg-yellow-500/10 text-yellow-600" :
                        "bg-red-500/10 text-red-600"
                      }`}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[doc.status as keyof typeof statusConfig]?.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-index
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
