import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import "./fonts.css"
import ModernHeader from "@/components/modern-header"
import Footer from "@/components/footer"
import StickyApplyButton from "@/components/sticky-apply-button"
import { Inter, Playfair_Display, Lora, Cormorant_Garamond, Libre_Baskerville, Poppins } from 'next/font/google'
import FloatingCTA from "@/components/floating-cta"
import ConditionalLayout from "@/components/conditional-layout"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
})

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  preload: false,
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: false,
})

const libreBaskerville = Libre_Baskerville({ 
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
})

const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: false,
})



export const metadata: Metadata = {
  title: "Cocinarte - Cooking Adventures for Kids & Families",
  description: "A cooking program designed for kids and families to explore Latin flavors while learning hands-on cooking skills. Fun, interactive, and age-appropriate classes.",
  keywords: [
    "cooking classes for kids",
    "Latin American cuisine",
    "family cooking",
    "kids cooking program",
    "hands-on learning",
    "Spanish cooking",
    "Cocinarte",
    "Hillsboro Oregon",
    "cooking education",
    "family activities"
  ],
  authors: [{ name: "Cocinarte" }],
  creator: "Cocinarte",
  publisher: "Cocinarte",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cocinarte.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Cocinarte - Cooking Adventures for Kids & Families",
    description: "A cooking program designed for kids and families to explore Latin flavors while learning hands-on cooking skills. Fun, interactive, and age-appropriate classes.",
    url: 'https://cocinarte.com',
    siteName: 'Cocinarte',
    images: [
      {
        url: '/cocinarte/cocinarteLogo.png',
        width: 1200,
        height: 630,
        alt: 'Cocinarte - Cooking Adventures for Kids & Families',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cocinarte - Cooking Adventures for Kids & Families",
    description: "A cooking program designed for kids and families to explore Latin flavors while learning hands-on cooking skills. Fun, interactive, and age-appropriate classes.",
    images: ['/cocinarte/cocinarteLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'education',
  classification: 'Cooking Program',
  other: {
    'msapplication-TileColor': '#1e293b',
    'theme-color': '#1e293b',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${lora.variable} ${cormorant.variable} ${libreBaskerville.variable} ${poppins.variable} scroll-smooth`}>
      <head>
        {/* Google Fonts - Coming Soon */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Coming+Soon&display=swap" rel="stylesheet" />
        
        {/* Favicon Links */}
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* Additional favicon sizes */}
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon/web-app-manifest-512x512.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#1e293b" />
        <meta name="msapplication-TileImage" content="/favicon/favicon-96x96.png" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1e293b" />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Cocinarte",
              "description": "A cooking program designed for kids and families to explore Latin flavors while learning hands-on cooking skills. Fun, interactive, and age-appropriate classes.",
              "url": "https://cocinarte.com",
              "logo": "https://cocinarte.com/cocinarte/cocinarteLogo.png",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "770 NE Rogahn Street",
                "addressLocality": "Hillsboro",
                "addressRegion": "OR",
                "postalCode": "97124",
                "addressCountry": "US"
              },
              "telephone": "+1-503-916-9758",
              "email": "infospanishhorizons@casitaazulpdx.com",
              "areaServed": {
                "@type": "City",
                "name": "Hillsboro"
              },
              "serviceType": "Cooking Classes for Kids and Families"
            })
          }}
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
