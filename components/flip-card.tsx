"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface FlipCardProps {
  title: string
  description: string
  category: string
  imageSrc: string
  videoSrc?: string
  videoPosition?: string
  imagePosition?: string
  detailedDescription?: string
  learningOutcomes?: string[]
}

export default function FlipCard({
  title,
  description,
  category,
  imageSrc,
  videoSrc,
  videoPosition = "center 20%",
  imagePosition = "center",
  detailedDescription,
  learningOutcomes = []
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleInteraction = () => {
    if (isMobile) {
      // No flip on mobile - just scroll
      return
    }
  }

  return (
    <div 
      className="relative w-full sm:w-[350px] md:w-[400px] lg:w-[28rem] h-[220px] sm:h-[280px] md:h-[320px] lg:h-[22rem] flex-shrink-0"
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      onClick={handleInteraction}
    >
      {/* Card Container with 3D Flip Effect - Only on desktop */}
      <div 
        className={`relative w-full h-full transition-transform duration-700 ${!isMobile ? 'transform-style-preserve-3d' : ''} ${
          isFlipped && !isMobile ? 'rotate-y-180' : ''
        }`}
        style={!isMobile ? { transformStyle: 'preserve-3d' } : {}}
      >
        {/* Front of Card - Image or Video */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-xl ${!isMobile ? 'backface-hidden' : ''}`}
          style={!isMobile ? { backfaceVisibility: 'hidden' } : {}}
        >
          <div className="relative w-full h-full">
            {videoSrc ? (
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ 
                  pointerEvents: 'none',
                  objectPosition: videoPosition
                }}
                preload="auto"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover"
                style={{ objectPosition: imagePosition }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 mb-2 sm:mb-3">
                <span className="text-white text-xs sm:text-sm font-medium capitalize">{category}</span>
              </div>
              <h3 className="text-white text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 drop-shadow-lg">{title}</h3>
              <p className="text-white/90 text-xs sm:text-sm drop-shadow-lg">{description}</p>
            </div>
          </div>
        </div>

        {/* Back of Card - Information - Only visible on desktop */}
        {!isMobile && (
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-xl bg-cocinarte-navy rotate-y-180"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="inline-block bg-cocinarte-yellow/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 mb-2 sm:mb-4">
                <span className="text-cocinarte-yellow text-xs sm:text-sm font-medium capitalize">{category}</span>
              </div>
              <h3 className="text-white text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">{title}</h3>
              <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                {detailedDescription || description}
              </p>
            </div>
            
            {learningOutcomes.length > 0 && (
              <div>
                <h4 className="text-cocinarte-yellow text-xs sm:text-sm font-semibold mb-2">Learning Outcomes:</h4>
                <ul className="text-white/80 text-xs space-y-1">
                  {learningOutcomes.slice(0, 3).map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-cocinarte-yellow mr-2">•</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
