import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../lib/api-client"
import { queryKey } from "../lib/query-keys"
import type { LoginResponse, VerifyOtpResponse, SignupResponse } from "../lib/types"



// ============================================
// Authentication Services
// ============================================

export const useMe = () => {
  return useQuery({
    queryKey: queryKey.auth.me(),
    queryFn: () => api.get("/me"),
  })
}


export const useLogin = () => {
  return useMutation({
    mutationFn: (tenantId: string) =>
      api.post<LoginResponse>("/login", undefined, {
        "X-Tenant-ID": tenantId,
      }),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("tenantId", data.tenant.id);
    },
  })
}


export const useSignup = () => {
  return useMutation({
    mutationFn: (data: {
      name: string;
      slug: string;
      email: string;
      password: string;
      first_Name: string;
      last_Name: string;
      phone?: string;
      website?: string;
    }) => api.post<SignupResponse>("/tenants/register ", data),
  })
}



export const useSendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => api.post("/tenants/checkEmail", { email }),
  })
}

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      api.post<VerifyOtpResponse>("/tenants/verifyOtp", data),
  })
}


export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post("/logout"),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

