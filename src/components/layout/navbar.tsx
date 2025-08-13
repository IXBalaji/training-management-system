"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Menu,
  X,
  Calendar,
  Users,
  BookOpen,
  Award,
} from "lucide-react";

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  const isHR = user.role === "HR_ADMIN";

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href={`/dashboard/${isHR ? "hr" : "employee"}`}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">
                TrainingPro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isHR ? (
              <>
                <Link
                  href="/dashboard/hr"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/trainings"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Trainings</span>
                </Link>
                <Link
                  href="/attendance"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Attendance</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/employee"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/enrollment"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Browse Trainings</span>
                </Link>
                <Link
                  href="/certificates"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Award className="h-4 w-4" />
                  <span>Certificates</span>
                </Link>
              </>
            )}

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {isHR ? "HR Admin" : "Employee"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {isHR ? (
                <>
                  <Link
                    href="/dashboard/hr"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/trainings"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Trainings
                  </Link>
                  <Link
                    href="/attendance"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Attendance
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/employee"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/enrollment"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Browse Trainings
                  </Link>
                  <Link
                    href="/certificates"
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Certificates
                  </Link>
                </>
              )}
              <div className="border-t pt-2">
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user.name} ({isHR ? "HR Admin" : "Employee"})
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
