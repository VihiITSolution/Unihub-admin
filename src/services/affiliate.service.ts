import { apiClient } from "@/lib/api";

export const affiliateAdminService = {
  async referrals(status?: string) { const r = await apiClient.get(`/admin/affiliate/referrals${status ? `?status=${encodeURIComponent(status)}` : ""}`); return r.data; },
  async reviewReferral(id: number, action: string, reason?: string) { const r = await apiClient.post(`/admin/affiliate/referrals/${id}/review`, { action, reason }); return r.data; },
  async payouts(status?: string) { const r = await apiClient.get(`/admin/affiliate/payouts${status ? `?status=${encodeURIComponent(status)}` : ""}`); return r.data; },
  async payoutDetail(id: number) { const r = await apiClient.get(`/admin/affiliate/payouts/${id}`); return r.data; },
  async reviewPayout(id: number, action: string, reason?: string) { const r = await apiClient.post(`/admin/affiliate/payouts/${id}/review`, { action, reason }); return r.data; },
  async markPaid(id: number, transferReference?: string) { const r = await apiClient.post(`/admin/affiliate/payouts/${id}/paid`, { transferReference }); return r.data; },
};
