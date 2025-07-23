import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Users, Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function TrainingsPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'HR_ADMIN') {
    redirect('/')
  }

  const trainings = await prisma.trainingProgram.findMany({
    include: {
      enrollments: {
        where: { status: 'ENROLLED' },
        include: { user: true }
      },
      _count: {
        select: { 
          enrollments: { where: { status: 'ENROLLED' } },
          feedback: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Training Programs</h1>
            <p className="text-gray-600">Manage your training programs and sessions</p>
          </div>
          <Link href="/trainings/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Training</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    training.status === 'PUBLISHED' 
                      ? 'bg-green-100 text-green-800' 
                      : training.status === 'DRAFT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : training.status === 'COMPLETED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {training.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{training.description}</p>
                  
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

                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex space-x-2">
                      <Link href={`/trainings/${training.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                    {training.status === 'DRAFT' && (
                      <Button size="sm">
                        Publish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {trainings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No training programs yet</h3>
            <p className="text-gray-600 mb-6">Create your first training program to get started</p>
            <Link href="/trainings/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Training Program
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}