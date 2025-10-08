import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { BookingsClient } from '@/components/dashboard/bookings-client'
import { DashboardStatsFallback } from '@/components/dashboard/dashboard-stats-fallback'
import { RecentActivityFallback } from '@/components/dashboard/recent-activity-fallback'
import { NavigationCardsFallback } from '@/components/dashboard/navigation-cards-fallback'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cocinarte Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's a summary of your Cocinarte cooking programs.
            </p>
          </div>
        </div>

        {/* Dynamic Summary Stats */}
        <DashboardStatsFallback userId={user.id} />

        {/* Quick Navigation */}
        <NavigationCardsFallback userId={user.id} />

        {/* Recent Bookings */}
        <BookingsClient userId={user.id} />

        {/* Recent Activity */}
        <RecentActivityFallback userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
