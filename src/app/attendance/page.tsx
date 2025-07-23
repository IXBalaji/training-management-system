import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, CheckCircle, X, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import AttendanceForm from '@/components/attendance/attendance-form'

export default async function AttendancePage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'HR_ADMIN') {
    redirect('/')
  }

  // Get trainings that have occurred (past date) and are published
  const trainings = await prisma.trainingProgram.findMany({
    where: {
      status: 'PUBLISHED',
      date: { lt: new Date() }
    },
    include: {
      enrollments: {
        where: { status: 'ENROLLED' },
        include: {
          user: true
        }
      },
      attendance: true
    },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Mark attendance for completed training sessions</p>
        </div>

        {trainings.length > 0 ? (
          <div className="space-y-6">
            {trainings.map((training) => {
              const attendanceMarked = training.attendance.length > 0
              
              // Map enrollments to include attendance data
              const enrollmentsWithAttendance = training.enrollments.map(enrollment => ({
                ...enrollment,
                attendance: training.attendance.filter(att => att.userId === enrollment.userId)
              }))
              
              return (
                <Card key={training.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{training.title}</span>
                          {attendanceMarked && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          Trainer: {training.trainer} • {formatDate(training.date)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{training.enrollments.length} enrolled participants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Completed on {formatDate(training.date)}</span>
                        </div>
                      </div>

                      {training.enrollments.length > 0 ? (
                        <AttendanceForm 
                          trainingId={training.id}
                          enrollments={enrollmentsWithAttendance}
                          isLocked={attendanceMarked}
                        />
                      ) : (
                        <p className="text-gray-500 text-center py-4">No enrolled participants</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No completed trainings</h3>
            <p className="text-gray-600">Attendance tracking will be available after training sessions are completed</p>
          </div>
        )}
      </div>
    </div>
  )
}