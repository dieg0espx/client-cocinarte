"use client"

import Image from "next/image"

interface FloatingElementProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  animation?: string
}

function FloatingElement({ src, alt, width, height, className = "", animation = "animate-float-slow" }: FloatingElementProps) {
  return (
    <div className={`inline-block ${animation} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="opacity-70"
      />
    </div>
  )
}

export default function CocinarteFloatingElements() {
  return (
    <div className="pointer-events-none">
      {/* This component will be used inline with headings */}
    </div>
  )
}

// Export individual floating elements for use with headings
export function HeroFloatingElements() {
  return (
    <div className="sticky top-20 flex flex-col items-center gap-6 z-10">
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_cupcakes.svg"
        alt="Cupcakes"
        width={80}
        height={80}
        animation="animate-float-slow"
      />
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_batidora.svg"
        alt="Mixer"
        width={70}
        height={70}
        animation="animate-float-medium"
      />
    </div>
  )
}

export function AboutFloatingElements() {
  return (
    <div className="sticky top-20 flex flex-col items-center gap-4 z-10">
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_cuchara.svg"
        alt="Spoon"
        width={60}
        height={60}
        animation="animate-float-slow"
      />
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_cuchillo.svg"
        alt="Knife"
        width={55}
        height={55}
        animation="animate-float-medium"
      />
    </div>
  )
}

export function ClassTypesFloatingElements() {
  return (
    <div className="sticky top-20 flex flex-col items-center gap-4 z-10">
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_frutas.svg"
        alt="Fruits"
        width={70}
        height={70}
        animation="animate-float-slow"
      />
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_niคo1.svg"
        alt="Child cooking"
        width={60}
        height={60}
        animation="animate-float-medium"
      />
    </div>
  )
}

export function SafetyFloatingElements() {
  return (
    <div className="sticky top-20 flex flex-col items-center gap-4 z-10">
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_guante.svg"
        alt="Oven mitt"
        width={60}
        height={60}
        animation="animate-float-slow"
      />
      <FloatingElement
        src="/cocinarte/floating_elements/COCINARTE_tabla corte.svg"
        alt="Cutting board"
        width={55}
        height={55}
        animation="animate-float-medium"
      />
    </div>
  )
}
