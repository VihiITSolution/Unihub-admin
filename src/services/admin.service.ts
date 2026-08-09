import { apiClient, ApiResponse, PaginatedResponse } from "@/lib/api";

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  roles?: string[];
  primaryRole?: string;
  isActive: boolean;
  isVerified: boolean;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  tutorId: number;
  tutor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: string;
  level?: string;
  duration?: number;
  enrollmentCount?: number;
  facultyId?: number;
  faculty?: { id: number; name: string; icon?: string };
  departmentId?: number;
  department?: { id: number; name: string };
  year?: number;
  createdAt: string;
  // Approval fields
  approvalStatus?: "draft" | "pending" | "approved" | "rejected";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  submittedForReviewAt?: string;
}

export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
  sellerId: number;
  seller?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  category?: string;
  images?: string[];
  // Payment and approval fields
  isPaid: boolean;
  adFee?: number;
  paidAt?: string;
  paymentId?: number;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  requiresPayment: boolean;
  createdAt: string;
}

export interface Statistics {
  users: {
    total: number;
    tutors: number;
    learners: number;
  };
  courses: {
    total: number;
    published: number;
  };
  enrollments: number;
  payments: {
    total: number;
    revenue: number;
  };
  marketplace: {
    totalItems: number;
  };
  operations: {
    pendingTutorApplications: number;
    pendingCourses: number;
    pendingMarketplaceItems: number;
    pendingBoardingPlaces: number;
    pendingBankTransfers: number;
    unresolvedSupportTickets: number;
    criticalSupportTickets: number;
  };
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CourseFilters {
  isPublished?: boolean;
  approvalStatus?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceFilters {
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  attachments?: string[];
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedToAdminId?: number | null;
  adminResponse?: string;
  respondedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, "id" | "firstName" | "lastName" | "email">;
  assignedAdmin?: Pick<User, "id" | "firstName" | "lastName" | "email">;
}

export interface AdminAuditLog {
  id: number;
  actorAdminId?: number;
  action: string;
  targetType: string;
  targetId?: string;
  summary: string;
  metadata?: {
    method?: string;
    path?: string;
    statusCode?: number;
    changes?: Record<string, string>;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actorAdmin?: Pick<User, "id" | "firstName" | "lastName" | "email">;
}

export interface RegistrationSuggestions {
  universities: string[];
  faculties: string[];
  departments: string[];
  total: number;
}

export interface SystemStatus {
  checkedAt: string;
  environment: string;
  uptimeSeconds: number;
  services: {
    api: { status: string };
    database: { status: string; message: string };
    mediaUploads: { status: string };
    youtube: { status: string };
  };
  security: {
    jwtSecretConfigured: boolean;
    corsAllowlistConfigured: boolean;
    productionMode: boolean;
  };
  commercial: {
    freeMarketplaceTrialEnabled: boolean;
    freeMarketplaceTrialEndDate: string | null;
    payHere: { configured: boolean; mode: string };
    helaPay: { configured: boolean; mode: string };
    bankTransferConfigured: boolean;
  };
}

/**
 * Admin API Service
 */
export const adminService = {
  /**
   * Get platform statistics
   */
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    try {
      const response =
        await apiClient.get<ApiResponse<Statistics>>("/admin/statistics");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch statistics",
      };
    }
  },

  /**
   * Get all users with filters and pagination
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get<PaginatedResponse<User>>(
        `/admin/users?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          users: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Update user status (active/verified)
   */
  async updateUserStatus(
    userId: number,
    status: { isActive?: boolean; isVerified?: boolean },
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ user: User }>>(
        `/admin/users/${userId}/status`,
        status,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update user status",
      };
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/admin/users/${userId}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user",
      };
    }
  },

  /**
   * Get all courses for moderation
   */
  async getCourses(
    filters: CourseFilters = {},
  ): Promise<PaginatedResponse<Course>> {
    try {
      const params = new URLSearchParams();
      if (filters.isPublished !== undefined)
        params.append("isPublished", String(filters.isPublished));
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get<PaginatedResponse<Course>>(
        `/admin/courses?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          courses: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Get courses pending approval
   */
  async getPendingCourses(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Course>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Course>>(
        `/admin/courses/pending?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          courses: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Approve a course
   */
  async approveCourse(
    courseId: number,
  ): Promise<ApiResponse<{ course: Course }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ course: Course }>>(
        `/admin/courses/${courseId}/approve`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve course",
      };
    }
  },

  /**
   * Reject a course
   */
  async rejectCourse(
    courseId: number,
    reason: string,
  ): Promise<ApiResponse<{ course: Course }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ course: Course }>>(
        `/admin/courses/${courseId}/reject`,
        { reason },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject course",
      };
    }
  },

  /**
   * Get all marketplace items for moderation
   */
  async getMarketplaceItems(
    filters: MarketplaceFilters = {},
  ): Promise<PaginatedResponse<MarketplaceItem>> {
    try {
      const params = new URLSearchParams();
      if (filters.isAvailable !== undefined)
        params.append("isAvailable", String(filters.isAvailable));
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get<PaginatedResponse<MarketplaceItem>>(
        `/admin/marketplace?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        data: {
          items: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Get detailed course info for review
   */
  async getCourseDetails(
    courseId: number,
  ): Promise<ApiResponse<CourseDetails>> {
    try {
      const response = await apiClient.get<ApiResponse<CourseDetails>>(
        `/admin/courses/${courseId}/details`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch course details",
      };
    }
  },

  /**
   * Get pending marketplace items (paid but awaiting approval)
   */
  async getPendingMarketplaceItems(): Promise<
    ApiResponse<{ items: MarketplaceItem[] }>
  > {
    try {
      const response = await apiClient.get<
        ApiResponse<{ items: MarketplaceItem[] }>
      >("/admin/marketplace/pending");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch pending items",
        data: { items: [] },
      };
    }
  },

  /**
   * Approve a marketplace item
   */
  async approveMarketplaceItem(itemId: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/admin/marketplace/${itemId}/approve`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to approve item",
      };
    }
  },

  /**
   * Reject a marketplace item
   */
  async rejectMarketplaceItem(
    itemId: number,
    reason: string,
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/admin/marketplace/${itemId}/reject`,
        { reason },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject item",
      };
    }
  },

  /**
   * Get pending bank transfer payments
   */
  async getPendingBankTransfers(): Promise<ApiResponse<{ payments: any[] }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ payments: any[] }>>(
        "/admin/payments/bank-transfers/pending",
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch pending transfers",
        data: { payments: [] },
      };
    }
  },

  /**
   * Verify (approve) bank transfer payment
   */
  async verifyBankTransfer(paymentId: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/admin/payments/${paymentId}/verify`,
        {
          action: "approve",
        },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify payment",
      };
    }
  },

  /**
   * Reject bank transfer payment
   */
  async rejectBankTransfer(
    paymentId: number,
    reason: string,
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/admin/payments/${paymentId}/verify`,
        {
          action: "reject",
          reason,
        },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to reject payment",
      };
    }
  },

  /**
   * Get all boarding places (admin)
   */
  async getBoardingPlaces(filters: { page?: number; limit?: number } = {}): Promise<ApiResponse<{ places: BoardingPlace[]; pagination: any }>> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      const response = await apiClient.get<ApiResponse<{ places: BoardingPlace[]; pagination: any }>>(
        `/admin/boarding/places?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch boarding places", data: { places: [], pagination: null } };
    }
  },

  /**
   * Approve a boarding place
   */
  async approveBoardingPlace(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(`/admin/boarding/places/${id}/approve`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to approve boarding place" };
    }
  },

  /**
   * Reject a boarding place
   */
  async rejectBoardingPlace(id: number, reason: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(`/admin/boarding/places/${id}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to reject boarding place" };
    }
  },

  /**
   * Get tutor profile details
   */
  async getTutorProfile(id: number): Promise<ApiResponse<TutorProfile>> {
    try {
      const response = await apiClient.get<ApiResponse<TutorProfile>>(
        `/admin/tutor-profiles/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch tutor profile",
      };
    }
  },

  /**
   * Get all tutor applications with filters and pagination
   */
  async getTutorApplications(
    filters: {
      approvalStatus?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<
    ApiResponse<{
      tutorProfiles: TutorProfile[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>
  > {
    try {
      const params = new URLSearchParams();
      if (filters.approvalStatus)
        params.append("approvalStatus", filters.approvalStatus);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get<
        ApiResponse<{
          tutorProfiles: TutorProfile[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        }>
      >(`/admin/tutor-profiles?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch tutor applications",
        data: {
          tutorProfiles: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      };
    }
  },

  /**
   * Approve tutor application
   */
  async approveTutorApplication(
    tutorProfileId: number,
  ): Promise<ApiResponse<TutorProfile>> {
    try {
      const response = await apiClient.put<ApiResponse<TutorProfile>>(
        `/admin/tutor-profiles/${tutorProfileId}/approve`,
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to approve tutor application",
      };
    }
  },

  /**
   * Reject tutor application
   */
  async rejectTutorApplication(
    tutorProfileId: number,
    rejectionReason: string,
  ): Promise<ApiResponse<TutorProfile>> {
    try {
      const response = await apiClient.put<ApiResponse<TutorProfile>>(
        `/admin/tutor-profiles/${tutorProfileId}/reject`,
        { reason: rejectionReason },
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to reject tutor application",
      };
    }
  },

  async getSupportTickets(filters: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: "me" | "unassigned";
    search?: string;
  } = {}): Promise<ApiResponse<{ tickets: SupportTicket[]; pagination: AdminPagination }>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
      });
      const response = await apiClient.get<ApiResponse<{ tickets: SupportTicket[]; pagination: AdminPagination }>>(
        `/admin/support/tickets?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to load support tickets" };
    }
  },

  async updateSupportTicket(
    id: number,
    changes: {
      status?: SupportTicket["status"];
      priority?: SupportTicket["priority"];
      assignToMe?: boolean;
      assignedToAdminId?: null;
      adminResponse?: string;
    },
  ): Promise<ApiResponse<{ ticket: SupportTicket }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ ticket: SupportTicket }>>(
        `/admin/support/tickets/${id}`,
        changes,
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update support ticket" };
    }
  },

  async bulkUpdateSupportTickets(
    ticketIds: number[],
    changes: {
      status?: SupportTicket["status"];
      priority?: SupportTicket["priority"];
      assignToMe?: boolean;
      assignedToAdminId?: null;
    },
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    try {
      const response = await apiClient.put<ApiResponse<{ updatedCount: number }>>(
        "/admin/support/tickets/bulk",
        { ticketIds, ...changes },
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to update support tickets" };
    }
  },

  async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    action?: string;
    targetType?: string;
    search?: string;
  } = {}): Promise<ApiResponse<{ logs: AdminAuditLog[]; pagination: AdminPagination }>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
      });
      const response = await apiClient.get<ApiResponse<{ logs: AdminAuditLog[]; pagination: AdminPagination }>>(
        `/admin/audit-logs?${params.toString()}`,
      );
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to load audit logs" };
    }
  },

  async getRegistrationSuggestions(): Promise<ApiResponse<RegistrationSuggestions>> {
    try {
      const response = await apiClient.get<ApiResponse<RegistrationSuggestions>>("/admin/suggestions");
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Failed to load registration suggestions" };
    }
  },

  async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    try {
      const response = await apiClient.get<ApiResponse<SystemStatus>>("/admin/system-status");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to load system status",
        data: error.response?.data?.data,
      };
    }
  },
};

export interface BoardingPlace {
  id: number;
  vendorId: number;
  vendor?: { id: number; firstName: string; lastName: string; email: string };
  title: string;
  description: string;
  address: string;
  city: string;
  district?: string;
  nearestUniversity?: string;
  distanceToUniversity?: number;
  roomType: string;
  genderPreference: string;
  capacity: number;
  availableSlots: number;
  monthlyRent: number;
  securityDeposit?: number;
  amenities?: string[];
  rules?: string;
  images?: string[];
  contactPhone: string;
  contactEmail?: string;
  isActive: boolean;
  isPaid: boolean;
  adFee: number;
  expiresAt?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  isFreeTrialAd?: boolean;
  createdAt: string;
}

// Additional types for course details
export interface TutorProfile {
  id: number;
  userId: number;
  qualifications?: string;
  graduationStatus?: "graduate" | "undergraduate";
  expertiseAreas?: string[];
  coursesSubjects?: string[];
  bio?: string;
  yearsOfExperience?: number;
  youtubeLink?: string;
  blogLink?: string;
  linkedinLink?: string;
  remarks?: string;
  isApproved?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  totalCourses?: number;
  totalStudents?: number;
  averageRating?: number;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    phoneNumber?: string;
    createdAt: string;
  };
  approver?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CourseContent {
  id: number;
  courseId: number;
  title: string;
  type: "video" | "pdf";
  url?: string;
  youtubeVideoId?: string;
  youtubeRightsDeclarationId?: number;
  youtubeRightsConfirmedAt?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
}

export interface YouTubeRightsDeclaration {
  id: number;
  userId: number;
  signatoryName: string;
  agreementVersion: string;
  agreementText: string;
  acceptedAt: string;
  acceptedIp?: string;
  acceptedUserAgent?: string;
  createdAt: string;
}

export interface CourseDetails {
  course: Course & {
    tutor?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      bio?: string;
      profileImage?: string;
      createdAt: string;
      tutorProfile?: TutorProfile;
    };
  };
  courseContent: CourseContent[];
  youtubeRightsDeclaration: YouTubeRightsDeclaration | null;
}
