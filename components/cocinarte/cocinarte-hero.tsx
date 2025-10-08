"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function CocinarteHero() {
  return (
    <section className="relative w-full mt-[60px] sm:mt-[70px] md:mt-[90px]">
      {/* Background image - full width, dynamic height */}
      <div className="relative w-full">
        <Image
          src="/hero.png"
          alt="Cocinarte background"
          width={1920}
          height={1080}
          className="w-full h-auto"
          priority
        />
      </div>
      
   
    </section>
  )
}
