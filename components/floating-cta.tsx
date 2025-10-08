"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FloatingCTA() {
  

  return (
    <div className="fixed top-1/2 -right-[50px] z-50 transform -translate-y-1/2 w-fit transform -rotate-90">
      {/* Main CTA Button - Rotated 90 degrees */}
      <div className="relative">
        <Link href="/contact">
          <Button
            size="lg"
            className="bg-amber hover:bg-golden text-white shadow-lg hover:shadow-xl transition-all duration-200 font-questa px-[60px] py-4 text-sm font-semibold  origin-center whitespace-nowrap rounded-none"
            style={{ 
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            <span className="transform -rotate-90">Apply Now</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}