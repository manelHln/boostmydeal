"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWizard } from "../wizard-context"
import { WizardLayout } from "../wizard-layout"
import { Play, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

const VOICE_PROVIDERS = [
  { id: "elevenlabs", name: "ElevenLabs", description: "Premium voice synthesis" },
  { id: "openai", name: "OpenAI TTS", description: "Fast & reliable" },
  { id: "azure", name: "Azure Speech", description: "Enterprise grade" },
]

const VOICES = [
  { id: "sarah", name: "Sarah", gender: "female", language: "English (US)" },
  { id: "james", name: "James", gender: "male", language: "English (US)" },
  { id: "emma", name: "Emma", gender: "female", language: "English (UK)" },
  { id: "michael", name: "Michael", gender: "male", language: "English (UK)" },
  { id: "sophia", name: "Sophia", gender: "female", language: "English (US)" },
  { id: "david", name: "David", gender: "male", language: "English (US)" },
]

const TONE_OPTIONS = [
  { id: "professional", name: "Professional", description: "Formal and business-like" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable" },
  { id: "casual", name: "Casual", description: "Relaxed and conversational" },
  { id: "persuasive", name: "Persuasive", description: "Sales-focused and compelling" },
]

const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
]

export function AIAgentStep() {
  const { nextStep, updateData, data, isLoading } = useWizard()
  
  const [formData, setFormData] = useState({
    name: data.aiAgent?.name || "Sales Agent",
    description: data.aiAgent?.description || "",
    voiceProvider: data.aiAgent?.voiceProvider || "elevenlabs",
    selectedVoice: data.aiAgent?.voiceModel || "",
    tone: data.aiAgent?.tone || "professional",
    openingMessage: data.aiAgent?.openingMessage || "Hi, this is {agent_name} from {company_name}. How are you today?",
    systemPrompt: data.aiAgent?.systemPrompt || "",
    temperature: data.aiAgent?.temperature ?? 0.7,
    languages: data.aiAgent?.languages || ["English (US)"],
  })

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    updateData({
      aiAgent: {
        name: formData.name,
        description: formData.description,
        gender: "neutral",
        voiceProvider: formData.voiceProvider,
        voiceModel: formData.selectedVoice,
        tone: formData.tone,
        openingMessage: formData.openingMessage,
        systemPrompt: formData.systemPrompt,
        temperature: formData.temperature,
        maxTokens: 2048,
        languages: formData.languages,
      },
    })
    nextStep()
  }

  const isValid = formData.name && formData.selectedVoice && formData.openingMessage

  return (
    <WizardLayout
      title="Configure Your AI Agent"
      subtitle="Customize how your AI agent sounds and behaves during calls."
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Configuration */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Voice Settings</h3>
            
            {/* Agent Name */}
            <div className="space-y-2 mb-6">
              <Label>Agent Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Sales Agent, Support Bot"
              />
            </div>

            {/* Voice Provider */}
            <div className="space-y-2 mb-6">
              <Label>Voice Provider</Label>
              <div className="grid grid-cols-3 gap-2">
                {VOICE_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleInputChange("voiceProvider", provider.id)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      formData.voiceProvider === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="font-medium text-sm">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2 mb-6">
              <Label>Select Voice</Label>
              <div className="grid grid-cols-2 gap-2">
                {VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => handleInputChange("selectedVoice", voice.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                      formData.selectedVoice === voice.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {voice.gender} - {voice.language}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Play voice preview
                      }}
                      className="p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="space-y-2">
              <Label>Conversation Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value) => handleInputChange("tone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      <span className="font-medium">{tone.name}</span>
                      <span className="text-muted-foreground ml-2">- {tone.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Messaging Configuration */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Messaging & Behavior</h3>
            
            {/* Opening Message */}
            <div className="space-y-2 mb-6">
              <Label>Opening Message</Label>
              <Textarea
                value={formData.openingMessage}
                onChange={(e) => handleInputChange("openingMessage", e.target.value)}
                placeholder="What your AI agent says when the call connects..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{agent_name}"}, {"{company_name}"}, {"{contact_name}"} as placeholders.
              </p>
            </div>

            {/* System Prompt */}
            <div className="space-y-2 mb-6">
              <Label>System Instructions (Optional)</Label>
              <Textarea
                value={formData.systemPrompt}
                onChange={(e) => handleInputChange("systemPrompt", e.target.value)}
                placeholder="Additional instructions for how the AI should behave..."
                rows={4}
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <Label>Creativity Level</Label>
                <span className="text-sm text-muted-foreground">
                  {formData.temperature.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => handleInputChange("temperature", value[0])}
                min={0}
                max={1}
                step={0.1}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Predictable</span>
                <span>More Creative</span>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Supported Languages</Label>
              <Select
                value={formData.languages[0]}
                onValueChange={(value) => handleInputChange("languages", [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Voice Preview */}
        {formData.selectedVoice && (
          <Card className="mt-6 p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Volume2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Preview Voice</p>
                  <p className="text-xs text-muted-foreground">
                    Listen to how your AI agent will sound
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="w-4 h-4" />
                Play Sample
              </Button>
            </div>
          </Card>
        )}

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
