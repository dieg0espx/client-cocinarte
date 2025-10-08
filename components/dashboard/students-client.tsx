"use client"

import { useMemo, useState, type JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Users, Plus, Edit, Trash2, Mail, Phone, BookOpen, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Student = {
  id: string
  parent_name: string
  child_name: string
  email: string
  phone?: string | null
  address?: string | null
  created_at?: string
}

interface StudentsClientProps {
  initialStudents: Student[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps): JSX.Element {
  const supabase = createClient()
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [query, setQuery] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selected, setSelected] = useState<Student | null>(null)

  const [form, setForm] = useState<Omit<Student, 'id'>>({
    parent_name: '',
    child_name: '',
    email: '',
    phone: '',
    address: '',
  } as any)

  const filtered = useMemo(() => {
    if (!query) return students
    const q = query.toLowerCase()
    return students.filter((s) =>
      [s.child_name, s.parent_name, s.email, s.phone || '', s.address || '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [students, query])

  const openCreate = () => {
    setEditing(null)
    setForm({ parent_name: '', child_name: '', email: '', phone: '', address: '' } as any)
    setIsOpen(true)
  }

  const openEdit = (student: Student) => {
    setEditing(student)
    setForm({
      parent_name: student.parent_name,
      child_name: student.child_name,
      email: student.email,
      phone: student.phone || '',
      address: student.address || '',
    } as any)
    setIsOpen(true)
  }

  const openDetails = (student: Student) => {
    setSelected(student)
    setIsDetailsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('students')
          .update({
            parent_name: form.parent_name,
            child_name: form.child_name,
            email: form.email,
            phone: form.phone || null,
            address: form.address || null,
          })
          .eq('id', editing.id)
          .select()
          .single()
        if (error) throw error
        setStudents((prev) => prev.map((s) => (s.id === editing.id ? (data as Student) : s)))
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([
            {
              parent_name: form.parent_name,
              child_name: form.child_name,
              email: form.email,
              phone: form.phone || null,
              address: form.address || null,
            },
          ])
          .select()
          .single()
        if (error) throw error
        setStudents((prev) => [data as Student, ...prev])
      }
      setIsOpen(false)
    } catch (e) {
      console.error(e)
      alert('There was a problem saving the student.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
      setStudents((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      console.error(e)
      alert('Failed to delete student.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students..."
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/30 w-full"
            onClick={() => openDetails(s)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{s.child_name}</p>
                <div className="text-sm text-muted-foreground">Parent: {s.parent_name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  openEdit(s)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete student?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Child</div>
                <div className="font-medium">{selected.child_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Parent</div>
                <div className="font-medium">{selected.parent_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{selected.email}</div>
              </div>
              {selected.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{selected.phone}</div>
                </div>
              )}
              {selected.address && (
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{selected.address}</div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <a href={`tel:${selected.phone ?? ''}`} aria-label="Call">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`sms:${selected.phone ?? ''}`} aria-label="SMS">
                    <Phone className="h-4 w-4 mr-2" /> SMS
                  </a>
                </Button>
                <Button asChild>
                  <a href={`mailto:${selected.email}`} aria-label="Email">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </a>
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="child_name">Child name</Label>
              <Input id="child_name" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent_name">Parent name</Label>
              <Input id="parent_name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


