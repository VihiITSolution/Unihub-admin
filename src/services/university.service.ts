import { apiClient } from '@/lib/api';

export interface University {
  id: number;
  name: string;
  shortName?: string;
  city: string;
  district?: string;
  province?: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'private' | 'international';
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UniversityFormData {
  name: string;
  shortName?: string;
  city: string;
  district?: string;
  province?: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'private' | 'international';
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
}

class UniversityService {
  /**
   * Get all universities
   */
  async getAll(params?: {
    city?: string;
    type?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const response = await apiClient.get('/universities', { params });
    return response.data;
  }

  /**
   * Get university by ID
   */
  async getById(id: number) {
    const response = await apiClient.get(`/universities/${id}`);
    return response.data;
  }

  /**
   * Create new university (Admin only)
   */
  async create(data: UniversityFormData) {
    const response = await apiClient.post('/universities', data);
    return response.data;
  }

  /**
   * Update university (Admin only)
   */
  async update(id: number, data: Partial<UniversityFormData>) {
    const response = await apiClient.put(`/universities/${id}`, data);
    return response.data;
  }

  /**
   * Delete university (Admin only)
   */
  async delete(id: number) {
    const response = await apiClient.delete(`/universities/${id}`);
    return response.data;
  }

  /**
   * Toggle university active status (Admin only)
   */
  async toggleStatus(id: number) {
    const response = await apiClient.patch(`/universities/${id}/toggle-status`);
    return response.data;
  }

  /**
   * Get cities with universities
   */
  async getCities() {
    const response = await apiClient.get('/universities/cities');
    return response.data;
  }
}

export const universityService = new UniversityService();
