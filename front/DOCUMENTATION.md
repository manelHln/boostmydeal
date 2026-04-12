# BoostMyDeal - AI Voice Agents SaaS Platform

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Codebase Structure](#codebase-structure)
5. [Module Documentation](#module-documentation)
6. [Authentication Flow](#authentication-flow)
7. [Feature Workflows](#feature-workflows)
8. [API Reference](#api-reference)
9. [UI Components](#ui-components)
10. [Environment Variables](#environment-variables)

---

## Project Overview

BoostMyDeal is a multi-tenant SaaS platform for managing AI-powered voice agents. The platform enables businesses to create, configure, and deploy AI agents that can make and receive phone calls, handle customer interactions, and integrate with CRM systems.

### Core Features

- **Multi-tenant Authentication**: Slack-like OTP-based login with organization selection
- **Onboarding Wizard**: 6-step guided setup for new organizations
- **AI Agents Management**: Create and configure voice agents with 5-tab configuration
- **Workflow Automation**: Visual n8n-style workflow builder with React Flow
- **Call Logs**: Real-time call tracking with transcription and recording
- **Integrations**: CRM, email, calendar, phone, and voice AI provider connections
- **Knowledge Base**: Document management for RAG-powered agent responses
- **Team Management**: Multi-user organizations with role-based access
- **Billing**: Subscription management and usage tracking

---

## Tech Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.10 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.1.9 | Utility-first CSS |
| tailwindcss-animate | 1.0.7 | Animation utilities |
| class-variance-authority | 0.7.1 | Component variants |
| tailwind-merge | 3.3.1 | Class merging |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| Radix UI | Various | Accessible primitives |
| shadcn/ui | Latest | Pre-built components |
| Lucide React | 0.454.0 | Icon library |

### Data & State
| Technology | Version | Purpose |
|------------|---------|---------|
| React Hook Form | 7.60.0 | Form management |
| Zod | 3.25.76 | Schema validation |
| SWR | - | Data fetching (recommended) |

### Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.15.4 | Charts and graphs |
| React Flow | 11.11.4 | Workflow canvas |

### Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| date-fns | 4.1.0 | Date manipulation |
| sonner | 1.7.4 | Toast notifications |
| next-themes | 0.4.6 | Dark/light mode |
| input-otp | 1.4.1 | OTP input component |

---

## Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js App Router                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │  (auth)     │  │   (app)     │  │     wizard      │   │   │
│  │  │  Route      │  │   Route     │  │     Route       │   │   │
│  │  │  Group      │  │   Group     │  │                 │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Components Layer                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │   UI     │ │  Wizard  │ │  Agents  │ │ Workflows│     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Lib Layer                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   api.ts     │  │   types.ts   │  │   utils.ts   │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  /api/auth    /api/agents   /api/calls   /api/workflows  │   │
│  │  /api/integrations   /api/knowledge-base   /api/team     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Vapi    │ │ElevenLabs│ │ HubSpot  │ │  Twilio  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Route Groups

The application uses Next.js 16 App Router with route groups for layout organization:

| Route Group | Purpose | Layout |
|-------------|---------|--------|
| `(auth)` | Authentication pages | Minimal, no sidebar |
| `(app)` | Main application | Sidebar + container |
| `wizard` | Onboarding | Custom wizard layout |

---

## Codebase Structure

```
/vercel/share/v0-project/
├── app/
│   ├── (app)/                    # Main app route group
│   │   ├── layout.tsx            # Sidebar + main content layout
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── agents/page.tsx       # AI agents management
│   │   ├── calls/page.tsx        # Call logs
│   │   ├── workflows/            # Workflow module
│   │   │   ├── page.tsx          # Workflow list
│   │   │   ├── create/page.tsx   # Create workflow
│   │   │   ├── edit/[id]/page.tsx
│   │   │   └── execution-history/[workflowId]/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── knowledge/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── team/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── help/page.tsx
│   │   └── logout/page.tsx
│   ├── (auth)/                   # Auth route group
│   │   ├── layout.tsx
│   │   ├── login/page.tsx        # Email input step
│   │   ├── verify-otp/page.tsx   # OTP verification
│   │   ├── select-organization/page.tsx
│   │   └── signup/page.tsx
│   ├── wizard/page.tsx           # Onboarding wizard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirects to /wizard
│   ├── globals.css               # Global styles + design tokens
│   └── global-error.tsx
├── components/
│   ├── ui/                       # shadcn/ui components (50+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── logo.tsx              # Brand logo component
│   │   └── ... (50+ components)
│   ├── wizard/                   # Onboarding wizard
│   │   ├── index.tsx
│   │   ├── wizard-context.tsx    # Wizard state management
│   │   ├── wizard-layout.tsx     # Step navigation layout
│   │   └── steps/
│   │       ├── welcome-step.tsx
│   │       ├── business-step.tsx
│   │       ├── tools-step.tsx
│   │       ├── workflow-step.tsx
│   │       ├── ai-agent-step.tsx
│   │       ├── report-step.tsx
│   │       └── go-live-step.tsx
│   ├── agents/
│   │   └── agent-form.tsx        # 5-tab agent configuration
│   ├── workflows/
│   │   └── workflow-editor.tsx   # React Flow visual editor
│   ├── calls/
│   │   └── transcript-overlay.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── calls-chart.tsx
│   │   ├── recent-calls.tsx
│   │   ├── agent-performance.tsx
│   │   └── quick-actions.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── api.ts                    # API client singleton
│   ├── types.ts                  # TypeScript interfaces
│   └── utils.ts                  # Utility functions (cn)
├── public/
│   ├── logo.svg                  # Light mode logo
│   └── logo-dark.svg             # Dark mode logo
├── package.json
└── tsconfig.json
```

---

## Module Documentation

### 1. Authentication Module

**Location**: `app/(auth)/`

#### Files
| File | Description |
|------|-------------|
| `login/page.tsx` | Email input form, sends OTP |
| `verify-otp/page.tsx` | 6-digit OTP verification |
| `select-organization/page.tsx` | Multi-tenant org selection |
| `signup/page.tsx` | New user registration |

#### Flow
```
/login → Enter Email → POST /api/auth/send-otp
   ↓
/verify-otp → Enter OTP → POST /api/auth/verify-otp
   ↓
/select-organization → Choose Org → POST /api/auth/select-organization
   ↓
/wizard (if onboarding incomplete) OR /dashboard
```

---

### 2. Onboarding Wizard Module

**Location**: `components/wizard/`

#### Files
| File | Description |
|------|-------------|
| `wizard-context.tsx` | React Context for wizard state |
| `wizard-layout.tsx` | Step indicator and navigation |
| `steps/welcome-step.tsx` | Overview cards |
| `steps/business-step.tsx` | Company information |
| `steps/tools-step.tsx` | Integration connections |
| `steps/workflow-step.tsx` | Automation setup |
| `steps/ai-agent-step.tsx` | Agent configuration |
| `steps/report-step.tsx` | Reporting preferences |
| `steps/go-live-step.tsx` | Readiness checklist |

#### State Structure
```typescript
interface WizardData {
  businessInfo: {
    companyName: string
    industry: string
    companySize: string
    salesGoal: string
    timezone: string
  }
  tools: {
    crm?: { provider: string; connected: boolean }
    phone?: { provider: string; numbers: string[] }
    email?: { provider: string; connected: boolean }
    calendar?: { provider: string; connected: boolean }
  }
  workflow: { triggers: string[]; rules: AutomationRule[] }
  aiAgent: { name: string; voice: string; tone: string; ... }
  reporting: { emailReports: boolean; frequency: string }
  goLive: { readinessChecks: boolean[] }
}
```

---

### 3. AI Agents Module

**Location**: `app/(app)/agents/`, `components/agents/`

#### Agent Form Tabs

| Tab | Fields |
|-----|--------|
| **Basics** | Name, Description, Language, AI Provider, Model, Phone Number, First Message, User Speaks First, Workflows |
| **Persona** | Identity, Style, Goals, Response Guidelines, Error Handling |
| **Media & Knowledge** | Voice Provider, Transcriber, Voice, Knowledge Base, Speed |
| **Settings** | Call Recording, Recording Format, Remember Lead, Voicemail Detection, Call Transfer, Temperature, Max Tokens |
| **Post Call** | User Tags (custom), System Tags (predefined) |

#### AI Models Supported
```typescript
const AI_MODELS = {
  ChatGPT: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  "Gemini Live": ["gemini-2.0-flash-live-preview", "gemini-1.5-flash-live-preview"]
}
```

#### Voice Providers
| Provider | Voices |
|----------|--------|
| ElevenLabs | API-fetched with filters (gender, country, language) |
| Rime | 14 preset voices |
| StreamElements | API-fetched |
| Smallest AI | API-fetched |
| Gemini Live | 30 Google voices (Puck, Charon, Kore, etc.) |

---

### 4. Workflows Module

**Location**: `app/(app)/workflows/`, `components/workflows/`

#### Visual Editor (React Flow)

The workflow editor uses React Flow for a visual node-based canvas similar to n8n.

**Node Types**:
| Node Type | Color | Purpose |
|-----------|-------|---------|
| TRIGGER | Green | Workflow entry point (7 trigger types) |
| AI_AGENT | Purple | AI agent execution |
| EMAIL_TOOL | Blue | Send emails via SMTP |
| HUBSPOT_TOOL | Orange | HubSpot CRM actions |
| ZOHO_TOOL | Red | Zoho CRM actions |
| CONDITION | Yellow | Conditional branching (coming soon) |
| WEBHOOK | Indigo | HTTP callbacks (coming soon) |
| DELAY | Gray | Wait/pause (coming soon) |
| SMS | Green | Send SMS (coming soon) |
| SLACK | Purple | Slack notifications (coming soon) |
| CALENDAR | Cyan | Calendar events (coming soon) |

**Trigger Types**:
```typescript
type WorkflowTriggerType = 
  | "PHONE_CALL_CONNECTED"
  | "TRANSCRIPT_COMPLETE"
  | "CALL_SUMMARY"
  | "PHONE_CALL_ENDED"
  | "LIVE_TRANSCRIPT"
  | "MANUAL"
  | "WEBHOOK"
```

#### Node Panel Categories
```
Triggers → Core Events, Integrations
AI & Agents → Assistant Nodes
CRM → HubSpot, Zoho, Salesforce
Communication → Email, SMS, Slack
Flow Control → Conditions, Delays
Data & APIs → Webhooks, HTTP
Scheduling → Calendar, Timers
```

---

### 5. Call Logs Module

**Location**: `app/(app)/calls/`, `components/calls/`

#### Two-Stage Filtering
Filters require explicit "Apply Filters" action - changing inputs alone does not trigger API calls.

| Filter | Type | API Param |
|--------|------|-----------|
| Date From | Date input | `dateFrom` (ISO string) |
| Date To | Date input | `dateTo` (ISO string) |
| Call Type | Select | `callType` (inbound/outbound) |
| Agent | Select | `agentId` |
| Status | Select | `status` |
| Contact Name | Text | `contactName` |

#### Table Columns
| Column | Source | Format |
|--------|--------|--------|
| Name | `call.contactName` | Text |
| Contact Number | `call.contactPhone` | (XXX) XXX-XXXX |
| Assistant | `call.assistantId.name` | Text |
| Date | `call.startedAt` | MM/DD/YYYY HH:MM AM/PM |
| Duration | `call.duration` | MM:SS |
| Cost | `call.cost` | $0.0000 |
| Call ID | `roomName` / `twilioSid` / `voxsunCallId` | Text |
| Status | `call.status` | Colored badge |
| Tags | `call.user_tags[]` | Expandable |
| Recording | `call.recording` | Play button |
| Transcript | Button | Opens overlay |

#### Call Statuses
```typescript
type CallStatus = 
  | "queued" | "in-progress" | "ringing" | "answered"
  | "completed" | "failed" | "busy" | "no-answer"
  | "canceled" | "voicemail"
```

#### Outbound Call Modal
```typescript
interface InitiateCallRequest {
  assistantId: string  // From /api/agents dropdown
  toNumber: string     // Tel input
  contactName: string  // Text input
}
// POST /api/calls/initiate
```

---

### 6. Integrations Module

**Location**: `app/(app)/integrations/`

#### Integration Categories

| Category | Integrations |
|----------|--------------|
| CRM | HubSpot, Zoho, Salesforce, Pipedrive |
| Phone & SMS | Twilio, Vonage |
| Email | SMTP, Gmail, Outlook, SendGrid |
| Calendar | Google Calendar, Calendly |
| Voice AI | ElevenLabs |
| Other | Webhook, Slack, Zapier |

#### Configuration Fields by Type

**SMTP**:
```typescript
{ host: string, port: number, ssl: boolean, email: string, password: string }
```

**HubSpot**:
```typescript
{ apiKey: string, baseUrl?: string }
```

**Zoho**:
```typescript
{ clientId: string, clientSecret: string, region: string, refreshToken: string, baseUrl: string }
```

**Webhook**:
```typescript
{ username?: string, password?: string }
// Returns auto-generated webhook URL
```

**ElevenLabs**:
```typescript
{ apiKey: string, voiceName?: string, voiceDescription?: string }
```

---

## Authentication Flow

### Multi-Tenant Sign-In (Slack-like)

```
┌─────────────────┐
│  /login         │
│  Enter Email    │
└────────┬────────┘
         │ POST /api/auth/send-otp
         ▼
┌─────────────────┐
│  /verify-otp    │
│  Enter 6-digit  │
│  OTP code       │
└────────┬────────┘
         │ POST /api/auth/verify-otp
         │ → Returns tempToken
         ▼
┌─────────────────────────────┐
│  /select-organization       │
│  Display user's orgs        │
│  (auto-select if only one)  │
└────────┬────────────────────┘
         │ POST /api/auth/select-organization
         │ → Returns JWT + onboarding status
         ▼
┌─────────────────────────────────────────┐
│  Redirect based on onboarding.completed │
│  - false → /wizard?step={currentStep}   │
│  - true  → /dashboard                   │
└─────────────────────────────────────────┘
```

### Sign-Up Flow

```
┌─────────────────────────────┐
│  /signup                     │
│  Organization Name + Slug    │
│  First Name, Last Name       │
│  Email, Password             │
│  Phone (optional)            │
│  Website (optional)          │
└────────┬────────────────────┘
         │ POST /api/auth/signup
         │ → HttpOnly cookie JWT
         ▼
┌─────────────────┐
│  /wizard        │
│  Start setup    │
└─────────────────┘
```

---

## Feature Workflows

### Creating an AI Agent

1. Navigate to `/agents`
2. Click "Create Agent" button
3. Fill out 5-tab form:
   - **Basics**: Name, language, AI model, phone number, first message
   - **Persona**: Define identity, style, goals, guidelines
   - **Media**: Select voice provider and voice, attach knowledge base
   - **Settings**: Configure call recording, voicemail, call transfer
   - **Post Call**: Add custom tags, select system tags
4. Click "Save Agent"
5. Agent appears in list with "draft" status
6. Toggle status to "active" to enable

### Creating a Workflow

1. Navigate to `/workflows`
2. Click "Create Workflow" button
3. Click "Add Node" to open n8n-style node panel
4. Search or browse categories for nodes
5. Click node to add to canvas
6. Drag nodes to position
7. Connect nodes by dragging from output to input handles
8. Click node to configure in sidebar:
   - Triggers: Select trigger type
   - Email: Configure to, subject, body
   - CRM: Select action, enter deal/contact data
   - AI Agent: Select agent
9. Click "Save Workflow"
10. Toggle "Active" to enable

### Making an Outbound Call

1. Navigate to `/calls`
2. Click "Create Outbound Call"
3. Select assistant from dropdown
4. Enter phone number
5. Enter contact name
6. Click "Create"
7. Call initiates, appears in table
8. Monitor status updates (polling every 5s)

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, get temp token |
| GET | `/api/auth/organizations` | Get user's organizations |
| POST | `/api/auth/select-organization` | Select org, get JWT |
| POST | `/api/auth/signup` | Register new user + org |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user + org |

### Resource Endpoints

| Resource | List | Get | Create | Update | Delete |
|----------|------|-----|--------|--------|--------|
| Agents | GET /agents | GET /agents/:id | POST /agents | PUT /agents/:id | DELETE /agents/:id |
| Calls | GET /calls | GET /calls/:id | POST /calls/initiate | - | - |
| Workflows | GET /workflows | GET /workflows/:id | POST /workflows | PUT /workflows/:id | DELETE /workflows/:id |
| Integrations | GET /integrations | - | POST /integrations/:type | - | DELETE /integrations/:type |
| Knowledge Base | GET /knowledge-base | GET /knowledge-base/:id | POST /knowledge-base | - | - |
| Team | GET /team/members | - | POST /team/invite | PUT /team/members/:id/role | DELETE /team/members/:id |

### Special Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calls/initiate` | Start outbound call |
| GET | `/api/calls/export` | Export calls to CSV |
| GET | `/api/calls/:id/transcription` | Get call transcript |
| POST | `/api/workflows/:id/toggle` | Enable/disable workflow |
| POST | `/api/integrations/:type/test` | Test integration connection |
| GET | `/api/elevenlabs/voices` | Get ElevenLabs voices with filters |

---

## UI Components

### shadcn/ui Components Used

| Category | Components |
|----------|------------|
| Layout | Card, Separator, ScrollArea, Sheet, Dialog, Drawer |
| Form | Input, Textarea, Select, Checkbox, Switch, Slider, RadioGroup |
| Data Display | Table, Badge, Avatar, Progress, Skeleton |
| Feedback | Toast (Sonner), Alert, Tooltip, Spinner |
| Navigation | Tabs, Dropdown Menu, Command, Sidebar |
| Overlay | Dialog, AlertDialog, Sheet, Popover, HoverCard |

### Custom Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Logo | `components/ui/logo.tsx` | Brand logo (light/dark) |
| AgentForm | `components/agents/agent-form.tsx` | 5-tab agent config |
| WorkflowEditor | `components/workflows/workflow-editor.tsx` | React Flow canvas |
| TranscriptOverlay | `components/calls/transcript-overlay.tsx` | Call transcript viewer |
| WizardLayout | `components/wizard/wizard-layout.tsx` | Step navigation |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend app URL |

### Integration-Specific (Backend)

| Variable | Service |
|----------|---------|
| `VAPI_API_KEY` | Vapi voice AI |
| `ELEVENLABS_API_KEY` | ElevenLabs voice |
| `TWILIO_ACCOUNT_SID` | Twilio phone |
| `TWILIO_AUTH_TOKEN` | Twilio phone |
| `HUBSPOT_API_KEY` | HubSpot CRM |
| `ZOHO_CLIENT_ID` | Zoho CRM |
| `ZOHO_CLIENT_SECRET` | Zoho CRM |
| `STRIPE_SECRET_KEY` | Billing |
| `STRIPE_WEBHOOK_SECRET` | Billing webhooks |

---

## Design System

### Brand Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | #f74000 | #f74000 | Primary actions, brand |
| `--primary-foreground` | white | white | Text on primary |
| `--background` | #fafafa | #0a0a0a | Page background |
| `--foreground` | #171717 | #ededed | Primary text |
| `--muted` | #f5f5f5 | #262626 | Secondary backgrounds |
| `--accent` | #f5f5f5 | #262626 | Hover states |

### Typography

| Font | Variable | Usage |
|------|----------|-------|
| Inter | `--font-sans` | Body text |
| Inter | `--font-serif` | Headings (same as sans) |
| Mono | `--font-mono` | Code, IDs |

---

## Development Guidelines

### File Naming
- Pages: `page.tsx`
- Components: `kebab-case.tsx`
- Types: Defined in `lib/types.ts`
- API: Singleton in `lib/api.ts`

### State Management
- Form state: React Hook Form + Zod
- Server state: SWR (recommended)
- Local state: React useState/useReducer
- Theme: next-themes

### Code Patterns
```typescript
// API calls pattern
const { data, error, isLoading } = useSWR('/api/agents', fetcher)

// Form pattern
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {}
})

// Toast pattern
import { toast } from "sonner"
toast.success("Agent created")
toast.error("Failed to save")
```

---

## Deployment

The application is designed for deployment on Vercel with:

- Next.js 16 App Router
- Edge Runtime support
- Automatic HTTPS
- Environment variable management

### Build Commands
```bash
pnpm install    # Install dependencies
pnpm dev        # Development server
pnpm build      # Production build
pnpm start      # Start production server
```

---

*Documentation generated for BoostMyDeal v1.0*
