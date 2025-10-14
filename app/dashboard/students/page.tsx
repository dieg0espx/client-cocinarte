import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Edit, Trash2, Mail, Phone, Calendar, BookOpen } from 'lucide-react'
import { StudentsClient } from '@/components/dashboard/students-client'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function StudentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is an admin
  const isAdmin = await isAdminUser(supabase, user.email)
  
  if (!isAdmin) {
    redirect('/?error=admin_only')
  }

  const { data: students, error } = await supabase
    .from('students')
    .select('id, parent_name, child_name, email, phone, address, created_at')
    .order('created_at', { ascending: false })

  const safeStudents = students ?? []
  const totalStudents = safeStudents.length
  const now = new Date()
  const newThisMonth = safeStudents.filter((s: any) => {
    const created = s.created_at ? new Date(s.created_at as string) : null
    return (
      created &&
      created.getUTCFullYear() === now.getUTCFullYear() &&
      created.getUTCMonth() === now.getUTCMonth()
    )
  }).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cocinarte Students</h1>
            <p className="text-muted-foreground">
              Manage Cocinarte cooking class students and enrollment.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Cooking Student
          </Button>
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>
              Manage student information and enrollment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentsClient initialStudents={safeStudents} />
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
