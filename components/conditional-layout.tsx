"use client"

import { usePathname } from "next/navigation"
import ModernHeader from "@/components/modern-header"
import Footer from "@/components/footer"
import StickyApplyButton from "@/components/sticky-apply-button"
import FloatingCTA from "@/components/floating-cta"

interface ConditionalLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export default function ConditionalLayout({ children, showHeader = true }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if we're on the root page (Cocinarte homepage)
  const isRootPage = pathname === '/'
  
  // Check if we're on a Cocinarte page
  const isCocinartePage = pathname?.startsWith('/cocinarte')
  
  // Check if we're on the landing page
  const isLandingPage = pathname?.startsWith('/landing')
  
  // Check if we're on the dashboard page
  const isDashboardPage = pathname?.startsWith('/dashboard')
  
  // Check if we're on the login page
  const isLoginPage = pathname?.startsWith('/login')
  
  if (isRootPage || isCocinartePage || isLandingPage || isDashboardPage || isLoginPage || !showHeader) {
    // For root page, Cocinarte pages, landing page, dashboard, login, or when showHeader is false, only render the children (no header/footer)
    return <>{children}</>
  }
  
  // For all other pages, render with header and footer
  return (
    <div style={{ marginTop: "70px" }}>
      <ModernHeader />
      {children}
      <Footer />
      <FloatingCTA />
    </div>
  )
}
