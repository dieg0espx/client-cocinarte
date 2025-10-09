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

export function DashboardStatsFallback({ userId }: DashboardStatsProps) {
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
      
      // Try to fetch data without user_id filter first (fallback approach)
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })

      const { data: classes, error: classesError } = await supabase
        .from('clases')
        .select('id', { count: 'exact' })

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('payment_amount')

      if (studentsError || classesError || bookingsError) {
        console.error('Database errors:', { studentsError, classesError, bookingsError })
        // If there are errors, show a helpful message
        setError('Database connection issue. Please check your database setup.')
        return
      }

      const totalRevenue = bookings?.reduce((sum, booking) => 
        sum + (booking.payment_amount || 0), 0
      ) || 0

      setStats({
        students: students?.length || 0,
        classes: classes?.length || 0,
        bookings: bookings?.length || 0,
        revenue: totalRevenue,
        recipeMastery: 87
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
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 sm:h-8 w-8 sm:w-12 bg-gray-200 rounded animate-pulse mb-1 sm:mb-2"></div>
              <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="text-red-600 text-sm sm:text-base">Database Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-red-600 mb-3 sm:mb-4">{error}</p>
            <div className="text-xs sm:text-sm text-muted-foreground">
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
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Cocinarte Students</CardTitle>
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.students}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Active cooking students
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Cooking Classes</CardTitle>
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.classes}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Active cooking sessions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Bookings</CardTitle>
          <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.bookings}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Cooking class bookings
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Cocinarte income
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Recipe Mastery</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">{stats.recipeMastery}%</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Recipe completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
