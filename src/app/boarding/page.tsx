"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import type { BoardingPlace } from "@/services/admin.service";

export default function AdminBoardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<BoardingPlace[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedPlace, setSelectedPlace] = useState<BoardingPlace | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || (user.roles && !user.roles.includes("admin"))) {
      router.push("/login");
      return;
    }
    loadPlaces();
  }, [user]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBoardingPlaces({ page: 1, limit: 100 });
      if (response.success && response.data?.places) {
        setPlaces(response.data.places);
      }
    } catch (error) {
      console.error("Failed to load boarding places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (place: BoardingPlace) => {
    if (!confirm(`Approve listing "${place.title}"?`)) return;
    try {
      setProcessing(true);
      const response = await adminService.approveBoardingPlace(place.id);
      if (response.success) {
        alert("Boarding place approved successfully!");
        await loadPlaces();
      } else {
        alert(response.message || "Failed to approve");
      }
    } catch (error: any) {
      alert(error.message || "Failed to approve");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (place: BoardingPlace) => {
    setSelectedPlace(place);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedPlace || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setProcessing(true);
      const response = await adminService.rejectBoardingPlace(selectedPlace.id, rejectionReason);
      if (response.success) {
        alert("Boarding place rejected.");
        setShowRejectModal(false);
        setSelectedPlace(null);
        await loadPlaces();
      } else {
        alert(response.message || "Failed to reject");
      }
    } catch (error: any) {
      alert(error.message || "Failed to reject");
    } finally {
      setProcessing(false);
    }
  };

  const isPendingReview = (place: BoardingPlace) =>
    place.approvalStatus === "pending" && (place.isPaid || place.isFreeTrialAd);

  const filteredPlaces = places.filter((p) => {
    if (filter === "pending") return isPendingReview(p);
    if (filter === "approved") return p.approvalStatus === "approved";
    if (filter === "rejected") return p.approvalStatus === "rejected";
    return true;
  });

  const pendingCount = places.filter(isPendingReview).length;

  const getStatusBadge = (place: BoardingPlace) => {
    if (place.isFreeTrialAd && place.approvalStatus === "pending") {
      return (
        <span className="flex gap-1">
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Free Trial</span>
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
        </span>
      );
    }
    if (place.isFreeTrialAd && place.approvalStatus === "approved") {
      return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Free Trial</span>;
    }
    switch (place.approvalStatus) {
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case "approved":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading boarding places...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Boarding Management</h1>
        <p className="text-gray-600">Review and moderate boarding place listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="text-sm text-gray-600 mb-1">Total Listings</div>
          <div className="text-2xl font-bold">{places.length}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
          <div className="text-sm text-yellow-600 mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-6 border border-green-200">
          <div className="text-sm text-green-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-800">
            {places.filter((p) => p.approvalStatus === "approved").length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-6 border border-red-200">
          <div className="text-sm text-red-600 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-800">
            {places.filter((p) => p.approvalStatus === "rejected").length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {[
          { value: "all", label: `All (${places.length})` },
          { value: "pending", label: `Pending (${pendingCount})` },
          { value: "approved", label: `Approved (${places.filter((p) => p.approvalStatus === "approved").length})` },
          { value: "rejected", label: `Rejected (${places.filter((p) => p.approvalStatus === "rejected").length})` },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={`px-4 py-2 font-medium border-b-2 ${
              filter === tab.value
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-gray-600">No boarding places match the current filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Listing</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Vendor</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{place.title}</div>
                    <div className="text-sm text-gray-500 capitalize">{place.roomType} · {place.genderPreference}</div>
                    <div className="text-xs text-gray-400">{place.capacity} capacity</div>
                  </td>
                  <td className="px-6 py-4">
                    {place.vendor && (
                      <div>
                        <div className="font-medium">{place.vendor.firstName} {place.vendor.lastName}</div>
                        <div className="text-sm text-gray-600">{place.vendor.email}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{place.city}{place.district && `, ${place.district}`}</div>
                    {place.nearestUniversity && (
                      <div className="text-xs text-gray-500">Near {place.nearestUniversity}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">Rs. {place.monthlyRent}/mo</div>
                    {place.isFreeTrialAd ? (
                      <div className="text-xs text-purple-600 font-medium">Ad: Free (3-month trial)</div>
                    ) : (
                      <div className="text-xs text-gray-500">Ad fee: Rs. {place.adFee}</div>
                    )}
                    {place.approvalStatus === "approved" && place.expiresAt && (
                      <div className="text-xs text-gray-400">
                        Expires: {new Date(place.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(place)}</td>
                  <td className="px-6 py-4 text-sm">{new Date(place.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {isPendingReview(place) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(place)}
                          disabled={processing}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(place)}
                          disabled={processing}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {place.approvalStatus === "rejected" && place.rejectionReason && (
                      <div className="text-xs text-red-600" title={place.rejectionReason}>
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
      {showRejectModal && selectedPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Listing</h3>
            <p className="text-gray-600 mb-4">
              You are about to reject "{selectedPlace.title}". Please provide a reason:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 mb-4"
              placeholder="e.g., Inappropriate content, inaccurate information, etc."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Reject Listing"}
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setSelectedPlace(null); }}
                disabled={processing}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
