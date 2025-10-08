import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Camp Alegría | Spanish Immersion Summer Camp",
  description: "Experience Camp Alegría, our exciting summer program that combines Spanish language learning with fun activities, outdoor adventures, and cultural experiences.",
  keywords: ["Camp Alegria", "summer camp", "Spanish immersion", "summer program", "Hillsboro"],
}

export default function CampAlegriaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {children}
    </div>
  )
}
