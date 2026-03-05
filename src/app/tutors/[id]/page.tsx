"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService, TutorProfile } from "@/services/admin.service";

export default function TutorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params.id as string;

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Log component version on mount
  useEffect(() => {
    console.log("🎯 ===============================================");
    console.log("🎯 TUTOR DETAILS PAGE LOADED - VERSION 2.0");
    console.log("🎯 ===============================================");
    console.log("🎯 Loaded at:", new Date().toISOString());
    console.log("🎯 Tutor ID:", tutorId);
    console.log("🎯 Features: Approve with notification, no redirect");
  }, []);

  useEffect(() => {
    if (tutorId) {
      fetchTutorDetails();
    }
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.getTutorProfile(parseInt(tutorId));

      if (response.success && response.data) {
        setTutor(response.data);
      } else {
        setError(response.message || "Failed to fetch tutor details");
      }
    } catch (err) {
      setError("An error occurred while fetching tutor details");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    console.log("🚀 ============================================");
    console.log("🚀 APPROVE BUTTON CLICKED - NEW CODE VERSION 2.0");
    console.log("🚀 ============================================");
    console.log("🚀 Timestamp:", new Date().toISOString());

    if (!tutor) {
      console.log("❌ No tutor data available");
      return;
    }

    setActionLoading(true);
    try {
      console.log("📝 Approving tutor application:", tutor.id);
      console.log(
        "📝 Tutor name:",
        tutor.user?.firstName,
        tutor.user?.lastName,
      );
      const response = await adminService.approveTutorApplication(tutor.id);
      console.log("📦 ============================================");
      console.log("📦 API RESPONSE RECEIVED:", response);
      console.log("📦 Success:", response.success);
      console.log("📦 Message:", response.message);
      console.log("📦 ============================================");

      if (response.success) {
        console.log("✅ ============================================");
        console.log("✅ APPROVAL SUCCESSFUL!");
        console.log("✅ Action: Refreshing tutor details (NO REDIRECT)");
        console.log("✅ ============================================");
        alert(
          "✅ Tutor application approved successfully! Notification sent to the user.",
        );
        setShowApproveModal(false);
        // Refresh the page to show updated status instead of redirecting
        await fetchTutorDetails();
        console.log("✅ Page refreshed successfully!");
      } else {
        console.error("❌ ============================================");
        console.error("❌ APPROVAL FAILED:", response.message);
        console.error("❌ ============================================");
        alert(`❌ Failed to approve: ${response.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("🛑 ============================================");
      console.error("🛑 APPROVAL ERROR:", err);
      console.error("🛑 Error message:", err?.message);
      console.error("🛑 ============================================");
      alert(
        `❌ Error: ${err?.message || "An error occurred while approving the application"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    console.log("🔴 ============================================");
    console.log("🔴 REJECT BUTTON CLICKED - NEW CODE VERSION 2.0");
    console.log("🔴 ============================================");
    console.log("🔴 Timestamp:", new Date().toISOString());

    if (!tutor || !rejectionReason.trim()) {
      console.log("⚠️ Rejection reason missing");
      alert("⚠️ Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      console.log("📝 Rejecting tutor application:", tutor.id);
      console.log(
        "📝 Tutor name:",
        tutor.user?.firstName,
        tutor.user?.lastName,
      );
      console.log("📝 Rejection reason:", rejectionReason);
      const response = await adminService.rejectTutorApplication(
        tutor.id,
        rejectionReason,
      );
      console.log("📦 ============================================");
      console.log("📦 API RESPONSE RECEIVED:", response);
      console.log("📦 Success:", response.success);
      console.log("📦 Message:", response.message);
      console.log("📦 ============================================");

      if (response.success) {
        console.log("✅ ============================================");
        console.log("✅ REJECTION SUCCESSFUL!");
        console.log("✅ Action: Refreshing tutor details (NO REDIRECT)");
        console.log("✅ ============================================");
        alert("✅ Tutor application rejected. Notification sent to the user.");
        setShowRejectModal(false);
        setRejectionReason("");
        // Refresh the page to show updated status instead of redirecting
        await fetchTutorDetails();
        console.log("✅ Page refreshed successfully!");
      } else {
        console.error("❌ ============================================");
        console.error("❌ REJECTION FAILED:", response.message);
        console.error("❌ ============================================");
        alert(`❌ Failed to reject: ${response.message || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("🛑 ============================================");
      console.error("🛑 REJECTION ERROR:", err);
      console.error("🛑 Error message:", err?.message);
      console.error("🛑 ============================================");
      alert(
        `❌ Error: ${err?.message || "An error occurred while rejecting the application"}`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          {error || "Tutor not found"}
        </div>
      </div>
    );
  }

  const isPending = tutor.approvalStatus === "pending";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-900 mb-2 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Tutor Application Details
          </h1>
        </div>
        {isPending && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve Application
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject Application
            </button>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
            tutor.approvalStatus === "approved"
              ? "bg-green-100 text-green-800"
              : tutor.approvalStatus === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {tutor.approvalStatus === "approved"
            ? "Approved"
            : tutor.approvalStatus === "rejected"
              ? "Rejected"
              : "Pending Review"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Applicant Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Applicant Information
            </h2>
            <div className="flex flex-col items-center mb-4">
              {tutor.user?.profileImage ? (
                <img
                  src={tutor.user.profileImage}
                  alt="Profile"
                  className="h-24 w-24 rounded-full mb-3"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                  <span className="text-primary-600 font-bold text-2xl">
                    {tutor.user?.firstName?.[0]}
                    {tutor.user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {tutor.user?.firstName} {tutor.user?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{tutor.user?.email}</p>
            </div>
            <div className="border-t pt-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Applied On
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {tutor.createdAt
                    ? new Date(tutor.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              {tutor.approvedAt && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {tutor.approvalStatus === "approved"
                      ? "Approved On"
                      : "Rejected On"}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(tutor.approvedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Experience</span>
                <span className="text-sm font-semibold">
                  {tutor.yearsOfExperience || 0} years
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Graduation Status</span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    tutor.graduationStatus === "graduate"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {tutor.graduationStatus === "graduate"
                    ? "Graduate"
                    : "Undergraduate"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expertise Areas</span>
                <span className="text-sm font-semibold">
                  {tutor.expertiseAreas?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Subjects</span>
                <span className="text-sm font-semibold">
                  {tutor.coursesSubjects?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Qualifications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
              Qualifications & Education
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {tutor.qualifications || "Not provided"}
            </p>
          </div>

          {/* Expertise Areas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {tutor.expertiseAreas?.length ? (
                tutor.expertiseAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No expertise areas specified</p>
              )}
            </div>
          </div>

          {/* Course Subjects */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Subjects for Course Creation
            </h2>
            <div className="flex flex-wrap gap-2">
              {tutor.coursesSubjects?.length ? (
                tutor.coursesSubjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                  >
                    {subject}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No course subjects specified</p>
              )}
            </div>
          </div>

          {/* Portfolio Links */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Portfolio & Social Links
            </h2>
            <div className="space-y-3">
              {tutor.youtubeLink && (
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <a
                    href={tutor.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {tutor.youtubeLink}
                  </a>
                </div>
              )}
              {tutor.blogLink && (
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <a
                    href={tutor.blogLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {tutor.blogLink}
                  </a>
                </div>
              )}
              {tutor.linkedinLink && (
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <a
                    href={tutor.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {tutor.linkedinLink}
                  </a>
                </div>
              )}
              {!tutor.youtubeLink && !tutor.blogLink && !tutor.linkedinLink && (
                <p className="text-gray-500">No portfolio links provided</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Biography
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {tutor.bio || "No biography provided"}
            </p>
          </div>

          {/* Remarks */}
          {tutor.remarks && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Additional Remarks
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {tutor.remarks}
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {tutor.approvalStatus === "rejected" && tutor.rejectionReason && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <h2 className="text-xl font-bold mb-2 text-red-900">
                Rejection Reason
              </h2>
              <p className="text-red-700">{tutor.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Approve Tutor Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to approve this tutor application?
                        The applicant will be granted tutor access and can start
                        creating courses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reject Tutor Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-3">
                        Please provide a reason for rejection:
                      </p>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter rejection reason..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "Reject Application"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
