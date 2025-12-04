'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMember, updateMember } from '@/lib/actions/members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface MemberFormProps {
  trainers: Array<{ id: string; name: string }>
  initialData?: any
  isEdit?: boolean
}

export default function MemberForm({ trainers, initialData, isEdit = false }: MemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = isEdit
        ? await updateMember(initialData.id, formData)
        : await createMember(formData)

      if (result.success) {
        toast.success(
          isEdit ? 'Member updated successfully' : 'Member created successfully'
        )
        router.push(`/members/${result.data.id}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Failed to save member')
    } finally {
      setLoading(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover border-2"
            />
          )}
          <div className="flex-1">
            <Input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload a profile photo (optional)
            </p>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name}
            required
            disabled={loading}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={initialData?.phone}
            required
            disabled={loading}
            placeholder="+91 9876543210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email}
            disabled={loading}
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={
              initialData?.dateOfBirth
                ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
                : ''
            }
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select name="gender" defaultValue={initialData?.gender || ''} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Select name="bloodGroup" defaultValue={initialData?.bloodGroup || ''} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address}
            disabled={loading}
            placeholder="Street address"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={initialData?.city}
              disabled={loading}
              placeholder="City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              defaultValue={initialData?.state}
              disabled={loading}
              placeholder="State"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              name="pincode"
              defaultValue={initialData?.pincode}
              disabled={loading}
              placeholder="400001"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">Medical Information</h3>
        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
          <Textarea
            id="medicalConditions"
            name="medicalConditions"
            defaultValue={initialData?.medicalConditions}
            disabled={loading}
            rows={3}
            placeholder="Any medical conditions or allergies..."
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="font-semibold">Emergency Contact</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Emergency Contact Name</Label>
            <Input
              id="emergencyName"
              name="emergencyName"
              defaultValue={initialData?.emergencyName}
              disabled={loading}
              placeholder="Contact person name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              type="tel"
              defaultValue={initialData?.emergencyContact}
              disabled={loading}
              placeholder="+91 9876543210"
            />
          </div>
        </div>
      </div>

      {/* Gym Details */}
      <div className="space-y-4">
        <h3 className="font-semibold">Gym Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trainerId">Assigned Trainer</Label>
            <Select
              name="trainerId"
              defaultValue={initialData?.trainerId || ''}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Trainer</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={initialData?.notes}
            disabled={loading}
            rows={3}
            placeholder="Any additional notes about the member..."
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEdit ? 'Update Member' : 'Create Member'}</>
          )}
        </Button>
      </div>
    </form>
  )
}
