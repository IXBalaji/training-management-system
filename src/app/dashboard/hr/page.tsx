import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, BookOpen, Star, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function HRDashboard() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'HR_ADMIN') {
    redirect('/')
  }

  // Fetch dashboard data
  const [
    totalTrainings,
    upcomingTrainings,
    totalEnrollments,
    averageRating,
    recentEnrollments,
    trainingStats
  ] = await Promise.all([
    prisma.trainingProgram.count(),
    prisma.trainingProgram.findMany({
      where: {
        date: { gte: new Date() },
        status: 'PUBLISHED'
      },
      orderBy: { date: 'asc' },
      take: 5,
      include: {
        enrollments: {
          where: { status: 'ENROLLED' },
          include: { user: true }
        }
      }
    }),
    prisma.enrollment.count({
      where: { status: 'ENROLLED' }
    }),
    prisma.feedback.aggregate({
      _avg: { rating: true }
    }),
    prisma.enrollment.findMany({
      where: { status: 'ENROLLED' },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      include: {
        user: true,
        training: true
      }
    }),
    prisma.trainingProgram.findMany({
      include: {
        enrollments: {
          where: { status: 'ENROLLED' }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    })
  ])

  const stats = [
    {
      title: 'Total Trainings',
      value: totalTrainings,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Enrollments',
      value: totalEnrollments,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingTrainings.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Average Rating',
      value: averageRating._avg.rating ? averageRating._avg.rating.toFixed(1) : 'N/A',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HR Dashboard</h1>
          <p className="text-gray-600">Overview of training programs and enrollments</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Trainings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Upcoming Trainings</span>
              </CardTitle>
              <CardDescription>Next training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTrainings.length > 0 ? (
                  upcomingTrainings.map((training) => (
                    <div key={training.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">{training.title}</h4>
                        <p className="text-sm text-gray-600">Trainer: {training.trainer}</p>
                        <p className="text-sm text-gray-500">{formatDate(training.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-blue-600">
                          {training.enrollments.length}/{training.maxSeats} enrolled
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming trainings</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Recent Enrollments</span>
              </CardTitle>
              <CardDescription>Latest training enrollments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEnrollments.length > 0 ? (
                  recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">{enrollment.user.name}</h4>
                        <p className="text-sm text-gray-600">{enrollment.training.title}</p>
                        <p className="text-sm text-gray-500">
                          Enrolled: {formatDate(enrollment.enrolledAt)}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent enrollments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Training Statistics</span>
            </CardTitle>
            <CardDescription>Enrollment overview by training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Training</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Trainer</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Enrollments</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainingStats.map((training) => (
                    <tr key={training.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{training.title}</td>
                      <td className="py-3 px-4 text-gray-600">{training.trainer}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(training.date)}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {training.enrollments.length}/{training.maxSeats}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          training.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : training.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {training.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}