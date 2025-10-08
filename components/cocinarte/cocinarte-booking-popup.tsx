"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Users, DollarSign, ChefHat, Eye, EyeOff, Mail, Lock, LogIn, UserPlus, ArrowLeft, CreditCard, CheckCircle, User } from "lucide-react"
import { Clase } from "@/lib/types/clases"
import { ClasesClientService } from "@/lib/supabase/clases-client"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { useAuth } from "@/contexts/auth-context"

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  selectedClass?: Clase
}

export default function CocinarteBookingPopup({ isOpen, onClose, selectedClass }: BookingPopupProps) {
  const [classes, setClasses] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(selectedClass?.id || null)
  
  // Authentication states
  const [authStep, setAuthStep] = useState<'class-selection' | 'login' | 'signup' | 'payment' | 'confirmation'>('class-selection')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  
  // Payment states
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  
  const { user, signIn, signUp } = useAuth()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const clasesService = new ClasesClientService()
        const upcomingClasses = await clasesService.getUpcomingClases()
        setClasses(upcomingClasses)
      } catch (error) {
        console.error('Error fetching classes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchClasses()
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
  }

  const handleBookClass = () => {
    if (selectedClassId) {
      if (user) {
        // User is logged in, proceed to payment
        setAuthStep('payment')
      } else {
        // User not logged in, show auth flow
        setAuthStep('login')
      }
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthMessage('Successfully signed in!')
      // After successful login, proceed to payment
      setTimeout(() => {
        setAuthStep('payment')
      }, 1000)
    }
    
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    // Validate password confirmation
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      setAuthLoading(false)
      return
    }

    // Validate required fields
    if (!parentName || !childName || !email || !phone || !address) {
      setAuthError('Please fill in all required fields')
      setAuthLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      
      if (error) {
        setAuthError(error.message)
            } else {
              // Create student record
              const studentsService = new StudentsClientService()
              const newStudent = await studentsService.createStudent({
                parent_name: parentName,
                child_name: childName,
                email: email,
                phone: phone,
                address: address
              })

              setAuthMessage('Account and student profile created successfully!')
              
              // After successful signup, create booking and proceed
              setTimeout(async () => {
                try {
                  const selectedClass = classes.find(c => c.id === selectedClassId)
                  if (selectedClass && user) {
                    // Create booking record
                    const bookingsService = new BookingsClientService()
                    await bookingsService.createBooking({
                      user_id: user.id!,
                      class_id: selectedClass.id,
                      student_id: newStudent.id,
                      payment_amount: selectedClass.price,
                      payment_method: 'credit_card',
                      notes: `Booking for ${selectedClass.title} on ${formatDate(selectedClass.date)} at ${formatTime(selectedClass.time)}`
                    })

                    // Update enrolled count in the class
                    const clasesService = new ClasesClientService()
                    await clasesService.updateClassEnrollment(selectedClass.id, 1)
                    
                    // Show confirmation
                    setAuthStep('confirmation')
                  }
                } catch (error) {
                  console.error('Booking creation error:', error)
                  setAuthError('Account created but booking failed. Please try booking again.')
                }
              }, 2000)
            }
    } catch (error) {
      setAuthError('Error creating student profile. Please try again.')
    }
    
    setAuthLoading(false)
  }

  const resetAuthForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setParentName('')
    setChildName('')
    setPhone('')
    setAddress('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAuthError('')
    setAuthMessage('')
  }

  const goBackToClassSelection = () => {
    setAuthStep('class-selection')
    resetAuthForm()
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentLoading(true)
    setPaymentError('')

    // Validate payment form
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      setPaymentError('Please fill in all payment fields')
      setPaymentLoading(false)
      return
    }

    // Validate required data
    if (!user || !selectedClassData) {
      setPaymentError('Missing user or class information')
      setPaymentLoading(false)
      return
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      // Get student information
      const studentsService = new StudentsClientService()
      const studentInfo = await studentsService.getStudentByEmail(user.email!)
      
      if (!studentInfo) {
        setPaymentError('Student profile not found. Please contact support.')
        setPaymentLoading(false)
        return
      }

      // Create booking record
      const bookingsService = new BookingsClientService()
      await bookingsService.createBooking({
        user_id: user.id!,
        class_id: selectedClassData.id,
        student_id: studentInfo.id,
        payment_amount: selectedClassData.price,
        payment_method: 'credit_card',
        notes: `Booking for ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}`
      })

      // Update enrolled count in the class
      const clasesService = new ClasesClientService()
      await clasesService.updateClassEnrollment(selectedClassData.id, 1)
      
      // Payment successful, show confirmation
      setAuthStep('confirmation')
    } catch (error) {
      console.error('Payment/booking error:', error)
      setPaymentError('Payment failed. Please try again.')
    }
    
    setPaymentLoading(false)
  }

  const handleBackToPayment = () => {
    setAuthStep('payment')
  }

  const handleCompleteBooking = () => {
    const selectedClass = classes.find(c => c.id === selectedClassId)
    if (selectedClass) {
      alert(`Booking confirmed! ${selectedClass.title} for ${formatDate(selectedClass.date)} at ${formatTime(selectedClass.time)}`)
      onClose()
    }
  }

  const selectedClassData = classes.find(c => c.id === selectedClassId)

  const renderClassSelection = () => (
    <div className="space-y-6">
      {/* Available Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((clase) => (
          <Card 
            key={clase.id} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
              selectedClassId === clase.id 
                ? 'border-cocinarte-navy shadow-lg bg-cocinarte-navy/5' 
                : 'border-slate-200 hover:border-cocinarte-navy/50 hover:shadow-md'
            }`}
            onClick={() => handleClassSelect(clase.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 mb-2">
                    {clase.title}
                  </CardTitle>
                  {clase.description && (
                    <CardDescription className="text-slate-600 line-clamp-2 text-sm">
                      {clase.description}
                    </CardDescription>
                  )}
                </div>
                <Badge 
                  variant={selectedClassId === clase.id ? "default" : "secondary"}
                  className={`shrink-0 ${
                    selectedClassId === clase.id 
                      ? 'bg-cocinarte-navy text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedClassId === clase.id ? 'Selected' : 'Select'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-cocinarte-orange/20 p-1.5 rounded-lg">
                    <Calendar className="h-4 w-4 text-cocinarte-orange" />
                  </div>
                  <span className="font-medium">{formatDate(clase.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-cocinarte-orange/10 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-cocinarte-orange" />
                  </div>
                  <span className="font-medium">{formatTime(clase.time)}</span>
                </div>
              </div>

              {/* Duration and Capacity */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{clase.classDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <Users className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{clase.minStudents}-{clase.maxStudents} students</span>
                </div>
              </div>

              {/* Price and Enrollment */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-500">${clase.price}</span>
                </div>
                <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                  {clase.enrolled || 0} enrolled
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Classes Message */}
      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            No classes available
          </h3>
          <p className="text-slate-600">
            Check back soon for new cooking classes!
          </p>
        </div>
      )}

      {/* Selected Class Summary */}
      {selectedClassData && (
        <div className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-cocinarte-navy" />
            </div>
            <h3 className="text-xl font-bold text-cocinarte-navy">Ready to Book!</h3>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Class</span>
                  <p className="text-lg font-semibold text-slate-800">{selectedClassData.title}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Date & Time</span>
                  <p className="text-slate-800 font-medium">{formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Duration</span>
                  <p className="text-slate-800 font-medium">{selectedClassData.classDuration} minutes</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Price</span>
                  <p className="text-2xl font-bold text-cocinarte-navy">${selectedClassData.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <Button 
          variant="outline" 
          onClick={onClose}
          size="lg"
          className="px-8"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleBookClass}
          disabled={!selectedClassId}
          size="lg"
          className="bg-cocinarte-red hover:bg-cocinarte-red/90 text-white px-8"
        >
          Book This Class
        </Button>
      </div>
    </div>
  )

  const renderLoginForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToClassSelection}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classes
        </Button>
      </div>


      {/* Login Form */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">Sign In to Book</CardTitle>
          <CardDescription className="text-slate-600">Please sign in to complete your booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authMessage && (
              <Alert>
                <AlertDescription>{authMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goBackToClassSelection}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={authLoading}
                className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setAuthStep('signup')}
                className="text-cocinarte-red hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSignupForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToClassSelection}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classes
        </Button>
      </div>

      {/* Selected Class Summary */}
      {/* {selectedClassData && (
        <div className="bg-cocinarte-red/5 border border-cocinarte-red/20 rounded-lg p-4">
          <h4 className="font-semibold text-cocinarte-red mb-2">Booking:</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Class:</strong> {selectedClassData.title}</p>
            <p><strong>Date:</strong> {formatDate(selectedClassData.date)}</p>
            <p><strong>Time:</strong> {formatTime(selectedClassData.time)}</p>
            <p><strong>Price:</strong> ${selectedClassData.price}</p>
          </div>
        </div>
      )} */}

      {/* Signup Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-600">Sign up to book your cooking class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Parent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent-name" className="text-sm font-semibold text-slate-700">Parent Name *</Label>
                <Input
                  id="parent-name"
                  type="text"
                  placeholder="Enter parent's full name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-name" className="text-sm font-semibold text-slate-700">Child Name *</Label>
                <Input
                  id="child-name"
                  type="text"
                  placeholder="Enter child's full name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authMessage && (
              <Alert>
                <AlertDescription>{authMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goBackToClassSelection}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={authLoading}
                className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => setAuthStep('login')}
                className="text-cocinarte-red hover:underline font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPaymentForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Column - Class Details */}
      <div className="flex flex-col h-full">
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                <ChefHat className="h-5 w-5 text-cocinarte-navy" />
              </div>
              Class Details
            </CardTitle>
            <CardDescription className="text-slate-600">
              Review your selected cooking class
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            {selectedClassData && (
              <>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-600">Class Name</span>
                    <p className="text-lg font-bold text-slate-800 mt-1">{selectedClassData.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-cocinarte-orange/20 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-cocinarte-orange" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Date</span>
                        <p className="font-semibold text-slate-800">{formatDate(selectedClassData.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-cocinarte-orange/20 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-cocinarte-orange" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Time</span>
                        <p className="font-semibold text-slate-800">{formatTime(selectedClassData.time)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="bg-cocinarte-navy/20 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-cocinarte-navy" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">Duration</span>
                        <p className="font-semibold text-slate-800">{selectedClassData.classDuration} minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-4 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                    <span className="text-3xl font-bold text-cocinarte-navy">${selectedClassData.price}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Payment Form */}
      <div className="flex flex-col h-full">
        <Card className="border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-cocinarte-navy" />
              </div>
              Payment Information
            </CardTitle>
            <CardDescription className="text-slate-600">
              Enter your payment details to complete the booking
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <form onSubmit={handlePayment} className="space-y-6 flex flex-col flex-1">
              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="card-name" className="text-sm font-semibold text-slate-700">Cardholder Name *</Label>
                  <Input
                    id="card-name"
                    type="text"
                    placeholder="Enter cardholder name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card-number" className="text-sm font-semibold text-slate-700">Card Number *</Label>
                  <Input
                    id="card-number"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\s/g, '')
                      if (digitsOnly.length <= 16) {
                        const value = digitsOnly.replace(/(.{4})/g, '$1 ').trim()
                        setCardNumber(value)
                      }
                    }}
                    className="h-12"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry-date" className="text-sm font-semibold text-slate-700">Expiry Date *</Label>
                    <Input
                      id="expiry-date"
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 4) {
                          if (value.length >= 2) {
                            setExpiryDate(value.substring(0, 2) + '/' + value.substring(2, 4))
                          } else {
                            setExpiryDate(value)
                          }
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm font-semibold text-slate-700">CVV *</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        if (value.length <= 3) {
                          setCvv(value)
                        }
                      }}
                      className="h-12"
                      required
                    />
                  </div>
                </div>

                {paymentError && (
                  <Alert variant="destructive">
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuthStep('class-selection')}
                  className="flex-1 h-12"
                >
                  Back to Classes
                </Button>
                <Button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 h-12 bg-cocinarte-navy hover:bg-cocinarte-navy/90 text-white"
                >
                  {paymentLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${selectedClassData?.price || 0}`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderConfirmation = () => (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Booking Confirmed!</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Your cooking class has been successfully booked. You will receive a confirmation email shortly.
        </p>
      </div>

      {/* User Information */}
      {user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-blue-700">Email Address</span>
                  <p className="text-blue-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">Account Status</span>
                  <p className="text-blue-800 font-medium">Active</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-blue-700">Member Since</span>
                  <p className="text-blue-800 font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">Booking Date</span>
                  <p className="text-blue-800 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      {selectedClassData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <ChefHat className="h-5 w-5 text-green-600" />
              </div>
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-green-700">Class</span>
                  <p className="text-green-800 font-medium">{selectedClassData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-green-700">Date & Time</span>
                  <p className="text-green-800 font-medium">{formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-green-700">Duration</span>
                  <p className="text-green-800 font-medium">{selectedClassData.classDuration} minutes</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-green-700">Amount Paid</span>
                  <p className="text-2xl font-bold text-green-800">${selectedClassData.price}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-cocinarte-navy text-white p-6 rounded-t-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ChefHat className="h-8 w-8" />
              </div>
              Book Your Cooking Class
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              Choose from our available cooking classes and reserve your spot today!
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Loading classes...</span>
          </div>
        ) : authStep === 'class-selection' ? (
          renderClassSelection()
        ) : authStep === 'login' ? (
          renderLoginForm()
        ) : authStep === 'signup' ? (
          renderSignupForm()
        ) : authStep === 'payment' ? (
          renderPaymentForm()
        ) : authStep === 'confirmation' ? (
          renderConfirmation()
        ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}