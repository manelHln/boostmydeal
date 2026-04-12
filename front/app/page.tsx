import { redirect } from "next/navigation"

export default function HomePage() {
  // For now, redirect to the wizard
  // In production, this would check if onboarding is complete
  redirect("/wizard")
}
