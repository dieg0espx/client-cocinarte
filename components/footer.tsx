import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react"
import { FiInstagram, FiExternalLink } from "react-icons/fi"

export default function Footer() {
  return (
    <footer className="relative bg-slate text-white overflow-hidden border-t border-slate-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.com/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-stretch gap-8 mb-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 p-2">
              <Image 
                src="/branding/logo.png" 
                alt="Logo" 
                width={64} 
                height={64}
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl font-ivry font-bold mb-2">Our Programs</h2>
            <p className="text-slate-200 text-base max-w-md font-questa mb-4">
              Engaging Spanish immersion experiences for children and families through bilingual education, cooking adventures, and cultural exploration.
            </p>
                         <div className="flex gap-4">
               <a href="https://instagram.com/spanishhorizonsacademy" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-slate-light transition-colors">
                 <FiInstagram className="h-6 w-6" />
               </a>
               <a href="https://casitaazulpdx.com" target="_blank" rel="noopener noreferrer" aria-label="Casita Azul" className="hover:text-slate-light transition-colors">
                 <FiExternalLink className="h-6 w-6" />
               </a>
             </div>
          </div>

          <div className="flex flex-col justify-between md:items-end text-center md:text-right">
            <div className="space-y">
              <div className="flex text-right gap-2 text-slate-200 text-sm">
                <MapPin className="h-4 w-4" />
                770 NE Rogahn Street, Hillsboro, OR 97124
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-sm">
                <Phone className="h-4 w-4" />
                (503) 916-9758
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-sm">
                <Mail className="h-4 w-4" />
                infospanishhorizons@casitaazulpdx.org
              </div>
              <div className="flex items-center gap-2 text-slate-200 text-sm">
                <Clock className="h-4 w-4" />
                8:00 AM – 4:00 PM (Mon-Fri)
              </div>
            </div>
                         <div className="flex flex-wrap gap-3 justify-center md:justify-end">
               <Link href="/admissions" className="underline hover:text-slate-light transition-colors text-sm">Admissions</Link>
               <Link href="/tuition" className="underline hover:text-slate-light transition-colors text-sm">Tuition</Link>
               <Link href="/calendar" className="underline hover:text-slate-light transition-colors text-sm">Calendar</Link>
               <Link href="/programs" className="underline hover:text-slate-light transition-colors text-sm">Programs</Link>
               <Link href="/about" className="underline hover:text-slate-light transition-colors text-sm">About</Link>
               <Link href="/contact" className="underline hover:text-slate-light transition-colors text-sm">Contact</Link>
             </div>
          </div>
        </div>

        {/* Middle Section - Additional Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 border-t border-slate-700 pt-8">
                     <div className="text-center md:text-left">
             <h3 className="text-lg font-bold mb-3 text-slate-light">Our Mission</h3>
             <p className="text-slate-300 text-sm font-questa">
               To provide exceptional Spanish immersion education that fosters bilingualism, cultural appreciation, and academic excellence in a nurturing environment.
             </p>
           </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-3 text-amber-400">Programs</h3>
            <p className="text-slate-300 text-sm font-questa">
              K-5 Spanish immersion curriculum with hands-on learning, cultural activities, and personalized attention to each child's development.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-3 text-green-400">Community</h3>
            <p className="text-slate-300 text-sm font-questa">
              Part of the Casita Azul family, serving the Hillsboro community with authentic Spanish language and cultural education since our founding.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-4 text-slate-300 text-xs font-questa mb-2 md:mb-0">
             <span>Spanish Immersion</span>
             <span className="h-1 w-1 bg-slate-light rounded-full inline-block"></span>
             <span>K-5 Education</span>
             <span className="h-1 w-1 bg-amber-400 rounded-full inline-block"></span>
             <span>Hillsboro, OR</span>
           </div>
          <p className="text-slate-400 text-xs font-questa">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 