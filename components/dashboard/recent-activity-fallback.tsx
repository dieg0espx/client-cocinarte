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

export function RecentActivityFallback({ userId }: RecentActivityProps) {
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
      
      // Fetch all recent activities from database
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          payment_status,
          payment_amount,
          created_at,
          updated_at,
          class:clases(
            title,
            date
          ),
          student:students(
            child_name,
            parent_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (bookingsError) {
        console.error('Database error:', bookingsError)
        setError('Unable to load recent activity. Please check your database connection.')
        return
      }

      const activityItems: ActivityItem[] = []

      // Process bookings into activities
      bookings?.forEach(booking => {
        const studentName = Array.isArray(booking.student) 
          ? (booking.student[0] as any)?.child_name 
          : (booking.student as any)?.child_name || 'Student'
        
        const className = Array.isArray(booking.class) 
          ? (booking.class[0] as any)?.title 
          : (booking.class as any)?.title || 'Cooking Class'

        // Add booking activity
        activityItems.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: 'New booking created',
          description: `${studentName} booked ${className}`,
          timestamp: booking.created_at,
          icon: <Calendar className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-600'
        })

        // Add payment activity for completed payments
        if (booking.payment_status === 'completed') {
          activityItems.push({
            id: `payment-${booking.id}`,
            type: 'payment',
            title: 'Payment completed',
            description: `${studentName} paid $${booking.payment_amount} for ${className}`,
            timestamp: booking.updated_at,
            icon: <DollarSign className="h-4 w-4" />,
            color: 'bg-green-100 text-green-600'
          })
        }
      })

      // Sort by timestamp and take the most recent 6
      const sortedActivities = activityItems
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6)

      setActivities(sortedActivities)
    } catch (err) {
      console.error('Recent activity error:', err)
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
            <p className="mb-4">{error}</p>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Run the database migration script</li>
                <li>Ensure your Supabase connection is working</li>
                <li>Check that the required tables exist</li>
              </ol>
            </div>
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
