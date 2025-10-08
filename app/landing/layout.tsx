import { Metadata } from "next"
import ConditionalLayout from "@/components/conditional-layout"

export const metadata: Metadata = {
  title: "Our Family of Programs | Spanish Immersion Education",
  description: "Discover our comprehensive Spanish immersion programs: Casita Azul (Preschool & Daycare), Cocinarte (Cooking Classes), and Camp Alegría (Summer Camp). Bilingual education and cultural experiences for all ages in Hillsboro, Oregon.",
  keywords: ["Spanish immersion", "bilingual education", "Casita Azul", "Cocinarte", "Camp Alegria", "Hillsboro Oregon", "preschool", "daycare", "cooking classes", "summer camp"],
  openGraph: {
    title: "Our Family of Programs | Spanish Immersion Education",
    description: "Discover our comprehensive Spanish immersion programs: Casita Azul (Preschool & Daycare), Cocinarte (Cooking Classes), and Camp Alegría (Summer Camp). Bilingual education and cultural experiences for all ages in Hillsboro, Oregon.",
    type: "website",
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConditionalLayout showHeader={false}>
      {children}
    </ConditionalLayout>
  )
}
