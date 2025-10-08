"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Instagram, Facebook, User, LogOut, ChefHat, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import CocinarteBookingPopup from "./cocinarte-booking-popup"
import CocinarteAuthPopup from "./cocinarte-auth-popup"
import { useAuth } from "@/contexts/auth-context"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { Student } from "@/lib/types/students"
import { BookingWithDetails } from "@/lib/types/bookings"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CocinarteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [studentInfo, setStudentInfo] = useState<Student | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    parent_name: '',
    phone: '',
    address: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  
  const { user, signOut } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchStudentInfo = async () => {
    if (!user?.email) return
    
    try {
      setLoadingStudent(true)
      const studentsService = new StudentsClientService()
      const student = await studentsService.getStudentByEmail(user.email)
      setStudentInfo(student)
    } catch (error) {
      console.error('Error fetching student info:', error)
    } finally {
      setLoadingStudent(false)
    }
  }

  const fetchBookings = async () => {
    if (!user?.id) return
    
    setLoadingBookings(true)
    try {
      const bookingsService = new BookingsClientService()
      const userBookings = await bookingsService.getBookingsWithDetails(user.id)
      setBookings(userBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleAccountClick = () => {
    if (user) {
      fetchStudentInfo()
      fetchBookings()
      setIsAccountOpen(true)
    } else {
      // If not logged in, show auth popup
      setIsAuthOpen(true)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsAccountOpen(false)
      setStudentInfo(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleEditClick = () => {
    if (studentInfo) {
      setEditForm({
        parent_name: studentInfo.parent_name,
        phone: studentInfo.phone || '',
        address: studentInfo.address || ''
      })
      setIsEditing(true)
      setUpdateError('')
      setUpdateMessage('')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      parent_name: '',
      phone: '',
      address: ''
    })
    setUpdateError('')
    setUpdateMessage('')
  }

  const handleUpdateStudent = async () => {
    if (!studentInfo) return

    setUpdateLoading(true)
    setUpdateError('')
    setUpdateMessage('')

    try {
      const studentsService = new StudentsClientService()
      const updatedStudent = await studentsService.updateStudent({
        id: studentInfo.id,
        parent_name: editForm.parent_name,
        phone: editForm.phone,
        address: editForm.address
      })
      
      setStudentInfo(updatedStudent)
      setIsEditing(false)
      setUpdateMessage('Profile updated successfully!')
    } catch (error) {
      setUpdateError('Error updating profile. Please try again.')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Prevent hydration mismatch by not rendering interactive elements until mounted
  if (!isMounted) {
    return (
      <header className="bg-cocinarte-navy shadow-xl w-full fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <Image 
                  src="/cocinarte/cocinarteLogo.png" 
                  alt="Cocinarte Logo" 
                  width={200} 
                  height={64} 
                  className="object-contain h-12 sm:h-14 lg:h-20 max-w-[100px] sm:max-w-[120px] lg:max-w-[200px]" 
                />
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              <Link
                href="#calendar"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Calendar
              </Link>
              <Link
                href="#about"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                About
              </Link>
              <Link
                href="#classes"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Classes
              </Link>
              <Link
                href="#birthday-parties"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Birthday Parties
              </Link>
              <Link
                href="#private-events"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Private Events
              </Link>
              <Link
                href="#faq"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                FAQ
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Link href="https://www.instagram.com/corcinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Instagram className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Facebook className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
              </div>
              <Button
                size="lg"
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Link href="#calendar">Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button - Static for SSR */}
            <button
              className="lg:hidden p-2 rounded-xl bg-cocinarte-orange text-cocinarte-black hover:bg-cocinarte-yellow transition-colors duration-200"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-cocinarte-navy shadow-xl w-full fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/cocinarte/cocinarteLogo.png" 
                alt="Cocinarte Logo" 
                width={200} 
                height={64} 
                className="object-contain h-12 sm:h-14 lg:h-20 max-w-[100px] sm:max-w-[120px] lg:max-w-[200px]" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            <Link
              href="#calendar"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Calendar
            </Link>
            <Link
              href="#about"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              About
            </Link>
            <Link
              href="#classes"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Classes
            </Link>
            <Link
              href="#birthday-parties"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Birthday Parties
            </Link>
            <Link
              href="#private-events"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Private Events
            </Link>
            <Link
              href="#faq"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              FAQ
            </Link>
          </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Link href="https://www.instagram.com/corcinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Instagram className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Facebook className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
              </div>
              
              {/* My Account Button */}
              <Button
                size="lg"
                onClick={handleAccountClick}
                className="bg-white hover:bg-cocinarte-blue/90 text-cocinarte-navy rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                <User className="h-4 w-4 mr-2" />
                {user ? 'My Account' : 'Sign In'}
              </Button>
              
              <Button
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                Book Now
              </Button>
            </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-cocinarte-orange text-cocinarte-black hover:bg-cocinarte-yellow transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-cocinarte-navy shadow-2xl border-t border-cocinarte-blue`}>
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="#calendar"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link
              href="#about"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#classes"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Classes
            </Link>
            <Link
              href="#birthday-parties"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Birthday Parties
            </Link>
            <Link
              href="#private-events"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Private Events
            </Link>
            <Link
              href="#faq"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex space-x-2">
              <Button className="flex-1 bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200">
                <Link href="https://www.instagram.com/corcinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Link>
              </Button>
              <Button className="flex-1 bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200">
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
      <div className="fixed top-1/2 -right-[50px] z-50 transform -translate-y-1/2 w-fit transform -rotate-90">
      {/* Main CTA Button - Rotated 90 degrees */}
      <div className="relative">
        <Button
          size="lg"
          onClick={() => setIsBookingOpen(true)}
          className="bg-cocinarte-red hover:bg-golden text-white shadow-lg hover:shadow-xl transition-all duration-200 font-questa px-[60px] py-4 text-sm font-semibold  origin-center whitespace-nowrap rounded-none"
          style={{ 
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <span className="transform -rotate-90">Book Now</span>
        </Button>
      </div>
    </div>
    
    {/* Booking Popup */}
    <CocinarteBookingPopup 
      isOpen={isBookingOpen} 
      onClose={() => setIsBookingOpen(false)} 
    />
    
    {/* Account Popup */}
    <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-cocinarte-navy text-white p-6 rounded-t-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User className="h-8 w-8" />
              </div>
              My Account
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              View your account information and manage your profile
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">

        {loadingStudent ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Loading account information...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Account Information */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-600">Email Address</span>
                        <p className="font-semibold text-slate-800">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-600">Account Status</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
      
                    
                    {studentInfo && (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-cocinarte-red" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-600">Parent Name</span>
                          <p className="font-semibold text-slate-800">{studentInfo.parent_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Student Information */}
            <div className="space-y-6">
              {studentInfo ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                            <ChefHat className="h-5 w-5 text-cocinarte-red" />
                          </div>
                          Student Information
                        </CardTitle>
                        
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditClick}
                          className="text-cocinarte-red border-cocinarte-red hover:bg-cocinarte-red hover:text-white"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-parent-name" className="text-sm font-semibold text-slate-700">Parent Name *</Label>
                            <Input
                              id="edit-parent-name"
                              value={editForm.parent_name}
                              onChange={(e) => setEditForm({...editForm, parent_name: e.target.value})}
                              placeholder="Enter parent's full name"
                              className="h-12"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                            <Input
                              id="edit-phone"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              placeholder="Enter phone number"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-address" className="text-sm font-semibold text-slate-700">Address</Label>
                            <Input
                              id="edit-address"
                              value={editForm.address}
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              placeholder="Enter full address"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Child Name</Label>
                            <Input
                              value={studentInfo.child_name}
                              disabled
                              className="bg-slate-50 h-12"
                            />
                            <p className="text-xs text-slate-500">Child name cannot be changed</p>
                          </div>
                        </div>
                        
                        {updateError && (
                          <Alert variant="destructive">
                            <AlertDescription>{updateError}</AlertDescription>
                          </Alert>
                        )}

                        {updateMessage && (
                          <Alert>
                            <AlertDescription>{updateMessage}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex-1 h-12"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateStudent}
                            disabled={updateLoading || !editForm.parent_name.trim()}
                            className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
                          >
                            {updateLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-cocinarte-orange/10 p-2 rounded-lg">
                            <ChefHat className="h-4 w-4 text-cocinarte-orange" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Child Name</span>
                            <p className="font-semibold text-slate-800">{studentInfo.child_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Phone</span>
                            <p className="font-semibold text-slate-800">{studentInfo.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Address</span>
                            <p className="font-semibold text-slate-800">{studentInfo.address || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">No Student Profile</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      You haven't created a student profile yet. Book a class to get started!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Booked Classes Section */}
        <div className="mt-8">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-cocinarte-navy" />
                </div>
                Booked Classes
              </CardTitle>
              <CardDescription className="text-slate-600">
                Your upcoming cooking class bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cocinarte-navy"></div>
                  <span className="ml-2 text-slate-600">Loading bookings...</span>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                        <ChefHat className="h-5 w-5 text-cocinarte-red" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800">{booking.class.title}</h4>
                            <p className="text-sm text-slate-600">
                              {new Date(booking.class.date).toLocaleDateString()} at {booking.class.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-cocinarte-navy">${booking.payment_amount}</p>
                            <Badge 
                              variant={booking.booking_status === 'confirmed' ? 'default' : 'secondary'}
                              className={
                                booking.booking_status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-slate-100 text-slate-600'
                              }
                            >
                              {booking.booking_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          Duration: {booking.class.classDuration} minutes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Bookings Yet</h3>
                  <p className="text-slate-600">
                    You haven't booked any cooking classes yet. Book your first class to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Full Width */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setIsAccountOpen(false)}
            size="lg"
            className="px-8"
          >
            Close
          </Button>
          <Button 
            onClick={handleSignOut}
            size="lg"
            className="bg-cocinarte-red hover:bg-cocinarte-red/90 text-white px-8"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Auth Popup */}
    <CocinarteAuthPopup 
      isOpen={isAuthOpen} 
      onClose={() => setIsAuthOpen(false)} 
    />
    </header>
  )
}
