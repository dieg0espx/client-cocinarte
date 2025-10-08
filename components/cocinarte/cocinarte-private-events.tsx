"use client"

import { Button } from "@/components/ui/button"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState } from "react"
import Image from "next/image"

export default function CocinartePrivateEvents() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <section id="private-events" className="py-20 bg-gradient-to-br from-cocinarte-blue/10 via-cocinarte-yellow/10 to-cocinarte-orange/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Image
              src="/cocinarte/floating_elements/COCINARTE_utensilios.svg"
              alt="Utensils"
              width={90}
              height={90}
              className="opacity-70 animate-float-slow"
            />
            <h2 className="text-4xl lg:text-5xl font-bold text-slate">
              Private Events
            </h2>
            <Image
              src="/cocinarte/floating_elements/COCINARTE_niคo3.svg"
              alt="Child cooking"
              width={80}
              height={80}
              className="opacity-70 animate-float-medium"
            />
          </div>
          <p className="text-xl text-slate-medium max-w-3xl mx-auto">
            Host your own cooking event! Perfect for team building, celebrations, or special occasions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-cocinarte-white rounded-2xl shadow-lg p-8 flex flex-col">
            <form className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
                <select className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50">
                  <option>Select event type</option>
                  <option>Team Building</option>
                  <option>Corporate Event</option>
                  <option>Family Reunion</option>
                  <option>Anniversary Celebration</option>
                  <option>Holiday Party</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests</label>
                <input type="number" className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50" placeholder="How many people?" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Date</label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a date"
                    className="w-full px-4 py-3 pr-12 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    minDate={new Date()}
                    showPopperArrow={false}
                    popperClassName="react-datepicker-popper"
                    calendarClassName="react-datepicker-calendar"
                    dayClassName={(date) => 
                      date.getTime() === selectedDate?.getTime() 
                        ? 'react-datepicker__day--selected' 
                        : ''
                    }
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Time</label>
                <select className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50">
                  <option>Select time</option>
                  <option>Morning (9 AM - 12 PM)</option>
                  <option>Afternoon (1 PM - 4 PM)</option>
                  <option>Evening (5 PM - 8 PM)</option>
                  <option>Custom time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name</label>
                <input type="text" className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50" placeholder="(503) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Details</label>
                <textarea rows={4} className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50 resize-none" placeholder="Tell us about your event, any specific cuisine preferences, dietary restrictions, or special requirements..."></textarea>
              </div>
              <div className="text-center">
                <Button className="bg-cocinarte-orange hover:bg-amber text-cocinarte-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                  Submit Event Request
                </Button>
                <p className="text-sm text-slate-medium mt-4">We'll contact you within 24 hours with custom pricing and availability!</p>
              </div>
            </form>
          </div>

          {/* Slideshow Section */}
          <div className="bg-cocinarte-white rounded-2xl shadow-lg p-8 flex flex-col">
            <div className="relative flex-1 space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden">
                <Image
                  src="/cocinarte/cocinarte2.jpeg"
                  alt="Team Building Event"
                  width={400}
                  height={225}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden">
                <Image
                  src="/cocinarte/cocinarte10.jpeg"
                  alt="Family Celebration"
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="aspect-video rounded-xl overflow-hidden">
                <Image
                  src="/cocinarte/cocinarte11.jpeg"
                  alt="Holiday Party"
                  width={400}
                  height={225}
                  className="w-full h-full object-cover object-[center_35%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
