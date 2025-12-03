'use client'

import { useState, useRef } from 'react'
import { quickCheckIn } from '@/lib/actions/attendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, Scan } from 'lucide-react'

export default function QuickCheckIn() {
  const [loading, setLoading] = useState(false)
  const [membershipNumber, setMembershipNumber] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault()
    if (!membershipNumber.trim()) return

    setLoading(true)

    try {
      const result = await quickCheckIn(membershipNumber.trim())

      if (result.success) {
        toast.success('Check-In Successful', {
          description: `Member ${membershipNumber} checked in at ${new Date().toLocaleTimeString()}`,
        })
        setMembershipNumber('')
        inputRef.current?.focus()
      } else {
        toast.error('Check-In Failed', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to check in member',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Scan className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Quick Check-In</CardTitle>
            <CardDescription>Scan or enter membership number</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter membership number (e.g., PBF1001)"
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value.toUpperCase())}
              disabled={loading}
              className="flex-1 text-lg"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || !membershipNumber.trim()}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Check In'
              )}
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <p>💡 Tip: Use a barcode scanner for faster check-ins</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
