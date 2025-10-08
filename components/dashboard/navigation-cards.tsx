'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, DollarSign, Users, CalendarDays, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useNavigationStats } from './navigation-stats'

interface NavigationCardsProps {
  userId: string
}

export function NavigationCards({ userId }: NavigationCardsProps) {
  const { stats, loading, error } = useNavigationStats(userId)

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
            <CardTitle className="text-red-600">Error Loading Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
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
