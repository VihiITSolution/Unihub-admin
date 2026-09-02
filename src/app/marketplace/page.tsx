"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import type { MarketplaceItem } from "@/services/admin.service";
import Link from "next/link";
import { ConfirmDialog, FeedbackBanner } from "@/components/ui/ActionFeedback";

export default function AdminMarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(
    null,
  );
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [approveItem, setApproveItem] = useState<MarketplaceItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MarketplaceItem | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!user || (user.roles && !user.roles.includes("admin"))) {
      router.push("/login");
      return;
    }
    loadItems();
  }, [user]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await adminService.getMarketplaceItems({
        page: 1,
        limit: 100,
      });
      if (response.success && response.data && response.data.items) {
        setItems(response.data.items);
      }
    } catch (error) {
      console.error("Failed to load marketplace items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: MarketplaceItem) => {
    setApproveItem(item);
  };

  const confirmApprove = async () => {
    if (!approveItem) return;
    try {
      setProcessing(true);
      setFeedback(null);
      const response = await adminService.approveMarketplaceItem(approveItem.id);
      if (response.success) {
        setFeedback({ message: "Marketplace listing approved successfully.", tone: "success" });
        setApproveItem(null);
        await loadItems();
      } else {
        setFeedback({ message: response.message || "Failed to approve item", tone: "error" });
      }
    } catch (error: any) {
      setFeedback({ message: error.message || "Failed to approve item", tone: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setRejectionReason("");
    setShowApprovalModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setProcessing(true);
      setFeedback(null);
      const response = await adminService.deleteMarketplaceItem(deleteItem.id);
      if (response.success) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== deleteItem.id),
        );
        setFeedback({
          message: "Marketplace listing deleted successfully.",
          tone: "success",
        });
        setDeleteItem(null);
      } else {
        setFeedback({
          message: response.message || "Failed to delete item",
          tone: "error",
        });
      }
    } catch (error: any) {
      setFeedback({
        message: error.message || "Failed to delete item",
        tone: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      setFeedback({ message: "Please provide a reason for rejection.", tone: "error" });
      return;
    }

    try {
      setProcessing(true);
      setFeedback(null);
      const response = await adminService.rejectMarketplaceItem(
        selectedItem.id,
        rejectionReason,
      );
      if (response.success) {
        setFeedback({ message: "Marketplace listing rejected successfully.", tone: "success" });
        setShowApprovalModal(false);
        setSelectedItem(null);
        await loadItems();
      } else {
        setFeedback({ message: response.message || "Failed to reject item", tone: "error" });
      }
    } catch (error: any) {
      setFeedback({ message: error.message || "Failed to reject item", tone: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (item: MarketplaceItem) => {
    if ((item as any).isFreeTrialAd) {
      if (item.approvalStatus === 'pending') {
        return (
          <span className="flex gap-1">
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Free Trial</span>
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
          </span>
        );
      }
      if (item.approvalStatus === 'approved') {
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Free Trial</span>;
      }
    }

    if (!item.requiresPayment) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
          Free
        </span>
      );
    }

    if (!item.isPaid) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          Unpaid
        </span>
      );
    }

    switch (item.approvalStatus) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const isPendingReview = (item: MarketplaceItem) =>
    item.approvalStatus === 'pending' && (item.isPaid || (item as any).isFreeTrialAd);

  const filteredItems = items.filter((item) => {
    if (filter === "pending") return isPendingReview(item);
    if (filter === "approved") return item.approvalStatus === "approved";
    if (filter === "rejected") return item.approvalStatus === "rejected";
    return true;
  });

  const pendingCount = items.filter(isPendingReview).length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading marketplace items...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {feedback && <div className="mb-6"><FeedbackBanner message={feedback.message} tone={feedback.tone} /></div>}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace Management</h1>
          <p className="text-gray-600">Review and moderate vendor listings</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/marketplace/bank-transfers"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Bank Transfers
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="text-sm text-gray-600 mb-1">Total Items</div>
          <div className="text-2xl font-bold">{items.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
          <div className="text-sm text-yellow-600 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-800">
            {pendingCount}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-800">
            {items.filter((i) => i.approvalStatus === "approved").length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-6 border border-red-200">
          <div className="text-sm text-red-600 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-800">
            {items.filter((i) => i.approvalStatus === "rejected").length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "approved"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved (
          {items.filter((i) => i.approvalStatus === "approved").length})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === "rejected"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Rejected (
          {items.filter((i) => i.approvalStatus === "rejected").length})
        </button>
      </div>

      {/* Items Table */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-gray-600">
            No marketplace items match the current filter
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.seller && (
                      <div>
                        <div className="font-medium">
                          {item.seller.firstName} {item.seller.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.seller.email}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">
                      {Number(item.price) === 0 ? "FREE" : `Rs. ${item.price}`}
                    </div>
                    {(item as any).isFreeTrialAd ? (
                      <div className="text-xs text-purple-600 font-medium">Ad fee: Free (3-month trial)</div>
                    ) : item.requiresPayment && item.adFee ? (
                      <div className="text-xs text-gray-500">Fee: Rs. {item.adFee}</div>
                    ) : null}
                    {item.approvalStatus === 'approved' && (item as any).expiresAt && (
                      <div className="text-xs text-gray-400">
                        Expires: {new Date((item as any).expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(item)}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {isPendingReview(item) && (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={processing}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(item)}
                            disabled={processing}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setDeleteItem(item)}
                        disabled={processing}
                        className="px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                    {item.approvalStatus === "rejected" &&
                      item.rejectionReason && (
                        <div
                          className="mt-2 text-xs text-red-600"
                          title={item.rejectionReason}
                        >
                          View reason
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {showApprovalModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Listing</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject "{selectedItem.title}". Please provide a
              reason:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 mb-4"
              placeholder="e.g., Inappropriate content, violates policy, etc."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Reject Item"}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedItem(null);
                }}
                disabled={processing}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(approveItem)}
        title="Approve marketplace listing?"
        description={`Approve “${approveItem?.title || "this listing"}” and make it available according to its current listing settings?`}
        confirmLabel="Approve listing"
        processing={processing}
        onCancel={() => setApproveItem(null)}
        onConfirm={confirmApprove}
      />
      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete marketplace listing?"
        description={`Permanently delete “${deleteItem?.title || "this listing"}”? This action cannot be undone.`}
        confirmLabel="Delete listing"
        processing={processing}
        tone="danger"
        onCancel={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
