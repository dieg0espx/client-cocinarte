"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, CreditCard, Calendar } from 'lucide-react'
import { BookingsClientService } from '@/lib/supabase/bookings-client'

interface BookingRow {
  id: string
  payment_amount: number
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  booking_date: string
  class?: { title?: string }[] | { title?: string } | null
  student?: { parent_name?: string; child_name?: string }[] | { parent_name?: string; child_name?: string } | null
}

function getClassTitle(cls: BookingRow['class']): string | undefined {
  if (!cls) return undefined
  return Array.isArray(cls) ? cls[0]?.title : cls.title
}

function getParentName(std: BookingRow['student']): string | undefined {
  if (!std) return undefined
  return Array.isArray(std) ? std[0]?.parent_name : std.parent_name
}

export default function PaymentsClient({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [globalBusy, setGlobalBusy] = useState(false)
  const currency = (v: number) => `$${(v || 0).toFixed(2)}`

  const refreshAfter = async () => {
    // Optimistic UI already applied; keep as-is for now.
  }

  const markAsPaid = async (id: string) => {
    setBusyId(id)
    try {
      const api = new BookingsClientService()
      await api.updateBooking({ id, payment_status: 'completed' })
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, payment_status: 'completed' } : b)))
      await refreshAfter()
    } finally {
      setBusyId(null)
    }
  }

  const handleQuickRecordPayment = async () => {
    // Mark the first pending booking as paid (simple quick action)
    setGlobalBusy(true)
    try {
      const pending = bookings.find(b => b.payment_status === 'pending')
      if (pending) {
        await markAsPaid(pending.id)
      }
    } finally {
      setGlobalBusy(false)
    }
  }

  return (
    <>
      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.slice(0, 10).map((b) => {
              const paid = b.payment_status === 'completed'
              const date = new Date(b.booking_date)
              const dateLabel = date.toLocaleDateString()
              const parentName = getParentName(b.student) || 'Unknown Customer'
              const classTitle = getClassTitle(b.class) || 'Cooking Class'
              return (
                <div key={b.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${paid ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{parentName}</p>
                      <p className="text-sm text-muted-foreground">{classTitle}</p>
                      <p className="text-sm text-muted-foreground">{dateLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-2">
                      <p className={`font-medium ${paid ? 'text-green-600' : 'text-orange-600'}`}>{currency(b.payment_amount || 0)}</p>
                      <Badge variant={paid ? 'secondary' : 'outline'}>{paid ? 'Paid' : b.payment_status === 'refunded' ? 'Refunded' : 'Pending'}</Badge>
                    </div>
                    {b.payment_status !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(b.id)} disabled={busyId === b.id}>
                        <CreditCard className="h-3 w-3 mr-1" /> Mark paid
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {bookings.length === 0 && (
              <div className="text-sm text-muted-foreground">No payments found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common payment management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleQuickRecordPayment} disabled={globalBusy}>
              <CreditCard className="h-6 w-6" />
              <span>Record Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
              <Calendar className="h-6 w-6" />
              <span>Payment Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" disabled>
              <DollarSign className="h-6 w-6" />
              <span>Generate Invoice</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}


