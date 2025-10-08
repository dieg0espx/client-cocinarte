"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Play, Pause } from "lucide-react"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  src: string
  alt: string
  description: string
  imagePosition?: string // Custom positioning for images
  imageScale?: 'cover' | 'contain' // Custom scaling for images
  previewImage?: string // Preview image for videos
}

interface ProgramCarouselProps {
  media: MediaItem[]
  color?: string
  className?: string
}

export default function ProgramCarousel({ media, color = "blue", className = "" }: ProgramCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [thumbnailTouchStart, setThumbnailTouchStart] = useState<number | null>(null)
  const [thumbnailTouchEnd, setThumbnailTouchEnd] = useState<number | null>(null)
  
  // Limit to 5 items on mobile
  const displayMedia = isMobile ? media.slice(0, 5) : media

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayMedia.length)
    setIsPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayMedia.length) % displayMedia.length)
    setIsPlaying(false)
  }

  const toggleVideo = () => {
    if (media[currentIndex].type === 'video') {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
      }
    }
  }

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 30
    const isRightSwipe = distance < -30

    if (isLeftSwipe && displayMedia.length > 1) {
      nextSlide()
    }
    if (isRightSwipe && displayMedia.length > 1) {
      prevSlide()
    }
  }

  // Mouse event handlers for desktop drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchEnd(null)
    setTouchStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX)
    }
  }

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 30
    const isRightSwipe = distance < -30

    if (isLeftSwipe && displayMedia.length > 1) {
      nextSlide()
    }
    if (isRightSwipe && displayMedia.length > 1) {
      prevSlide()
    }
  }

  // Thumbnail touch event handlers for mobile swipe functionality
  const handleThumbnailTouchStart = (e: React.TouchEvent) => {
    setThumbnailTouchEnd(null)
    setThumbnailTouchStart(e.targetTouches[0].clientX)
  }

  const handleThumbnailTouchMove = (e: React.TouchEvent) => {
    setThumbnailTouchEnd(e.targetTouches[0].clientX)
  }

  const handleThumbnailTouchEnd = () => {
    if (!thumbnailTouchStart || !thumbnailTouchEnd) return
    
    const distance = thumbnailTouchStart - thumbnailTouchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && displayMedia.length > 1) {
      nextSlide()
    }
    if (isRightSwipe && displayMedia.length > 1) {
      prevSlide()
    }
  }

  const currentMedia = displayMedia[currentIndex]

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-play videos when they become the current slide
  useEffect(() => {
    if (currentMedia && currentMedia.type === 'video' && videoRef.current) {
      // Reset video to start
      videoRef.current.currentTime = 0
      
      // Attempt to play
      const playPromise = videoRef.current.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            console.log("Video autoplay prevented:", error)
            setIsPlaying(false)
          })
      }
    } else {
      setIsPlaying(false)
    }
  }, [currentIndex, currentMedia])

  // Color mappings for different programs
  const colorClasses = {
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-600',
      buttonBorder: 'border-slate-300',
      buttonText: 'text-slate-600',
      buttonHover: 'hover:bg-slate-100',
      description: 'text-slate-700',
      thumbnailBorder: 'border-slate-200',
      thumbnailRing: 'ring-slate-500',
      videoBg: 'bg-slate-200',
      videoText: 'text-slate-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      buttonBorder: 'border-green-300',
      buttonText: 'text-green-600',
      buttonHover: 'hover:bg-green-100',
      description: 'text-green-700',
      thumbnailBorder: 'border-green-200',
      thumbnailRing: 'ring-green-500',
      videoBg: 'bg-green-200',
      videoText: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-600',
      buttonBorder: 'border-orange-300',
      buttonText: 'text-orange-600',
      buttonHover: 'hover:bg-orange-100',
      description: 'text-orange-700',
      thumbnailBorder: 'border-orange-200',
      thumbnailRing: 'ring-orange-500',
      videoBg: 'bg-orange-200',
      videoText: 'text-orange-600'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-600',
      buttonBorder: 'border-amber-300',
      buttonText: 'text-amber-600',
      buttonHover: 'hover:bg-amber-100',
      description: 'text-amber-700',
      thumbnailBorder: 'border-amber-200',
      thumbnailRing: 'ring-amber-500',
      videoBg: 'bg-amber-200',
      videoText: 'text-amber-600'
    }
  }

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <div className={`${colors.bg} rounded-2xl shadow-lg overflow-hidden ${className}`}>

      {/* Media Display */}
      <div 
        className="relative aspect-video bg-slate-100 select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setTouchStart(null)
          setTouchEnd(null)
        }}
      >
        {currentMedia.type === 'image' ? (
          <Image
            src={currentMedia.src}
            alt={currentMedia.alt}
            fill
            className={currentMedia.imageScale === 'contain' ? 'object-contain' : 'object-cover'}
            style={{
              objectPosition: currentMedia.imagePosition || 'center'
            }}
          />
        ) : (
          <video
            key={currentMedia.id}
            ref={videoRef}
            src={currentMedia.src}
            className="w-full h-full object-cover"
            loop
            muted
            autoPlay
            playsInline
            onClick={toggleVideo}
            preload="auto"
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {
                  console.log("Video autoplay was prevented")
                })
              }
            }}
          >
            <source src={currentMedia.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
      </div>

      {/* Description */}
      <div className="p-6">
        <p className={`${colors.description} leading-relaxed text-sm sm:text-base`}>{currentMedia.description}</p>
      </div>

      {/* Thumbnail Navigation */}
      {displayMedia.length > 1 && (
        <div className={`p-4 border-t ${colors.border}`}>
          <div 
            className="flex space-x-2 overflow-x-auto"
            onTouchStart={handleThumbnailTouchStart}
            onTouchMove={handleThumbnailTouchMove}
            onTouchEnd={handleThumbnailTouchEnd}
          >
            {displayMedia.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                  index === currentIndex ? `ring-2 ${colors.thumbnailRing}` : 'opacity-60 hover:opacity-80'
                }`}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  item.previewImage ? (
                    <Image
                      src={item.previewImage}
                      alt={item.alt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <Play className="w-6 h-6 text-slate-500" />
                    </div>
                  )
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
