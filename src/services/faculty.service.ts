import { apiClient } from '@/lib/api';

export interface Department {
  id: number;
  name: string;
  slug?: string;
  facultyId: number;
  isActive: boolean;
  order: number;
}

export interface Faculty {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  order: number;
  departments?: Department[];
}

class FacultyService {
  async getAll(includeDepartments = false) {
    const params: Record<string, string> = {};
    if (includeDepartments) params.include = 'departments';
    const response = await apiClient.get('/faculties', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await apiClient.get(`/faculties/${id}`);
    return response.data;
  }

  async create(data: { name: string; icon?: string; description?: string; order?: number }) {
    const response = await apiClient.post('/faculties', data);
    return response.data;
  }

  async update(id: number, data: Partial<{ name: string; icon: string; description: string; isActive: boolean; order: number }>) {
    const response = await apiClient.put(`/faculties/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await apiClient.delete(`/faculties/${id}`);
    return response.data;
  }

  // Departments
  async getDepartments(facultyId: number) {
    const response = await apiClient.get(`/faculties/${facultyId}/departments`);
    return response.data;
  }

  async createDepartment(facultyId: number, data: { name: string; order?: number }) {
    const response = await apiClient.post(`/faculties/${facultyId}/departments`, data);
    return response.data;
  }

  async updateDepartment(id: number, data: Partial<{ name: string; isActive: boolean; order: number }>) {
    const response = await apiClient.put(`/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id: number) {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  }
}

export const facultyService = new FacultyService();
