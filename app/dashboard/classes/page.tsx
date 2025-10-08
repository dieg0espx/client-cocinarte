import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ClasesService } from '@/lib/supabase/clases'
import { Clase } from '@/lib/types/clases'
import { ClassesClient } from '@/components/dashboard/classes-client'

export default async function ClassesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch classes from the database
  const clasesService = new ClasesService()
  let clases: Clase[] = []
  
  try {
    clases = await clasesService.getAllClases()
  } catch (error) {
    console.error('Error fetching classes:', error)
    // If table doesn't exist yet, show empty state
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ClassesClient initialClases={clases} />
      </div>
    </DashboardLayout>
  )
}
