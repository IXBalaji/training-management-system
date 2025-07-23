import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendFeedbackReminder } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'HR_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trainingId, attendance } = await request.json()

    if (!trainingId || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findFirst({
      where: { trainingId }
    })

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already recorded for this training' }, { status: 400 })
    }

    // Get training details
    const training = await prisma.trainingProgram.findUnique({
      where: { id: trainingId }
    })

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
    }

    // Create attendance records
    const attendanceRecords = await Promise.all(
      attendance.map(({ userId, isPresent }: { userId: string, isPresent: boolean }) =>
        prisma.attendance.create({
          data: {
            userId,
            trainingId,
            isPresent
          }
        })
      )
    )

    // Send feedback reminders to attendees
    const attendees = attendance.filter(({ isPresent }: { isPresent: boolean }) => isPresent)
    
    for (const { userId } of attendees) {
      const attendeeUser = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (attendeeUser) {
        const feedbackUrl = `${process.env.NEXTAUTH_URL}/feedback/${trainingId}`
        await sendFeedbackReminder(attendeeUser.email, training.title, feedbackUrl)
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'FEEDBACK_REMINDER',
            message: `Please provide feedback for ${training.title}`
          }
        })
      }
    }

    // Update training status to completed
    await prisma.trainingProgram.update({
      where: { id: trainingId },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({ 
      message: 'Attendance recorded successfully',
      attendanceRecords 
    }, { status: 201 })
  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}