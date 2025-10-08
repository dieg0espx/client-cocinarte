import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Casita Azul | Bilingual Preschool & Daycare",
  description: "Discover Casita Azul, our unique Spanish immersion preschool and daycare program designed to create a nurturing and engaging learning environment for young learners.",
  keywords: ["Casita Azul", "Spanish immersion", "early childhood education", "bilingual preschool", "Hillsboro"],
}

export default function CasitaAzulLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {children}
    </div>
  )
}
