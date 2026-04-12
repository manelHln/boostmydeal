"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  HelpCircle, 
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  Video,
  ChevronRight,
  ExternalLink
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I create my first AI agent?",
    answer: "Navigate to the AI Agents page and click 'Create Agent'. Follow the setup wizard to configure your agent's voice, personality, and call scripts. You can test the agent before going live."
  },
  {
    question: "How does the billing work?",
    answer: "We offer monthly plans based on call minutes. You can view your usage on the Billing page. Unused minutes don't roll over, but you can upgrade or downgrade your plan at any time."
  },
  {
    question: "Can I integrate with my existing CRM?",
    answer: "Yes! We support integrations with HubSpot, Salesforce, Zoho, and many other CRMs. Go to the Integrations page to connect your CRM and sync contacts automatically."
  },
  {
    question: "How do I train my AI agent with custom knowledge?",
    answer: "Use the Knowledge Base feature to upload documents, PDFs, or add website URLs. The AI will learn from this content and use it during calls to provide accurate information."
  },
  {
    question: "What happens if a call fails?",
    answer: "Failed calls are logged in the Call Logs section with detailed error information. Common issues include network problems, invalid phone numbers, or rate limits. You can retry failed calls manually or set up automatic retries."
  },
  {
    question: "Can I use my own phone number?",
    answer: "Yes, you can bring your own number or purchase a new one through our platform. Go to Settings > Phone Numbers to configure your calling numbers."
  },
]

const guides = [
  { title: "Getting Started Guide", description: "Learn the basics of BoostMyDeal", icon: BookOpen },
  { title: "Creating Effective Call Scripts", description: "Best practices for AI conversations", icon: MessageCircle },
  { title: "Integration Setup", description: "Connect your tools and CRMs", icon: ExternalLink },
  { title: "Analytics Deep Dive", description: "Understanding your performance metrics", icon: Video },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Help Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Get help and learn how to use BoostMyDeal
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold">How can we help you?</h2>
            <p className="text-sm text-muted-foreground">Search our knowledge base or browse FAQs below</p>
          </div>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {guides.map((guide) => (
          <Card key={guide.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <guide.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{guide.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{guide.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No FAQs found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@boostmydeal.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Phone Support</p>
                  <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Live Chat</p>
                  <p className="text-xs text-muted-foreground">Available 9am - 6pm EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="What do you need help with?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Describe your issue..." rows={4} />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
