'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Clock } from 'lucide-react'

interface EnrollmentButtonProps {
  trainingId: string
  isFull: boolean
  userId: string
}

export default function EnrollmentButton({ trainingId, isFull, userId }: EnrollmentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to enroll')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading}
      variant={isFull ? 'outline' : 'default'}
      className="w-full flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      ) : (
        <>
          {isFull ? <Clock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          <span>{isFull ? 'Join Waitlist' : 'Enroll Now'}</span>
        </>
      )}
    </Button>
  )
}