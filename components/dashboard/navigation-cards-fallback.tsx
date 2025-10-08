'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, DollarSign, Users, CalendarDays, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavigationCardsProps {
  userId: string
}

interface NavigationStats {
  activeClasses: number
  enrolledStudents: number
  totalRevenue: number
  totalBookings: number
}

export function NavigationCardsFallback({ userId }: NavigationCardsProps) {
  const [stats, setStats] = useState<NavigationStats>({
    activeClasses: 0,
    enrolledStudents: 0,
    totalRevenue: 0,
    totalBookings: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNavigationStats()
  }, [userId])

  const fetchNavigationStats = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Try to fetch data without user_id filter first (fallback approach)
      const { data: classes, error: classesError } = await supabase
        .from('clases')
        .select('id', { count: 'exact' })

      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('payment_amount')

      if (classesError || studentsError || bookingsError) {
        console.error('Database errors:', { classesError, studentsError, bookingsError })
        setError('Database connection issue. Please check your database setup.')
        return
      }

      const totalRevenue = bookings?.reduce((sum, booking) => 
        sum + (booking.payment_amount || 0), 0
      ) || 0

      setStats({
        activeClasses: classes?.length || 0,
        enrolledStudents: students?.length || 0,
        totalRevenue,
        totalBookings: bookings?.length || 0
      })
    } catch (err) {
      console.error('Navigation stats error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse mt-4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Run the database migration script</li>
                <li>Ensure your Supabase connection is working</li>
                <li>Check that the required tables exist</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle>Classes</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Manage your Cocinarte cooking classes and workshops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stats.activeClasses} active cooking classes</p>
            <p className="text-sm text-muted-foreground">Students enrolled</p>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/dashboard/classes">Manage Classes</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle>Payments</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Track Cocinarte payments and cooking class fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">${stats.totalRevenue.toFixed(2)} total revenue</p>
            <p className="text-sm text-muted-foreground">Payment tracking</p>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/dashboard/payments">View Payments</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Students</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            Manage Cocinarte student information and enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stats.enrolledStudents} cooking students</p>
            <p className="text-sm text-muted-foreground">Student management</p>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/dashboard/students">Manage Students</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-orange-600" />
              <CardTitle>Bookings</CardTitle>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardDescription>
            View and manage cooking class bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stats.totalBookings} total bookings</p>
            <p className="text-sm text-muted-foreground">Booking management</p>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/dashboard/bookings">Manage Bookings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
