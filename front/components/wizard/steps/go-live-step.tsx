"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { 
  CheckCircle2, 
  Phone, 
  Mail, 
  Calendar, 
  Database, 
  Zap,
  Plus,
  Loader2,
  X,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TestItem {
  id: string
  value: string
  status: "pending" | "testing" | "tested" | "failed"
}

const LEAD_SOURCES = [
  { id: "imported", name: "Imported leads", description: "Leads you've imported" },
  { id: "inbound", name: "New inbound leads", description: "Fresh incoming leads" },
  { id: "test", name: "Test list", description: "For testing purposes" },
]

export function GoLiveStep() {
  const { completeOnboarding, data, isLoading } = useWizard()
  
  const [phoneNumbers, setPhoneNumbers] = useState<TestItem[]>([
    { id: "1", value: "+1 202-555-0123", status: "tested" },
    { id: "2", value: "+1 202-555-0198", status: "tested" },
    { id: "3", value: "+1 203-555-0175", status: "tested" },
  ])
  
  const [emails, setEmails] = useState<TestItem[]>([
    { id: "1", value: "john@example.com", status: "pending" },
    { id: "2", value: "sarah@example.com", status: "pending" },
    { id: "3", value: "dave@example.com", status: "pending" },
  ])
  
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [selectedLeadSource, setSelectedLeadSource] = useState("")
  const [isRunningTest, setIsRunningTest] = useState(false)
  
  const [testProgress, setTestProgress] = useState({
    calling: false,
    emailing: false,
    booking: false,
    callingDone: false,
    emailingDone: false,
    bookingDone: false,
  })

  // Checklist items based on wizard data
  const checklistItems = [
    { 
      id: "phone", 
      label: "Phone tested", 
      description: "Call test successful",
      completed: phoneNumbers.some(p => p.status === "tested"),
      icon: Phone,
    },
    { 
      id: "email", 
      label: "Email tested", 
      description: "Assist in booking and scheduling",
      completed: data.tools?.email?.connected || false,
      icon: Mail,
    },
    { 
      id: "calendar", 
      label: "Calendar tested", 
      description: "Calendar connection verified",
      completed: data.tools?.calendar?.connected || false,
      icon: Calendar,
    },
    { 
      id: "crm", 
      label: "CRM Connected or skipped", 
      description: "CRM connection verified",
      completed: data.tools?.crm?.connected || data.tools?.crm?.provider === "none" || true,
      icon: Database,
    },
    { 
      id: "workflow", 
      label: "Workflow enabled", 
      description: "AI automation is scheduled",
      completed: (data.workflow?.triggers?.length ?? 0) > 0,
      icon: Zap,
    },
  ]

  const addPhoneNumber = () => {
    if (newPhone.trim()) {
      setPhoneNumbers(prev => [
        ...prev,
        { id: Date.now().toString(), value: newPhone, status: "pending" }
      ])
      setNewPhone("")
    }
  }

  const addEmail = () => {
    if (newEmail.trim()) {
      setEmails(prev => [
        ...prev,
        { id: Date.now().toString(), value: newEmail, status: "pending" }
      ])
      setNewEmail("")
    }
  }

  const removePhone = (id: string) => {
    setPhoneNumbers(prev => prev.filter(p => p.id !== id))
  }

  const removeEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id))
  }

  const runTest = async () => {
    setIsRunningTest(true)
    
    // Simulate test progress
    setTestProgress(prev => ({ ...prev, calling: true }))
    await new Promise(r => setTimeout(r, 1500))
    setTestProgress(prev => ({ ...prev, calling: false, callingDone: true, emailing: true }))
    await new Promise(r => setTimeout(r, 1500))
    setTestProgress(prev => ({ ...prev, emailing: false, emailingDone: true, booking: true }))
    await new Promise(r => setTimeout(r, 1500))
    setTestProgress(prev => ({ ...prev, booking: false, bookingDone: true }))
    
    setIsRunningTest(false)
  }

  const allChecked = checklistItems.every(item => item.completed)

  return (
    <WizardLayout
      title="Try Before Going Live"
      subtitle="Test how BoostMyDeal's AI system will perform on your leads before going live with customers."
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Phone Numbers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-info" />
                <h3 className="font-semibold">Test Phone Numbers</h3>
              </div>
              <button className="text-sm text-info hover:underline">Edit</button>
            </div>

            <div className="space-y-2 mb-4">
              {phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span className="text-sm">{phone.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs",
                      phone.status === "tested" ? "text-success" : "text-muted-foreground"
                    )}>
                      {phone.status === "tested" ? "Tested" : "Pending"}
                    </span>
                    <button onClick={() => removePhone(phone.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter a phone number..."
                  className="pl-9"
                />
              </div>
              <Button onClick={addPhoneNumber} className="bg-info hover:bg-info/90 text-info-foreground">
                Add
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              These will be used only for testing.
            </p>
          </Card>

          {/* Test Emails */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-info" />
                <h3 className="font-semibold">Test Emails</h3>
              </div>
              <button className="text-sm text-info hover:underline">Edit</button>
            </div>

            <div className="space-y-2 mb-4">
              {emails.map((email) => (
                <div key={email.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span className="text-sm">{email.value}</span>
                  </div>
                  <button onClick={() => removeEmail(email.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="pl-9"
                />
              </div>
              <Button onClick={addEmail} className="bg-info hover:bg-info/90 text-info-foreground">
                Add
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              These will be used only for testing.
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* What Will Happen */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-info" />
              <h3 className="font-semibold">What Will Happen</h3>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                AI agent will place test call(s)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                Follow-up email will be sent
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                CRM will log test activity
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-info" />
                Meeting booking will be tested
              </li>
            </ul>

            <div className="mt-6 p-3 bg-info/10 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-info" />
              <p className="text-xs text-muted-foreground">
                These will be used only for testing.
              </p>
            </div>
          </Card>

          {/* Test Progress */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Test Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {testProgress.calling ? (
                    <Loader2 className="w-4 h-4 animate-spin text-info" />
                  ) : testProgress.callingDone ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className="text-sm">Running test...</span>
                </div>
                {isRunningTest && !testProgress.callingDone && (
                  <span className="text-xs text-info">In Progress...</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className={cn(
                    "w-4 h-4",
                    testProgress.callingDone ? "text-success" : "text-muted-foreground"
                  )} />
                  <span className="text-sm">Calling +1 202-555-0123</span>
                </div>
                {testProgress.callingDone && (
                  <span className="text-xs text-success">Tested</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className={cn(
                    "w-4 h-4",
                    testProgress.emailingDone ? "text-success" : "text-muted-foreground"
                  )} />
                  <span className="text-sm">Emailing john@example.com</span>
                </div>
                {testProgress.emailingDone && (
                  <span className="text-xs text-success">Tested</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className={cn(
                    "w-4 h-4",
                    testProgress.bookingDone ? "text-success" : "text-muted-foreground"
                  )} />
                  <span className="text-sm">Booking test meeting</span>
                </div>
                {testProgress.bookingDone && (
                  <span className="text-xs text-success">Tested</span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            onClick={runTest}
            disabled={isRunningTest || isLoading}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            {isRunningTest ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              "Run Test Now"
            )}
          </Button>
          <button
            onClick={completeOnboarding}
            disabled={isLoading}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Skip test and Go Live
          </button>
        </div>
      </div>
    </WizardLayout>
  )
}
