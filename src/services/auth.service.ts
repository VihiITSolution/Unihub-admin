import { apiClient, setToken, setStoredUser, removeToken, AdminUser, ApiResponse } from '@/lib/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: AdminUser;
    token: string;
}

/**
 * Admin Authentication Service
 */
export const authService = {
    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);

            if (response.data.success && response.data.data) {
                const { token, user } = response.data.data;

                // Check if user is admin (handle both old 'role' and new 'roles' schema)
                const isAdmin = user.roles?.includes('admin') ||
                    user.primaryRole === 'admin' ||
                    (user as any).role === 'admin';

                if (!isAdmin) {
                    return {
                        success: false,
                        message: 'Access denied. Admin privileges required.'
                    };
                }

                // Store token and user
                setToken(token);
                setStoredUser(user);

                return response.data;
            }

            return {
                success: false,
                message: response.data.message || 'Login failed'
            };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return {
                success: false,
                message
            };
        }
    },

    /**
     * Logout - clear tokens
     */
    logout(): void {
        removeToken();
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<ApiResponse<{ user: AdminUser }>> {
        try {
            const response = await apiClient.get<ApiResponse<{ user: AdminUser }>>('/auth/me');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to get user profile'
            };
        }
    }
};
