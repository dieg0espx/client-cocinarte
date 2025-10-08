'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavigationStatsProps {
  userId: string
}

interface NavigationStats {
  activeClasses: number
  enrolledStudents: number
  totalRevenue: number
  totalBookings: number
}

export function useNavigationStats(userId: string) {
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
      
      // Fetch active classes count
      const { data: classes, error: classesError } = await supabase
        .from('clases')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Fetch enrolled students count
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Fetch total revenue and bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('payment_amount')
        .eq('user_id', userId)

      // Check for specific errors and provide helpful messages
      if (classesError) {
        console.error('Classes error:', classesError)
        if (classesError.message.includes('column') && classesError.message.includes('user_id')) {
          throw new Error('Database schema needs to be updated. Please run the user association migration.')
        }
        throw new Error(`Classes error: ${classesError.message}`)
      }

      if (studentsError) {
        console.error('Students error:', studentsError)
        if (studentsError.message.includes('column') && studentsError.message.includes('user_id')) {
          throw new Error('Database schema needs to be updated. Please run the user association migration.')
        }
        throw new Error(`Students error: ${studentsError.message}`)
      }

      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        throw new Error(`Bookings error: ${bookingsError.message}`)
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

  return { stats, loading, error }
}
