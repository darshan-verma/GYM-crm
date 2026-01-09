'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'
import { createMembershipPlan } from '@/lib/actions/memberships'

export function MembershipPlanForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    features: [''],
    color: '#3b82f6',
    popular: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Filter out empty features
    const cleanedFeatures = formData.features.filter(f => f.trim() !== '')

    if (cleanedFeatures.length === 0) {
      setError('At least one feature is required')
      setLoading(false)
      return
    }

    const result = await createMembershipPlan({
      ...formData,
      features: cleanedFeatures,
      duration: parseInt(formData.duration.toString()),
      price: parseFloat(formData.price.toString()),
    })

    if (result?.success) {
      router.push('/memberships')
      router.refresh()
    } else {
      setError(result?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Plan Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Monthly Membership"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the plan"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (days) *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-20 h-10"
          />
          <span className="text-sm text-gray-500">{formData.color}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Services *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder="e.g. Access to gym equipment"
              />
              {formData.features.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="popular"
          checked={formData.popular}
          onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="popular" className="cursor-pointer">
          Mark as Most Popular
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Plan'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/memberships')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
