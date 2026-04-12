import type {
  ApiResponse,
  AuthResponse,
  User,
  Organization,
  OnboardingData,
  AIAgent,
  Call,
  Workflow,
  KnowledgeBase,
  KnowledgeDocument,
  TeamMember,
  TeamInvitation,
  Integration,
  Notification,
  BillingInfo,
  DashboardMetrics,
  CallMetrics,
  Voice,
  PhoneNumber,
  PaginatedRequest,
} from "./types"

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      ;(headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || "UNKNOWN_ERROR",
            message: data.message || "An error occurred",
            details: data.details,
          },
        }
      }

      return {
        success: true,
        data: data.data || data,
        pagination: data.pagination,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        },
      }
    }
  }

  // ============================================
  // Authentication
  // ============================================

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(data: {
    email: string
    password: string
    name: string
    organizationName: string
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async signup(data: {
    organizationName: string
    organizationSlug: string
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
    website?: string
  }): Promise<ApiResponse<AuthResponse & { redirectTo?: string }>> {
    return this.request<AuthResponse & { redirectTo?: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include", // Important for HttpOnly cookies
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/logout", { method: "POST" })
  }

  // Multi-tenant authentication flow
  async sendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<{ tempToken: string }>> {
    return this.request<{ tempToken: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    })
  }

  async getUserOrganizations(tempToken: string): Promise<ApiResponse<{ 
    organizations: Array<{
      id: string
      name: string
      slug: string
      logo?: string
      role: string
      memberCount: number
    }>
  }>> {
    return this.request<{ organizations: Array<{ id: string; name: string; slug: string; logo?: string; role: string; memberCount: number }> }>("/auth/organizations", {
      headers: {
        "X-Temp-Token": tempToken,
      },
    })
  }

  async selectOrganization(tempToken: string, organizationId: string): Promise<ApiResponse<AuthResponse & { 
    redirectTo: string
    onboarding?: { 
      completed: boolean
      currentStep: number 
    }
  }>> {
    return this.request<AuthResponse & { redirectTo: string; onboarding?: { completed: boolean; currentStep: number } }>("/auth/select-organization", {
      method: "POST",
      body: JSON.stringify({ organizationId }),
      headers: {
        "X-Temp-Token": tempToken,
      },
      credentials: "include",
    })
  }

  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async me(): Promise<ApiResponse<{ user: User; organization: Organization }>> {
    return this.request<{ user: User; organization: Organization }>("/auth/me")
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return this.request<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  // ============================================
  // Onboarding
  // ============================================

  async getOnboardingStatus(): Promise<ApiResponse<{ step: number; completed: boolean; data: Partial<OnboardingData> }>> {
    return this.request("/onboarding/status")
  }

  async saveOnboardingStep(step: number, data: Partial<OnboardingData>): Promise<ApiResponse<void>> {
    return this.request<void>(`/onboarding/step/${step}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async skipOnboarding(): Promise<ApiResponse<void>> {
    return this.request<void>("/onboarding/skip", { method: "POST" })
  }

  async completeOnboarding(): Promise<ApiResponse<void>> {
    return this.request<void>("/onboarding/complete", { method: "POST" })
  }

  // ============================================
  // AI Agents
  // ============================================

  async getAgents(params?: PaginatedRequest): Promise<ApiResponse<AIAgent[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<AIAgent[]>(`/agents${query}`)
  }

  async getAgent(id: string): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>(`/agents/${id}`)
  }

  async createAgent(data: Partial<AIAgent>): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>("/agents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAgent(id: string, data: Partial<AIAgent>): Promise<ApiResponse<AIAgent>> {
    return this.request<AIAgent>(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteAgent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/agents/${id}`, { method: "DELETE" })
  }

  // ============================================
  // Calls
  // ============================================

  async getCalls(params?: PaginatedRequest): Promise<ApiResponse<Call[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Call[]>(`/calls${query}`)
  }

  async getCall(id: string): Promise<ApiResponse<Call>> {
    return this.request<Call>(`/calls/${id}`)
  }

  async initiateCall(data: {
    agentId: string
    phoneNumber: string
    contactName?: string
    contactEmail?: string
  }): Promise<ApiResponse<Call>> {
    return this.request<Call>("/calls/initiate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getCallTranscription(callId: string): Promise<ApiResponse<{ transcription: string; segments: unknown[] }>> {
    return this.request(`/calls/${callId}/transcription`)
  }

  async exportCalls(params?: { format: "csv" | "json"; startDate?: string; endDate?: string }): Promise<ApiResponse<{ downloadUrl: string }>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request(`/calls/export${query}`)
  }

  // ============================================
  // Phone Numbers
  // ============================================

  async getPhoneNumbers(): Promise<ApiResponse<PhoneNumber[]>> {
    return this.request<PhoneNumber[]>("/phone-numbers")
  }

  async addPhoneNumber(data: { number: string; label?: string }): Promise<ApiResponse<PhoneNumber>> {
    return this.request<PhoneNumber>("/phone-numbers", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deletePhoneNumber(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/phone-numbers/${id}`, { method: "DELETE" })
  }

  // ============================================
  // Voices
  // ============================================

  async getVoices(params?: { provider?: string }): Promise<ApiResponse<Voice[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Voice[]>(`/voices${query}`)
  }
  
  // Provider-specific voice endpoints with filtering
  async getElevenLabsVoices(params?: { 
    name?: string
    gender?: string
    country?: string
    language?: string 
  }): Promise<ApiResponse<Voice[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Voice[]>(`/elevenlabs/voices${query}`)
  }
  
  async getStreamElementsVoices(params?: { 
    name?: string
    gender?: string
    country?: string
    language?: string 
  }): Promise<ApiResponse<Voice[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Voice[]>(`/stream-elements/voices${query}`)
  }
  
  async getSmallestAIVoices(params?: { 
    name?: string
    gender?: string
    country?: string
    language?: string 
  }): Promise<ApiResponse<Voice[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Voice[]>(`/smallest-ai/voices${query}`)
  }

  async cloneVoice(data: { name: string; audioFile: File }): Promise<ApiResponse<Voice>> {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("audioFile", data.audioFile)
    
    return this.request<Voice>("/voices/clone", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    })
  }

  async deleteVoice(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/voices/${id}`, { method: "DELETE" })
  }
  
  // ============================================
  // RAG / Knowledge Base Processing
  // ============================================
  
  async processKnowledgeBase(knowledgeBaseId: string): Promise<ApiResponse<{ summary: string; keyPoints: string[] }>> {
    return this.request(`/rag/process-knowledge-base`, {
      method: "POST",
      body: JSON.stringify({ knowledgeBaseId }),
    })
  }

  // ============================================
  // Workflows
  // ============================================

  async getWorkflows(params?: PaginatedRequest): Promise<ApiResponse<Workflow[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Workflow[]>(`/workflows${query}`)
  }

  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}`)
  }

  async createWorkflow(data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>("/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/workflows/${id}`, { method: "DELETE" })
  }

  async toggleWorkflow(id: string, active: boolean): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}/toggle`, {
      method: "POST",
      body: JSON.stringify({ active }),
    })
  }

  async triggerWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/workflows/${id}/trigger`, { method: "POST" })
  }

  // ============================================
  // Knowledge Base
  // ============================================

  async getKnowledgeBases(): Promise<ApiResponse<KnowledgeBase[]>> {
    return this.request<KnowledgeBase[]>("/knowledge-base")
  }

  async getKnowledgeBase(id: string): Promise<ApiResponse<KnowledgeBase>> {
    return this.request<KnowledgeBase>(`/knowledge-base/${id}`)
  }

  async createKnowledgeBase(data: { name: string; description?: string }): Promise<ApiResponse<KnowledgeBase>> {
    return this.request<KnowledgeBase>("/knowledge-base", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async uploadDocument(knowledgeBaseId: string, file: File): Promise<ApiResponse<KnowledgeDocument>> {
    const formData = new FormData()
    formData.append("file", file)
    
    return this.request<KnowledgeDocument>(`/knowledge-base/${knowledgeBaseId}/documents`, {
      method: "POST",
      body: formData,
      headers: {},
    })
  }

  async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/knowledge-base/${knowledgeBaseId}/documents/${documentId}`, {
      method: "DELETE",
    })
  }

  // ============================================
  // Integrations
  // ============================================

  async getIntegrations(): Promise<ApiResponse<Integration[]>> {
    return this.request<Integration[]>("/integrations")
  }

  async saveIntegration(type: string, config: Record<string, unknown>): Promise<ApiResponse<Integration>> {
    return this.request<Integration>(`/integrations/${type}`, {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async testIntegration(type: string, config: Record<string, unknown>): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request(`/integrations/${type}/test`, {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async deleteIntegration(type: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/integrations/${type}`, { method: "DELETE" })
  }

  // ============================================
  // Team
  // ============================================

  async getTeamMembers(): Promise<ApiResponse<TeamMember[]>> {
    return this.request<TeamMember[]>("/team/members")
  }

  async getTeamInvitations(): Promise<ApiResponse<TeamInvitation[]>> {
    return this.request<TeamInvitation[]>("/team/invitations")
  }

  async inviteTeamMember(data: { email: string; role: "admin" | "user" }): Promise<ApiResponse<TeamInvitation>> {
    return this.request<TeamInvitation>("/team/invite", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async acceptInvitation(token: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/team/accept-invitation/${token}`, { method: "POST" })
  }

  async removeTeamMember(memberId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/team/members/${memberId}`, { method: "DELETE" })
  }

  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/team/invitations/${invitationId}`, { method: "DELETE" })
  }

  async updateMemberRole(memberId: string, role: "admin" | "user"): Promise<ApiResponse<TeamMember>> {
    return this.request<TeamMember>(`/team/members/${memberId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }

  // ============================================
  // Notifications
  // ============================================

  async getNotifications(params?: { read?: boolean; page?: number; limit?: number }): Promise<ApiResponse<Notification[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<Notification[]>(`/notifications${query}`)
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request("/notifications/unread-count")
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/notifications/${notificationId}/read`, { method: "POST" })
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.request<void>("/notifications/mark-all-read", { method: "POST" })
  }

  // ============================================
  // Billing
  // ============================================

  async getBillingInfo(): Promise<ApiResponse<BillingInfo>> {
    return this.request<BillingInfo>("/billing")
  }

  async createPaymentIntent(amount: number): Promise<ApiResponse<{ clientSecret: string }>> {
    return this.request("/billing/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }

  async getPaymentHistory(): Promise<ApiResponse<{ invoices: unknown[] }>> {
    return this.request("/billing/history")
  }

  // ============================================
  // Analytics
  // ============================================

  async getDashboardMetrics(params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<DashboardMetrics>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<DashboardMetrics>(`/analytics/dashboard${query}`)
  }

  async getCallMetrics(params?: { period?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<CallMetrics>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""
    return this.request<CallMetrics>(`/analytics/calls${query}`)
  }

  // ============================================
  // User Profile
  // ============================================

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async updateOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return this.request<Organization>("/organization", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return this.request<void>("/user/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL)

// Export class for testing/custom instances
export { ApiClient }
