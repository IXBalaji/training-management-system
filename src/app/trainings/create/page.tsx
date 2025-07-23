'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'

export default function CreateTrainingPage() {
  const [formData, setFormData] = useState({
    title: '',
    trainer: '',
    date: '',
    description: '',
    maxSeats: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxSeats: parseInt(formData.maxSeats),
          date: new Date(formData.date).toISOString(),
          status: publish ? 'PUBLISHED' : 'DRAFT'
        }),
      })

      if (response.ok) {
        router.push('/trainings')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create training')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <Link href="/trainings" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trainings</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Training Program</h1>
          <p className="text-gray-600">Set up a new training session for your team</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Training Details</CardTitle>
              <CardDescription>Fill in the information for your new training program</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Training Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., React Development Fundamentals"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="trainer" className="text-sm font-medium text-gray-700">
                    Trainer Name *
                  </label>
                  <Input
                    id="trainer"
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleChange}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-gray-700">
                      Date & Time *
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="maxSeats" className="text-sm font-medium text-gray-700">
                      Max Seats *
                    </label>
                    <Input
                      id="maxSeats"
                      name="maxSeats"
                      type="number"
                      min="1"
                      value={formData.maxSeats}
                      onChange={handleChange}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    placeholder="Describe what participants will learn in this training..."
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, false)}
                    variant="outline"
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save as Draft</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Create & Publish</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}