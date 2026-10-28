import { apiClient, ApiResponse } from "@/lib/api";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ProviderStatus = "not_provisioned" | "provisioning" | "ready" | "syncing" | "failed" | "cancelled";

export interface AdminLiveSession {
  id: number;
  tutorId: number;
  title: string;
  description?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: "scheduled" | "live" | "ended" | "recorded" | "cancelled";
  provider: "youtube" | "teams";
  approvalStatus: ApprovalStatus;
  providerStatus: ProviderStatus;
  rejectionReason?: string;
  allowRecording: boolean;
  recordingUrl?: string;
  tags?: string[];
  totalAttendees: number;
  tutor?: { id: number; firstName: string; lastName: string; email: string; tutorProfile?: { teamsEmail?: string } };
  meeting?: {
    syncStatus: string;
    lastError?: string;
    lastSyncedAt?: string;
    recordingWebUrl?: string;
    organizer?: { email: string; healthStatus: string; lastHealthCheckAt?: string };
  };
  enrollments?: Array<any>;
  events?: Array<any>;
  providerJobs?: Array<any>;
}

const message = (error: any, fallback: string) => error.response?.data?.message || fallback;

export const adminLiveSessionService = {
  async create(data: { tutorId: number; teamsEmail: string; title: string; description?: string; scheduledStartTime: string; scheduledEndTime: string; allowRecording: boolean }): Promise<ApiResponse<any>> {
    try { return (await apiClient.post("/admin/live-sessions", { ...data, isFree: true, price: 0 })).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to create session") }; }
  },
  async list(filters: Record<string, string | number | undefined> = {}): Promise<ApiResponse<{ sessions: AdminLiveSession[]; pagination: any }>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => value !== undefined && value !== "" && params.set(key, String(value)));
      return (await apiClient.get(`/admin/live-sessions?${params}`)).data;
    } catch (error: any) { return { success: false, message: message(error, "Failed to load live sessions") }; }
  },
  async calendar(from: string, to: string): Promise<ApiResponse<{ events: any[] }>> {
    try { return (await apiClient.get(`/admin/live-sessions/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to load calendar") }; }
  },
  async statistics(): Promise<ApiResponse<{ byApproval: Record<string, number>; failed: number; upcoming: number }>> {
    try { return (await apiClient.get("/admin/live-sessions/statistics")).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to load statistics") }; }
  },
  async health(): Promise<ApiResponse<any>> {
    try { return (await apiClient.get("/admin/live-sessions/health")).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to check organizer") }; }
  },
  async conflict(start: string, end: string, excludeId?: number): Promise<ApiResponse<{ conflict: boolean; conflictSessionId?: number; message?: string; bufferMinutes: number }>> {
    try {
      const params = new URLSearchParams({ start, end });
      if (excludeId) params.set("excludeId", String(excludeId));
      return (await apiClient.get(`/admin/live-sessions/conflicts?${params}`)).data;
    } catch (error: any) { return { success: false, message: message(error, "Failed to check organizer conflict") }; }
  },
  async detail(id: number): Promise<ApiResponse<{ session: AdminLiveSession; tutorIdentity: any }>> {
    try { return (await apiClient.get(`/admin/live-sessions/${id}`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to load session") }; }
  },
  async approve(id: number): Promise<ApiResponse<any>> {
    try { return (await apiClient.post(`/admin/live-sessions/${id}/approve`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to approve session") }; }
  },
  async reject(id: number, reason: string): Promise<ApiResponse<any>> {
    try { return (await apiClient.post(`/admin/live-sessions/${id}/reject`, { reason })).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to reject session") }; }
  },
  async action(id: number, action: "retry" | "sync-attendees" | "sync-artifacts" | "resend-invitation"): Promise<ApiResponse<any>> {
    try { return (await apiClient.post(`/admin/live-sessions/${id}/${action}`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Live-session action failed") }; }
  },
  async cancel(id: number, reason?: string): Promise<ApiResponse<any>> {
    try { return (await apiClient.delete(`/admin/live-sessions/${id}`, { data: { reason } })).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to cancel session") }; }
  },
  async remove(id: number): Promise<ApiResponse<any>> {
    try { return (await apiClient.delete(`/admin/live-sessions/${id}/permanent`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to permanently delete session") }; }
  },
  async update(id: number, changes: Partial<Pick<AdminLiveSession, "title" | "description" | "scheduledStartTime" | "scheduledEndTime" | "allowRecording">>): Promise<ApiResponse<any>> {
    try { return (await apiClient.put(`/admin/live-sessions/${id}`, changes)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to update session") }; }
  },
  async removeRecording(id: number): Promise<ApiResponse<any>> {
    try { return (await apiClient.delete(`/admin/live-sessions/${id}/recording`)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to remove recording") }; }
  },
  async updateRecording(id: number, changes: { title: string; description?: string; tags?: string[] }): Promise<ApiResponse<any>> {
    try { return (await apiClient.put(`/live-sessions/${id}/recording`, changes)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to update recording") }; }
  },
  async addRecordingToCourse(id: number, data: { courseId: number; title?: string; isPreview?: boolean }): Promise<ApiResponse<any>> {
    try { return (await apiClient.post(`/live-sessions/${id}/recording/course-content`, data)).data; }
    catch (error: any) { return { success: false, message: message(error, "Failed to add recording to course") }; }
  },
};
