'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/login-form'
import { BookOpen, Calendar, Users, Award } from 'lucide-react'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          router.push(user.role === 'HR_ADMIN' ? '/dashboard/hr' : '/dashboard/employee')
        }
      } catch (error) {
        // User not authenticated, stay on login page
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">TrainingPro</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Complete Training Management Solution
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Streamline your training programs with our comprehensive platform. 
                Manage enrollments, track attendance, collect feedback, and generate certificates - all in one place.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Smart Scheduling</h3>
                  <p className="text-sm text-gray-600">Efficient training calendar</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Easy Enrollment</h3>
                  <p className="text-sm text-gray-600">Seamless registration process</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Track Progress</h3>
                  <p className="text-sm text-gray-600">Monitor attendance & feedback</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Certificates</h3>
                  <p className="text-sm text-gray-600">Automated certificate generation</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">For Organizations</h3>
              <p className="text-blue-700 text-sm">
                Comprehensive HR tools for training program management, attendance tracking, 
                and performance analytics.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:pl-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600">Sign in to access your training dashboard</p>
              </div>
              
              <LoginForm />
              
              <div className="mt-6 text-center text-sm text-gray-600">
                <p className="mb-2">Demo Accounts:</p>
                <div className="bg-gray-50 p-3 rounded-md text-xs">
                  <p><strong>HR Admin:</strong> admin@company.com / admin123</p>
                  <p><strong>Employee:</strong> john@company.com / password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}