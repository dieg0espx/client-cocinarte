"use client"

import { Button } from "@/components/ui/button"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useState } from "react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function CocinartePrivateEvents() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    eventType: '',
    numberOfGuests: '',
    preferredTime: '',
    contactName: '',
    phone: '',
    email: '',
    eventDetails: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Private events form submitted!')
    console.log('Form data:', formData)
    console.log('Selected date:', selectedDate)
    
    if (!selectedDate) {
      console.log('Date validation failed')
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your event.",
        variant: "destructive"
      })
      return
    }

    if (!formData.eventType || formData.eventType === 'Select event type') {
      console.log('Event type validation failed')
      toast({
        title: "Event Type Required",
        description: "Please select an event type.",
        variant: "destructive"
      })
      return
    }

    if (!formData.preferredTime || formData.preferredTime === 'Select time') {
      console.log('Time validation failed')
      toast({
        title: "Time Required",
        description: "Please select a preferred time.",
        variant: "destructive"
      })
      return
    }

    console.log('All validations passed, submitting...')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/private-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredDate: selectedDate.toISOString(),
          ...formData
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Success! Showing toast...')
        toast({
          title: "🎊 Request Submitted!",
          description: "We've received your event request and will contact you within 24 hours!",
          duration: 5000
        })
        
        // Reset form
        setSelectedDate(null)
        setFormData({
          eventType: '',
          numberOfGuests: '',
          preferredTime: '',
          contactName: '',
          phone: '',
          email: '',
          eventDetails: ''
        })
      } else {
        throw new Error(data.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting event request:', error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                >
                  <option value="">Select event type</option>
                  <option value="Team Building">Team Building</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Family Reunion">Family Reunion</option>
                  <option value="Anniversary Celebration">Anniversary Celebration</option>
                  <option value="Holiday Party">Holiday Party</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Guests *</label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="How many people?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Date *</label>
                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select a date"
                    className="w-full px-4 py-3 pr-12 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                    minDate={new Date()}
                    required
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Time *</label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                >
                  <option value="">Select time</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                  <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                  <option value="Custom time">Custom time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Name *</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="(503) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Details</label>
                <textarea
                  name="eventDetails"
                  value={formData.eventDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-cocinarte-blue/30 rounded-xl focus:ring-2 focus:ring-cocinarte-orange focus:border-cocinarte-orange transition-all duration-200 text-sm bg-white hover:bg-gray-50 resize-none"
                  placeholder="Tell us about your event, any specific cuisine preferences, dietary restrictions, or special requirements..."
                ></textarea>
              </div>
              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cocinarte-orange hover:bg-amber text-cocinarte-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Event Request'}
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
