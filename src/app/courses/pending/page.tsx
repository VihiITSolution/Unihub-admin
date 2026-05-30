"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { adminService, Course } from "@/services/admin.service";

export default function PendingCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    courseId: number | null;
    courseName: string;
  }>({
    open: false,
    courseId: null,
    courseName: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [page]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getPendingCourses(page, 10);

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load pending courses");
      }
    } catch (err) {
      setError("Failed to load pending courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (courseId: number) => {
    if (!confirm("Are you sure you want to approve this course?")) return;

    try {
      setIsProcessing(true);
      const response = await adminService.approveCourse(courseId);
      if (response.success) {
        loadCourses();
      } else {
        alert(response.message || "Failed to approve course");
      }
    } catch (err) {
      alert("Failed to approve course");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (courseId: number, courseName: string) => {
    setRejectModal({ open: true, courseId, courseName });
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectModal.courseId || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await adminService.rejectCourse(
        rejectModal.courseId,
        rejectReason,
      );
      if (response.success) {
        setRejectModal({ open: false, courseId: null, courseName: "" });
        loadCourses();
      } else {
        alert(response.message || "Failed to reject course");
      }
    } catch (err) {
      alert("Failed to reject course");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "title", label: "Course Title" },
    {
      key: "tutor",
      label: "Tutor",
      render: (course: Course) =>
        course.tutor
          ? `${course.tutor.firstName} ${course.tutor.lastName}`
          : "N/A",
    },
    {
      key: "price",
      label: "Price",
      render: (course: Course) =>
        Number(course.price) === 0
          ? "FREE"
          : `$${Number(course.price).toFixed(2)}`,
    },
    {
      key: "level",
      label: "Level",
      render: (course: Course) => (
        <span className="capitalize">{course.level || "N/A"}</span>
      ),
    },
    {
      key: "submitted",
      label: "Submitted",
      render: (course: Course) =>
        course.submittedForReviewAt
          ? new Date(course.submittedForReviewAt).toLocaleDateString()
          : "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      render: (course: Course) => (
        <div className="flex space-x-2">
          <button
            onClick={() => router.push(`/courses/review/${course.id}`)}
            className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Review
          </button>
          <button
            onClick={() => handleApprove(course.id)}
            disabled={isProcessing}
            className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => openRejectModal(course.id, course.title)}
            disabled={isProcessing}
            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Approvals
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve courses submitted by tutors
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {courses.length} pending
          </span>
          <button
            onClick={loadCourses}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending courses
            </h3>
            <p className="text-gray-500">All courses have been reviewed</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={courses} />

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Reject Course
            </h3>
            <p className="text-gray-600 mb-4">
              You are rejecting: <strong>{rejectModal.courseName}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() =>
                  setRejectModal({
                    open: false,
                    courseId: null,
                    courseName: "",
                  })
                }
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
