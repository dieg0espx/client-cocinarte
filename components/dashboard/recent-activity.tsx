'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, BookOpen, Clock, Calendar, ChefHat } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  userId: string
}

interface ActivityItem {
  id: string
  type: 'booking' | 'payment' | 'student' | 'class'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  color: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentActivity()
  }, [userId])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch recent bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          class:clases(
            title,
            date
          ),
          student:students(
            child_name,
            parent_name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch recent students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent classes
      const { data: classes, error: classesError } = await supabase
        .from('clases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Check for specific errors and provide helpful messages
      if (bookingsError) {
        console.error('Bookings error:', bookingsError)
        throw new Error(`Bookings error: ${bookingsError.message}`)
      }

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

      const activityItems: ActivityItem[] = []

      // Add booking activities
      bookings?.forEach(booking => {
        activityItems.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New Cocinarte booking',
          description: `${booking.student?.child_name || 'Student'} booked ${booking.class?.title || 'Cooking Class'}`,
          timestamp: booking.created_at,
          icon: <Calendar className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-600'
        })

        // Add payment activities for completed payments
        if (booking.payment_status === 'completed') {
          activityItems.push({
            id: `payment-${booking.id}`,
            type: 'payment',
            title: 'Cocinarte payment received',
            description: `${booking.student?.child_name || 'Student'} paid $${booking.payment_amount} for ${booking.class?.title || 'Cooking Class'}`,
            timestamp: booking.updated_at,
            icon: <DollarSign className="h-4 w-4" />,
            color: 'bg-green-100 text-green-600'
          })
        }
      })

      // Add student activities
      students?.forEach(student => {
        activityItems.push({
          id: `student-${student.id}`,
          type: 'student',
          title: 'New Cocinarte student enrolled',
          description: `${student.child_name} joined the cooking program`,
          timestamp: student.created_at,
          icon: <Users className="h-4 w-4" />,
          color: 'bg-purple-100 text-purple-600'
        })
      })

      // Add class activities
      classes?.forEach(clase => {
        activityItems.push({
          id: `class-${clase.id}`,
          type: 'class',
          title: 'New cooking class created',
          description: `${clase.title} - ${clase.classType || 'Cooking Workshop'}`,
          timestamp: clase.created_at,
          icon: <ChefHat className="h-4 w-4" />,
          color: 'bg-orange-100 text-orange-600'
        })
      })

      // Sort by timestamp and take the most recent 6
      const sortedActivities = activityItems
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6)

      setActivities(sortedActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading recent activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-9 w-9 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Error loading activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>No recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity to show.</p>
            <p className="text-sm">Activity will appear here as students enroll and bookings are made.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates from your Cocinarte cooking programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
