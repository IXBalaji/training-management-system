import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, User, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import FeedbackForm from '@/components/feedback/feedback-form'

interface FeedbackPageProps {
  params: {
    trainingId: string
  }
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const training = await prisma.trainingProgram.findUnique({
    where: { id: params.trainingId },
    include: {
      attendance: {
        where: { userId: user.id }
      },
      feedback: {
        where: { userId: user.id }
      }
    }
  })

  if (!training) {
    redirect('/dashboard/employee')
  }

  // Check if user attended
  const attendance = training.attendance[0]
  if (!attendance || !attendance.isPresent) {
    redirect('/dashboard/employee')
  }

  // Check if feedback already submitted
  const existingFeedback = training.feedback[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Training Feedback</h1>
            <p className="text-gray-600">Share your experience and help us improve</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>{training.title}</span>
              </CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Trainer: {training.trainer}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(training.date)}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{training.description}</p>
            </CardContent>
          </Card>

          {existingFeedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Feedback Submitted</CardTitle>
                <CardDescription>Thank you for your feedback!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Your Rating</label>
                    <div className="flex items-center space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= existingFeedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({existingFeedback.rating}/5)
                      </span>
                    </div>
                  </div>
                  
                  {existingFeedback.comments && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Your Comments</label>
                      <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">
                        {existingFeedback.comments}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Submitted on {formatDate(existingFeedback.submittedAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <FeedbackForm trainingId={training.id} trainingTitle={training.title} />
          )}
        </div>
      </div>
    </div>
  )
}