"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import YouTubePlayer from "@/components/ui/YouTubePlayer";
import { adminService, CourseDetails } from "@/services/admin.service";
import { ConfirmDialog, FeedbackBanner } from "@/components/ui/ActionFeedback";

// Helper function to extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
};

export default function CourseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCourseDetails(courseId);

      if (response.success && response.data) {
        setCourseDetails(response.data);
      } else {
        setError("Failed to load course details");
      }
    } catch (err) {
      setError("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproveConfirm(true);
  };

  const confirmApprove = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      const response = await adminService.approveCourse(courseId);
      if (response.success) {
        router.push("/courses/pending");
      } else {
        setActionError(response.message || "Failed to approve course");
      }
    } catch {
      setActionError("Failed to approve course");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("Please provide a reason for rejection");
      return;
    }

    try {
      setIsProcessing(true);
      setActionError(null);
      const response = await adminService.rejectCourse(courseId, rejectReason);
      if (response.success) {
        router.push("/courses/pending");
      } else {
        setActionError(response.message || "Failed to reject course");
      }
    } catch {
      setActionError("Failed to reject course");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsProcessing(true);
      setActionError(null);
      const response = await adminService.deleteCourse(courseId);
      if (response.success) {
        router.push("/courses");
      } else {
        setActionError(response.message || "Failed to delete course");
      }
    } catch {
      setActionError("Failed to delete course");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !courseDetails) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Course not found"}
        </div>
        <button
          onClick={() => router.push("/courses/pending")}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          ← Back to Pending Courses
        </button>
      </div>
    );
  }

  const { course, courseContent, youtubeRightsDeclaration } = courseDetails;
  const tutor = course.tutor;
  const tutorProfile = tutor?.tutorProfile;
  const isPublished = course.isPublished;

  return (
    <div className="space-y-6">
      {actionError && <FeedbackBanner message={actionError} tone="error" />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isPublished ? "Manage Course" : "Review Course"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isPublished
              ? "View course details and manage publication status"
              : "Review course content and tutor qualifications before approval"}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setDeleteConfirm(true)}
            disabled={isProcessing}
            className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Delete Course
          </button>
          <button
            onClick={() => setRejectModal(true)}
            disabled={isProcessing}
            className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {isPublished ? "Disable Course" : "Reject"}
          </button>
          {!isPublished && (
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Approve Course"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info Card */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {course.title}
                  </h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.approvalStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : course.approvalStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : course.approvalStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {course.approvalStatus || "Draft"}
                    </span>
                    {course.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                        {course.level}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {Number(course.price) === 0
                      ? "FREE"
                      : `$${Number(course.price).toFixed(2)}`}
                  </p>
                  {course.duration && (
                    <p className="text-sm text-gray-500">
                      {course.duration} hours
                    </p>
                  )}
                </div>
              </div>

              {course.thumbnail && (
                <div className="mt-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Course Preview Video */}
              {(() => {
                const videoUrl = (course as any).videoUrl;
                if (!videoUrl) return null;
                const videoId = getYouTubeId(videoUrl);

                if (videoId) {
                  return (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Course Preview Video
                      </h3>
                      <YouTubePlayer videoId={videoId} title="Course Preview" />
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Submitted for Review</p>
                  <p className="font-medium">
                    {course.submittedForReviewAt
                      ? new Date(
                          course.submittedForReviewAt,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Course Content */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Content
            </h3>
            {courseContent && courseContent.length > 0 ? (
              <div className="space-y-4">
                {courseContent.map((content, index) => {
                  // Extract YouTube video ID for embedding
                  const getYouTubeId = (url: string) => {
                    const match = url.match(
                      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                    );
                    return match ? match[1] : null;
                  };
                  const videoId = content.url
                    ? getYouTubeId(content.url)
                    : null;

                  return (
                    <div
                      key={content.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {content.title}
                            </p>
                            {content.duration && (
                              <p className="text-sm text-gray-500">
                                {content.duration} mins
                              </p>
                            )}
                            {videoId && (
                              <p
                                className={`mt-1 text-xs font-medium ${
                                  content.youtubeRightsConfirmedAt
                                    ? "text-green-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {content.youtubeRightsConfirmedAt
                                  ? `✓ Rights confirmed ${new Date(content.youtubeRightsConfirmedAt).toLocaleString()}`
                                  : "No external-link confirmation recorded (platform upload or legacy content)"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {videoId && (
                        <YouTubePlayer
                          videoId={videoId}
                          title={content.title}
                        />
                      )}
                      {content.url && !videoId && (
                        <div className="p-3 bg-gray-100 text-center">
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            Open Content →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p>No content uploaded yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Tutor Profile - Right Column */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tutor Information
            </h3>
            {tutor ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {tutor.profileImage ? (
                    <img
                      src={tutor.profileImage}
                      alt={`${tutor.firstName} ${tutor.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {tutor.firstName?.charAt(0)}
                      {tutor.lastName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {tutor.firstName} {tutor.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{tutor.email}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Member Since
                    </p>
                    <p className="text-gray-600">
                      {new Date(tutor.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {tutor.bio && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Bio</p>
                      <p className="text-gray-600 text-sm">{tutor.bio}</p>
                    </div>
                  )}
                </div>

                {/* Tutor Profile Qualifications */}
                {tutorProfile ? (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Tutor Status
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tutorProfile.approvalStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : tutorProfile.approvalStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tutorProfile.approvalStatus || "Pending"}
                      </span>
                    </div>

                    {tutorProfile.yearsOfExperience !== undefined &&
                      tutorProfile.yearsOfExperience > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Experience
                          </p>
                          <p className="text-gray-600">
                            {tutorProfile.yearsOfExperience} years
                          </p>
                        </div>
                      )}

                    {tutorProfile.qualifications && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Qualifications
                        </p>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">
                          {tutorProfile.qualifications}
                        </p>
                      </div>
                    )}

                    {tutorProfile.expertiseAreas &&
                      tutorProfile.expertiseAreas.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Expertise Areas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tutorProfile.expertiseAreas.map((area, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t text-center">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-lg font-bold text-gray-900">
                          {tutorProfile.totalCourses || 0}
                        </p>
                        <p className="text-xs text-gray-500">Courses</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-lg font-bold text-gray-900">
                          {tutorProfile.totalStudents || 0}
                        </p>
                        <p className="text-xs text-gray-500">Students</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-lg font-bold text-gray-900">
                          {tutorProfile.averageRating || 0}⭐
                        </p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ No Tutor Profile
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        This tutor has not completed their profile with
                        qualifications and experience.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Tutor information not available</p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              YouTube Rights Declaration
            </h3>
            {youtubeRightsDeclaration ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-900">
                  <p className="font-semibold">✓ Signed record retained</p>
                  <p className="mt-1">
                    {youtubeRightsDeclaration.signatoryName} ·{" "}
                    {new Date(youtubeRightsDeclaration.acceptedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Agreement version</p>
                  <p className="text-gray-600">{youtubeRightsDeclaration.agreementVersion}</p>
                </div>
                <details className="rounded-lg border border-gray-200 p-3">
                  <summary className="cursor-pointer font-medium text-gray-800">
                    View signed declaration text
                  </summary>
                  <p className="mt-3 whitespace-pre-line leading-6 text-gray-600">
                    {youtubeRightsDeclaration.agreementText}
                  </p>
                </details>
                <details className="rounded-lg border border-gray-200 p-3 text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Audit details
                  </summary>
                  <dl className="mt-2 space-y-2 break-words text-gray-600">
                    <div><dt className="font-medium">Record ID</dt><dd>{youtubeRightsDeclaration.id}</dd></div>
                    <div><dt className="font-medium">IP address</dt><dd>{youtubeRightsDeclaration.acceptedIp || "Not recorded"}</dd></div>
                    <div><dt className="font-medium">User agent</dt><dd>{youtubeRightsDeclaration.acceptedUserAgent || "Not recorded"}</dd></div>
                  </dl>
                </details>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                No signed YouTube rights declaration is on file for this tutor.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Reject/Disable Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {isPublished ? "Disable Course" : "Reject Course"}
            </h3>
            <p className="text-gray-600 mb-4">
              You are {isPublished ? "disabling" : "rejecting"}:{" "}
              <strong>{course.title}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={`Please provide a reason for ${isPublished ? "disabling" : "rejection"}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setRejectModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : isPublished
                    ? "Disable Course"
                    : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={approveConfirm}
        title="Approve course?"
        description="Confirm that you reviewed the course content, tutor details, pricing, and the displayed YouTube rights declaration before approval."
        confirmLabel="Approve course"
        processing={isProcessing}
        onCancel={() => setApproveConfirm(false)}
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        open={deleteConfirm}
        title="Permanently delete course?"
        description={`Delete “${course.title}” and its course content, enrollments, reviews, and notification requests? Payment and live-session history will be retained.`}
        confirmLabel="Delete course"
        processing={isProcessing}
        tone="danger"
        onCancel={() => setDeleteConfirm(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
