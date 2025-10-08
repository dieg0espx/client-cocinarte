"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"

export default function StickyApplyButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 100px down (reduced for easier testing)
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsVisible(scrollTop > 100)
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleApplyClick = () => {
    // Navigate to contact page
    window.location.href = '/contact'
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal in localStorage so it doesn't show again this session
    localStorage.setItem('applyButtonDismissed', 'true')
  }

  // Check if user has dismissed the button this session
  useEffect(() => {
    const dismissed = localStorage.getItem('applyButtonDismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        <Button
          onClick={handleApplyClick}
          className="bg-slate hover:bg-slate-800 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-full font-bold text-base border-2 border-slate-600"
        >
          <FileText className="h-5 w-5 mr-2" />
          Apply Now
        </Button>
        
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-1.5 transition-colors duration-200 shadow-lg"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
