import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEnrollmentConfirmation, sendWaitlistUpdate } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trainingId } = await request.json()

    if (!trainingId) {
      return NextResponse.json({ error: 'Training ID is required' }, { status: 400 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_trainingId: {
          userId: user.id,
          trainingId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this training' }, { status: 400 })
    }

    // Get training details
    const training = await prisma.trainingProgram.findUnique({
      where: { id: trainingId },
      include: {
        enrollments: {
          where: { status: 'ENROLLED' }
        }
      }
    })

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
    }

    if (training.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Training is not available for enrollment' }, { status: 400 })
    }

    // Check if training is full
    const enrolledCount = training.enrollments.length
    const isFull = enrolledCount >= training.maxSeats

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        trainingId,
        status: isFull ? 'WAITLISTED' : 'ENROLLED'
      }
    })

    // Send notification
    if (isFull) {
      await sendWaitlistUpdate(user.email, training.title, false)
    } else {
      await sendEnrollmentConfirmation(user.email, training.title)
    }

    // Create notification record
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: isFull ? 'WAITLIST_UPDATE' : 'ENROLLMENT_CONFIRMATION',
        message: isFull 
          ? `You have been added to the waitlist for ${training.title}`
          : `You have been enrolled in ${training.title}`
      }
    })

    return NextResponse.json({ 
      enrollment,
      message: isFull 
        ? 'Added to waitlist successfully' 
        : 'Enrolled successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}