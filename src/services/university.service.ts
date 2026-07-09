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
  phone?: string;
  email?: string;
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
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UniversityFilters {
  search?: string;
  type?: string;
  city?: string;
  province?: string;
  isActive?: boolean | undefined;
}

class UniversityService {
  async getAll(params?: UniversityFilters) {
    // Pass isActive=undefined to get ALL universities (backend defaults active=true otherwise)
    const query: Record<string, any> = { ...params };
    if (params?.isActive === undefined) delete query.isActive;
    const response = await apiClient.get('/universities', { params: query });
    return response.data;
  }

  async getById(id: number) {
    const response = await apiClient.get(`/universities/${id}`);
    return response.data;
  }

  async create(data: UniversityFormData) {
    const response = await apiClient.post('/universities', data);
    return response.data;
  }

  async update(id: number, data: Partial<UniversityFormData>) {
    const response = await apiClient.put(`/universities/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await apiClient.delete(`/universities/${id}`);
    return response.data;
  }

  async toggleStatus(id: number) {
    const response = await apiClient.patch(`/universities/${id}/toggle-status`);
    return response.data;
  }

  async getCities() {
    const response = await apiClient.get('/universities/cities');
    return response.data;
  }
}

export const universityService = new UniversityService();
