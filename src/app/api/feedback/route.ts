import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/certificate";
import { sendCertificateNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trainingId, rating, comments } = await request.json();

    if (!trainingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        userId_trainingId: {
          userId: user.id,
          trainingId,
        },
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already submitted" },
        { status: 400 },
      );
    }

    // Verify user attended the training
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_trainingId: {
          userId: user.id,
          trainingId,
        },
      },
    });

    if (!attendance || !attendance.isPresent) {
      return NextResponse.json(
        { error: "You must have attended the training to provide feedback" },
        { status: 400 },
      );
    }

    // Get training details
    const training = await prisma.trainingProgram.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 },
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        trainingId,
        rating,
        comments,
      },
    });

    // Generate certificate after feedback submission
    const certificateBuffer = generateCertificate(
      user.name,
      training.title,
      training.trainer,
      training.date.toLocaleDateString(),
    );

    // In a real app, you would upload this to cloud storage
    // For now, we'll just create a certificate record
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        trainingId,
        downloadUrl: `/api/certificates/${trainingId}/download`, // This would be the actual download URL
      },
    });

    // Send certificate notification
    const certificateUrl = `${process.env.NEXTAUTH_URL}/certificates`;
    await sendCertificateNotification(
      user.email,
      training.title,
      certificateUrl,
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "CERTIFICATE_READY",
        message: `Your certificate for ${training.title} is ready for download`,
      },
    });

    return NextResponse.json(
      {
        feedback,
        certificate,
        message:
          "Feedback submitted successfully. Your certificate is now available!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
