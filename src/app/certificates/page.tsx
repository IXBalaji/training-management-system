import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Download, Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CertificatesPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'EMPLOYEE') {
    redirect('/')
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    include: {
      training: true
    },
    orderBy: { generatedAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Certificates</h1>
          <p className="text-gray-600">Download your training completion certificates</p>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span>{certificate.training.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span>Trainer: {certificate.training.trainer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>Completed: {formatDate(certificate.training.date)}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                      <div className="text-center">
                        <Award className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-800">Certificate of Completion</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Generated on {formatDate(certificate.generatedAt)}
                        </p>
                      </div>
                    </div>

                    <Button className="w-full flex items-center justify-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Download Certificate</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No certificates yet</h3>
            <p className="text-gray-600 mb-6">
              Complete training programs and submit feedback to earn certificates
            </p>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Browse Available Trainings
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}