import { apiClient, ApiResponse, PaginatedResponse } from '@/lib/api';

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
    createdAt: string;
    // Approval fields
    approvalStatus?: 'draft' | 'pending' | 'approved' | 'rejected';
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
    approvalStatus: 'pending' | 'approved' | 'rejected';
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
}

export interface UserFilters {
    role?: string;
    isActive?: boolean;
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

/**
 * Admin API Service
 */
export const adminService = {
    /**
     * Get platform statistics
     */
    async getStatistics(): Promise<ApiResponse<Statistics>> {
        try {
            const response = await apiClient.get<ApiResponse<Statistics>>('/admin/statistics');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch statistics'
            };
        }
    },

    /**
     * Get all users with filters and pagination
     */
    async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
        try {
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
            if (filters.page) params.append('page', String(filters.page));
            if (filters.limit) params.append('limit', String(filters.limit));

            const response = await apiClient.get<PaginatedResponse<User>>(`/admin/users?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: {
                    users: [],
                    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
                }
            };
        }
    },

    /**
     * Update user status (active/verified)
     */
    async updateUserStatus(userId: number, status: { isActive?: boolean; isVerified?: boolean }): Promise<ApiResponse<{ user: User }>> {
        try {
            const response = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, status);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update user status'
            };
        }
    },

    /**
     * Delete a user
     */
    async deleteUser(userId: number): Promise<ApiResponse<null>> {
        try {
            const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${userId}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete user'
            };
        }
    },

    /**
     * Get all courses for moderation
     */
    async getCourses(filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> {
        try {
            const params = new URLSearchParams();
            if (filters.isPublished !== undefined) params.append('isPublished', String(filters.isPublished));
            if (filters.page) params.append('page', String(filters.page));
            if (filters.limit) params.append('limit', String(filters.limit));

            const response = await apiClient.get<PaginatedResponse<Course>>(`/admin/courses?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: {
                    courses: [],
                    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
                }
            };
        }
    },

    /**
     * Get courses pending approval
     */
    async getPendingCourses(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Course>> {
        try {
            const response = await apiClient.get<PaginatedResponse<Course>>(`/admin/courses/pending?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: {
                    courses: [],
                    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
                }
            };
        }
    },

    /**
     * Approve a course
     */
    async approveCourse(courseId: number): Promise<ApiResponse<{ course: Course }>> {
        try {
            const response = await apiClient.put<ApiResponse<{ course: Course }>>(`/admin/courses/${courseId}/approve`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to approve course'
            };
        }
    },

    /**
     * Reject a course
     */
    async rejectCourse(courseId: number, reason: string): Promise<ApiResponse<{ course: Course }>> {
        try {
            const response = await apiClient.put<ApiResponse<{ course: Course }>>(`/admin/courses/${courseId}/reject`, { reason });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to reject course'
            };
        }
    },

    /**
     * Get all marketplace items for moderation
     */
    async getMarketplaceItems(filters: MarketplaceFilters = {}): Promise<PaginatedResponse<MarketplaceItem>> {
        try {
            const params = new URLSearchParams();
            if (filters.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));
            if (filters.page) params.append('page', String(filters.page));
            if (filters.limit) params.append('limit', String(filters.limit));

            const response = await apiClient.get<PaginatedResponse<MarketplaceItem>>(`/admin/marketplace?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                data: {
                    items: [],
                    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
                }
            };
        }
    },

    /**
     * Get detailed course info for review
     */
    async getCourseDetails(courseId: number): Promise<ApiResponse<CourseDetails>> {
        try {
            const response = await apiClient.get<ApiResponse<CourseDetails>>(`/admin/courses/${courseId}/details`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch course details'
            };
        }
    },

    /**
     * Get pending marketplace items (paid but awaiting approval)
     */
    async getPendingMarketplaceItems(): Promise<ApiResponse<{ items: MarketplaceItem[] }>> {
        try {
            const response = await apiClient.get<ApiResponse<{ items: MarketplaceItem[] }>>('/admin/marketplace/pending');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch pending items',
                data: { items: [] }
            };
        }
    },

    /**
     * Approve a marketplace item
     */
    async approveMarketplaceItem(itemId: number): Promise<ApiResponse> {
        try {
            const response = await apiClient.put<ApiResponse>(`/admin/marketplace/${itemId}/approve`);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to approve item'
            };
        }
    },

    /**
     * Reject a marketplace item
     */
    async rejectMarketplaceItem(itemId: number, reason: string): Promise<ApiResponse> {
        try {
            const response = await apiClient.put<ApiResponse>(`/admin/marketplace/${itemId}/reject`, { reason });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to reject item'
            };
        }
    },

    /**
     * Get pending bank transfer payments
     */
    async getPendingBankTransfers(): Promise<ApiResponse<{ payments: any[] }>> {
        try {
            const response = await apiClient.get<ApiResponse<{ payments: any[] }>>('/admin/payments/bank-transfers/pending');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch pending transfers',
                data: { payments: [] }
            };
        }
    },

    /**
     * Verify (approve) bank transfer payment
     */
    async verifyBankTransfer(paymentId: number): Promise<ApiResponse> {
        try {
            const response = await apiClient.put<ApiResponse>(`/admin/payments/${paymentId}/verify`, { 
                action: 'approve' 
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to verify payment'
            };
        }
    },

    /**
     * Reject bank transfer payment
     */
    async rejectBankTransfer(paymentId: number, reason: string): Promise<ApiResponse> {
        try {
            const response = await apiClient.put<ApiResponse>(`/admin/payments/${paymentId}/verify`, { 
                action: 'reject',
                reason 
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to reject payment'
            };
        }
    }
};

// Additional types for course details
export interface TutorProfile {
    id: number;
    userId: number;
    qualifications?: string;
    expertiseAreas?: string[];
    bio?: string;
    yearsOfExperience?: number;
    isApproved?: boolean;
    approvalStatus?: string;
    totalCourses?: number;
    totalStudents?: number;
    averageRating?: number;
}

export interface CourseContent {
    id: number;
    courseId: number;
    title: string;
    url?: string;
    duration?: number;
    order: number;
    isPublished: boolean;
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
}

