"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
}

export function Logo({ className, size = "md", showText = false }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const dimension = sizeMap[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo.svg"}
        alt="BoostMyDeal"
        width={dimension}
        height={dimension}
        className="object-contain"
        priority
      />
      {showText && (
        <span className="font-semibold text-foreground">BoostMyDeal</span>
      )}
    </div>
  )
}

// Icon-only version that works without theme context
export function LogoIcon({ className, size = "md" }: Omit<LogoProps, "showText">) {
  const dimension = sizeMap[size]
  
  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        className="fill-foreground"
        d="M324.28,352.27v23.12h-43.82c-27.8,0-54.41-11.03-74.05-30.67-9.85-9.82-17.51-21.38-22.72-33.97-5.2-12.59-7.98-26.18-7.98-40.08v-8.32h23.15v56.75c0,8.79,3.52,17.23,9.75,23.47,3.09,3.09,6.76,5.52,10.75,7.17,3.99,1.65,8.29,2.52,12.65,2.52h92.25Z"
      />
      <path 
        className="fill-primary"
        d="M324.28,331.57v8.32h-23.16v-56.72c0-8.82-3.49-17.27-9.72-23.47-3.12-3.12-6.76-5.52-10.75-7.17-3.99-1.65-8.29-2.52-12.68-2.52h-92.25v-23.16h43.85c27.77,0,54.41,11.03,74.05,30.67,9.82,9.82,17.48,21.38,22.69,33.97,5.24,12.59,7.98,26.18,7.98,40.08Z"
      />
      <path 
        className="fill-foreground"
        d="M324.28,229.32v20.69h-23.16v-69.09c0-8.82-3.49-17.27-9.72-23.47-3.12-3.09-6.76-5.52-10.75-7.17-3.99-1.65-8.29-2.52-12.68-2.52h-69.09v66.75h-23.15v-46.06c0-24.22,19.63-43.85,43.85-43.85h0c27.77,0,54.41,11.03,74.05,30.67,9.82,9.82,17.48,21.38,22.69,33.97,5.24,12.59,7.98,26.21,7.98,40.08Z"
      />
    </svg>
  )
}
