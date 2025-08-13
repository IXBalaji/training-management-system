import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();

  if (!user || user.role !== "EMPLOYEE") {
    redirect("/");
  }

  // Fetch dashboard data
  const [
    enrolledTrainings,
    waitlistedTrainings,
    completedTrainings,
    certificates,
    upcomingTrainings,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: "ENROLLED",
        training: {
          date: { gte: new Date() },
        },
      },
      include: {
        training: true,
        user: true,
      },
      orderBy: {
        training: { date: "asc" },
      },
    }),
    prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: "WAITLISTED",
      },
      include: {
        training: true,
      },
    }),
    prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: "ENROLLED",
        training: {
          date: { lt: new Date() },
        },
      },
      include: {
        training: true,
        user: true,
      },
    }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        training: true,
      },
      orderBy: { generatedAt: "desc" },
    }),
    prisma.trainingProgram.findMany({
      where: {
        status: "PUBLISHED",
        date: { gte: new Date() },
        enrollments: {
          none: {
            userId: user.id,
          },
        },
      },
      orderBy: { date: "asc" },
      take: 3,
      include: {
        enrollments: {
          where: { status: "ENROLLED" },
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Enrolled Trainings",
      value: enrolledTrainings.length,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Waitlisted",
      value: waitlistedTrainings.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: completedTrainings.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Certificates",
      value: certificates.length,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Track your training progress and achievements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stat.value}
                    </p>
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
          {/* Upcoming Enrolled Trainings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Your Upcoming Trainings</span>
              </CardTitle>
              <CardDescription>Trainings you're enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledTrainings.length > 0 ? (
                  enrolledTrainings.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {enrollment.training.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Trainer: {enrollment.training.trainer}
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            {formatDate(enrollment.training.date)}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No upcoming trainings</p>
                    <Link href="/enrollment">
                      <Button>Browse Available Trainings</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Trainings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span>Available Trainings</span>
              </CardTitle>
              <CardDescription>New training opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTrainings.length > 0 ? (
                  upcomingTrainings.map((training) => (
                    <div
                      key={training.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {training.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Trainer: {training.trainer}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(training.date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {training.enrollments.length}/{training.maxSeats}{" "}
                            enrolled
                          </p>
                        </div>
                        <Link href="/enrollment">
                          <Button size="sm">Enroll</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No available trainings
                  </p>
                )}
                {upcomingTrainings.length > 0 && (
                  <div className="text-center pt-4">
                    <Link href="/enrollment">
                      <Button variant="outline">
                        View All Available Trainings
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waitlisted and Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Waitlisted Trainings */}
          {waitlistedTrainings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Waitlisted Trainings</span>
                </CardTitle>
                <CardDescription>
                  You'll be notified when seats become available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waitlistedTrainings.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <h4 className="font-medium text-gray-800">
                        {enrollment.training.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Trainer: {enrollment.training.trainer}
                      </p>
                      <p className="text-sm text-yellow-600 font-medium">
                        {formatDate(enrollment.training.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Certificates */}
          {certificates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span>Your Certificates</span>
                </CardTitle>
                <CardDescription>
                  Download your training certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.slice(0, 3).map((certificate) => (
                    <div
                      key={certificate.id}
                      className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {certificate.training.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Completed: {formatDate(certificate.generatedAt)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Link href="/certificates">
                      <Button variant="outline">View All Certificates</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
