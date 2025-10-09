import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, Edit, Trash2, Calendar, User, CreditCard } from 'lucide-react'
import PaymentsClient from '@/components/dashboard/payments-client'

export default async function PaymentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch bookings with related class and student info
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      payment_amount,
      payment_status,
      booking_date,
      class:clases(title),
      student:students(parent_name, child_name)
    `)
    .order('booking_date', { ascending: false })
    .limit(50)

  if (error) {
    // If fetching fails, render dashboard with zeros and no recent payments
    console.error('Error loading payments:', error.message)
  }

  const safeBookings = bookings || []

  // Compute stats
  const currency = (value: number) => `$${value.toFixed(2)}`
  const isSameMonth = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()
  }

  const totalRevenue = safeBookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + (b.payment_amount || 0), 0)

  const pendingAmount = safeBookings
    .filter(b => b.payment_status === 'pending')
    .reduce((sum, b) => sum + (b.payment_amount || 0), 0)

  const paidThisMonth = safeBookings
    .filter(b => b.payment_status === 'completed' && isSameMonth(b.booking_date))
    .reduce((sum, b) => sum + (b.payment_amount || 0), 0)

  const completed = safeBookings.filter(b => b.payment_status === 'completed')
  const averageFee = completed.length > 0
    ? completed.reduce((sum, b) => sum + (b.payment_amount || 0), 0) / completed.length
    : 0

  // Recent payments (latest 3 from safeBookings)
  const recent = safeBookings.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Cocinarte Payments</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Track Cocinarte cooking class payments and manage billing.
            </p>
          </div>
          <Button className="w-full sm:w-auto flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Record Cooking Class Payment</span>
            <span className="sm:hidden">Record Payment</span>
          </Button>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{currency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Cocinarte revenue this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{currency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Paid This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{currency(paidThisMonth)}</div>
              <p className="text-xs text-muted-foreground">
                Completed this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Fee</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{currency(averageFee)}</div>
              <p className="text-xs text-muted-foreground">
                Per cooking class
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments (interactive) */}
        <PaymentsClient initialBookings={safeBookings} />

        {/* Quick Actions handled in client component */}
      </div>
    </DashboardLayout>
  )
}
