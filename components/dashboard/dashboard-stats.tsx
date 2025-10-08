'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, BookOpen, DollarSign, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  userId: string
}

interface Stats {
  students: number
  classes: number
  bookings: number
  revenue: number
  recipeMastery: number
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    students: 0,
    classes: 0,
    bookings: 0,
    revenue: 0,
    recipeMastery: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch students count - handle case where user_id column might not exist
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Fetch classes count - handle case where user_id column might not exist
      const { data: classes, error: classesError } = await supabase
        .from('clases')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Fetch bookings count and revenue
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('payment_amount')
        .eq('user_id', userId)

      // Check for specific errors and provide helpful messages
      if (studentsError) {
        console.error('Students error:', studentsError)
        if (studentsError.message.includes('column') && studentsError.message.includes('user_id')) {
          throw new Error('Database schema needs to be updated. Please run the user association migration.')
        }
        throw new Error(`Students error: ${studentsError.message}`)
      }

      if (classesError) {
        console.error('Classes error:', classesError)
        if (classesError.message.includes('column') && classesError.message.includes('user_id')) {
          throw new Error('Database schema needs to be updated. Please run the user association migration.')
        }
        throw new Error(`Classes error: ${classesError.message}`)
      }

      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        throw new Error(`Bookings error: ${bookingsError.message}`)
      }

      const totalRevenue = bookings?.reduce((sum, booking) => 
        sum + (booking.payment_amount || 0), 0
      ) || 0

      setStats({
        students: students?.length || 0,
        classes: classes?.length || 0,
        bookings: bookings?.length || 0,
        revenue: totalRevenue,
        recipeMastery: 87 // This could be calculated based on actual data
      })
    } catch (err) {
      console.error('Dashboard stats error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cocinarte Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.students}</div>
          <p className="text-xs text-muted-foreground">
            Active cooking students
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cooking Classes</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.classes}</div>
          <p className="text-xs text-muted-foreground">
            Active cooking sessions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bookings}</div>
          <p className="text-xs text-muted-foreground">
            Cooking class bookings
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Cocinarte income
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recipe Mastery</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recipeMastery}%</div>
          <p className="text-xs text-muted-foreground">
            Recipe completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
