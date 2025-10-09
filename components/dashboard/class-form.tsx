'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clase, CreateClaseData } from '@/lib/types/clases'
import { ClasesClientService } from '@/lib/supabase/clases-client'

interface ClassFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingClass?: Clase | null
}

export function ClassForm({ isOpen, onClose, onSuccess, editingClass }: ClassFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form data based on editing class
  const getInitialFormData = (): CreateClaseData => {
    if (editingClass) {
      return {
        title: editingClass.title,
        description: editingClass.description || '',
        date: editingClass.date,
        time: editingClass.time,
        minStudents: editingClass.minStudents,
        maxStudents: editingClass.maxStudents,
        enrolled: editingClass.enrolled || 0,
        price: editingClass.price,
        classDuration: editingClass.classDuration,
        class_type: editingClass.class_type,
      }
    }
    return {
      title: '',
      description: '',
      date: '',
      time: '',
      minStudents: 1,
      maxStudents: 8,
      price: 0,
      classDuration: 60,
      class_type: undefined,
    }
  }

  const [formData, setFormData] = useState<CreateClaseData>(getInitialFormData())

  // Reset form when editing class changes
  useEffect(() => {
    const initialData = getInitialFormData()
    console.log('Setting form data:', initialData)
    setFormData(initialData)
  }, [editingClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clasesService = new ClasesClientService()
      
      if (editingClass) {
        await clasesService.updateClase({
          id: editingClass.id,
          ...formData
        })
      } else {
        // For new classes, don't include enrolled field (defaults to 0 in database)
        const { enrolled, ...createData } = formData
        await clasesService.createClase(createData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving class:', error)
      alert('Error saving class. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateClaseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? 'Edit Cooking Class' : 'Create New Cooking Class'}
          </DialogTitle>
          <DialogDescription>
            {editingClass 
              ? 'Update the details of your cooking class.' 
              : 'Add a new cooking class to your schedule.'
            }
          </DialogDescription>
        </DialogHeader>
        <form key={editingClass?.id || 'new'} onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Kids Cooking Basics"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="class_type">Class Type</Label>
              <Select
                value={formData.class_type || ''}
                onValueChange={(value) => handleChange('class_type', value as 'Mini Chefcitos' | 'Chefcitos Together' | 'Cocina Creativa')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mini Chefcitos">Mini Chefcitos</SelectItem>
                  <SelectItem value="Chefcitos Together">Chefcitos Together</SelectItem>
                  <SelectItem value="Cocina Creativa">Cocina Creativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={`grid gap-4 ${editingClass ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="grid gap-2">
                <Label htmlFor="minStudents">Min Students</Label>
                <Input
                  id="minStudents"
                  type="number"
                  min="1"
                  value={formData.minStudents || ''}
                  onChange={(e) => handleChange('minStudents', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents || ''}
                  onChange={(e) => handleChange('maxStudents', parseInt(e.target.value) || 8)}
                  required
                />
              </div>
              {/* Only show enrolled field when editing */}
              {editingClass && (
                <div className="grid gap-2">
                  <Label htmlFor="enrolled">Students Enrolled</Label>
                  <Input
                    id="enrolled"
                    type="number"
                    min="0"
                    max={formData.maxStudents}
                    value={formData.enrolled ?? 0}
                    onChange={(e) => {
                      const next = e.target.value === '' ? 0 : Number(e.target.value)
                      handleChange('enrolled', isNaN(next) ? 0 : next)
                    }}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classDuration">Duration (minutes)</Label>
                <Input
                  id="classDuration"
                  type="number"
                  min="15"
                  value={formData.classDuration || ''}
                  onChange={(e) => handleChange('classDuration', parseInt(e.target.value) || 60)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (editingClass ? 'Update Class' : 'Create Class')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
