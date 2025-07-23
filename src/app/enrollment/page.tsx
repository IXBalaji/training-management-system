import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import EnrollmentButton from '@/components/enrollment/enrollment-button'

export default async function EnrollmentPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  // Get available trainings (published, future, not enrolled)
  const availableTrainings = await prisma.trainingProgram.findMany({
    where: {
      status: 'PUBLISHED',
      date: { gte: new Date() },
      enrollments: {
        none: {
          userId: user.id
        }
      }
    },
    include: {
      enrollments: {
        where: { status: 'ENROLLED' }
      },
      _count: {
        select: { 
          enrollments: { where: { status: 'ENROLLED' } }
        }
      }
    },
    orderBy: { date: 'asc' }
  })

  // Get user's current enrollments
  const userEnrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      training: true
    },
    orderBy: {
      training: { date: 'asc' }
    }
  })

  const enrolledTrainings = userEnrollments.filter(e => e.status === 'ENROLLED')
  const waitlistedTrainings = userEnrollments.filter(e => e.status === 'WAITLISTED')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Training Enrollment</h1>
          <p className="text-gray-600">Browse and enroll in available training programs</p>
        </div>

        {/* User's Current Enrollments */}
        {(enrolledTrainings.length > 0 || waitlistedTrainings.length > 0) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Enrollments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {enrolledTrainings.map((enrollment) => (
                <Card key={enrollment.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{enrollment.training.title}</h4>
                        <p className="text-sm text-gray-600">Trainer: {enrollment.training.trainer}</p>
                        <p className="text-sm text-green-600 font-medium">{formatDate(enrollment.training.date)}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {waitlistedTrainings.map((enrollment) => (
                <Card key={enrollment.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{enrollment.training.title}</h4>
                        <p className="text-sm text-gray-600">Trainer: {enrollment.training.trainer}</p>
                        <p className="text-sm text-yellow-600 font-medium">{formatDate(enrollment.training.date)}</p>
                        <p className="text-xs text-yellow-600 mt-1">Waitlisted - you'll be notified if a seat opens</p>
                      </div>
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Trainings */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Training Programs</h2>
          
          {availableTrainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrainings.map((training) => {
                const isFull = training._count.enrollments >= training.maxSeats
                
                return (
                  <Card key={training.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{training.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-1 mt-1">
                            <User className="h-3 w-3" />
                            <span>{training.trainer}</span>
                          </CardDescription>
                        </div>
                        {isFull && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Full
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-3">{training.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(training.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{training._count.enrollments}/{training.maxSeats}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          <EnrollmentButton 
                            trainingId={training.id}
                            isFull={isFull}
                            userId={user.id}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No available trainings</h3>
              <p className="text-gray-600">Check back later for new training opportunities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}