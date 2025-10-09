'use client'

import { useState, useEffect } from 'react'
import { BookingWithDetails } from '@/lib/types/bookings'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface EditBookingPopupProps {
  booking: BookingWithDetails | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditBookingPopup({ booking, isOpen, onClose, onSave }: EditBookingPopupProps) {
  const [formData, setFormData] = useState({
    booking_status: '',
    payment_status: '',
    payment_amount: '',
    payment_method: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (booking) {
      setFormData({
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        payment_amount: booking.payment_amount.toString(),
        payment_method: booking.payment_method,
        notes: booking.notes || ''
      })
    }
  }, [booking])

  const handleSave = async () => {
    if (!booking) return

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: formData.booking_status,
          payment_status: formData.payment_status,
          payment_amount: parseFloat(formData.payment_amount),
          payment_method: formData.payment_method,
          notes: formData.notes
        })
        .eq('id', booking.id)

      if (error) {
        throw new Error(`Error updating booking: ${error.message}`)
      }

      toast({
        title: "Booking Updated",
        description: "The booking has been successfully updated.",
      })

      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      booking_status: booking?.booking_status || '',
      payment_status: booking?.payment_status || '',
      payment_amount: booking?.payment_amount.toString() || '',
      payment_method: booking?.payment_method || '',
      notes: booking?.notes || ''
    })
    setError(null)
    onClose()
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update the booking information for {booking.student?.child_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4 sm:space-y-6">
          {/* Class Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Class Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{booking.class?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.class?.date} at {booking.class?.time}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Student Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{booking.student?.child_name}</p>
                <p className="text-sm text-muted-foreground">
                  Parent: {booking.student?.parent_name}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_status">Booking Status</Label>
              <Select
                value={formData.booking_status}
                onValueChange={(value) => setFormData({ ...formData, booking_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Payment Amount</Label>
              <Input
                id="payment_amount"
                type="number"
                step="0.01"
                value={formData.payment_amount}
                onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
