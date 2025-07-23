import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainings = await prisma.trainingProgram.findMany({
      include: {
        enrollments: {
          where: { status: 'ENROLLED' },
          include: { user: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(trainings)
  } catch (error) {
    console.error('Get trainings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'HR_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, trainer, date, description, maxSeats, status } = await request.json()

    if (!title || !trainer || !date || !description || !maxSeats) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const training = await prisma.trainingProgram.create({
      data: {
        title,
        trainer,
        date: new Date(date),
        description,
        maxSeats: parseInt(maxSeats),
        status: status || 'DRAFT'
      }
    })

    return NextResponse.json(training, { status: 201 })
  } catch (error) {
    console.error('Create training error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}