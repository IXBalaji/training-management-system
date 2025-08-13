"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Save } from "lucide-react";

interface Enrollment {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  attendance: Array<{
    id: string;
    isPresent: boolean;
  }>;
}

interface AttendanceFormProps {
  trainingId: string;
  enrollments: Enrollment[];
  isLocked: boolean;
}

export default function AttendanceForm({
  trainingId,
  enrollments,
  isLocked,
}: AttendanceFormProps) {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(isLocked);

  useEffect(() => {
    // Initialize attendance state
    const initialAttendance: Record<string, boolean> = {};
    enrollments.forEach((enrollment) => {
      if (enrollment.attendance.length > 0) {
        initialAttendance[enrollment.user.id] =
          enrollment.attendance[0].isPresent;
      } else {
        initialAttendance[enrollment.user.id] = false;
      }
    });
    setAttendance(initialAttendance);
  }, [enrollments]);

  const handleAttendanceChange = (userId: string, isPresent: boolean) => {
    if (!isSaved) {
      setAttendance((prev) => ({ ...prev, [userId]: isPresent }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingId,
          attendance: Object.entries(attendance).map(([userId, isPresent]) => ({
            userId,
            isPresent,
          })),
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        alert("Attendance saved successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save attendance");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Present: {presentCount} / {enrollments.length}
        </div>
        {!isSaved && (
          <Button onClick={handleSave} disabled={isLoading} size="sm">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save Attendance
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              attendance[enrollment.user.id]
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div>
              <p className="font-medium text-gray-800">
                {enrollment.user.name}
              </p>
              <p className="text-sm text-gray-600">{enrollment.user.email}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAttendanceChange(enrollment.user.id, true)}
                disabled={isSaved}
                className={`p-2 rounded-full transition-colors ${
                  attendance[enrollment.user.id]
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-green-100"
                } ${isSaved ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  handleAttendanceChange(enrollment.user.id, false)
                }
                disabled={isSaved}
                className={`p-2 rounded-full transition-colors ${
                  !attendance[enrollment.user.id]
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-red-100"
                } ${isSaved ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isSaved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          Attendance has been saved and locked. Feedback requests will be sent
          to attendees.
        </div>
      )}
    </div>
  );
}
