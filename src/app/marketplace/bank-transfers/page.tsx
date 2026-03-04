"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import Link from "next/link";

interface BankTransferPayment {
  id: number;
  amount: number;
  currency: string;
  method: string;
  status: string;
  proofImage?: string;
  transactionDate?: string;
  transactionReference?: string;
  createdAt: string;
  marketplaceItem?: {
    id: number;
    title: string;
    price: number;
    seller?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function BankTransfersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<BankTransferPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<BankTransferPayment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || (user.roles && !user.roles.includes("admin"))) {
      router.push("/login");
      return;
    }
    loadPendingTransfers();
  }, [user]);

  const loadPendingTransfers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingBankTransfers();
      if (response.success && response.data) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Failed to load bank transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: BankTransferPayment) => {
    if (!confirm("Verify this bank transfer payment?")) return;

    try {
      setProcessing(true);
      const response = await adminService.verifyBankTransfer(payment.id);
      if (response.success) {
        alert("Payment verified successfully!");
        await loadPendingTransfers();
      } else {
        alert(response.message || "Failed to verify payment");
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);
      alert(error.message || "Failed to verify payment");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (payment: BankTransferPayment) => {
    setSelectedPayment(payment);
    setRejectionReason("");
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessing(true);
      const response = await adminService.rejectBankTransfer(selectedPayment.id, rejectionReason);
      if (response.success) {
        alert("Payment rejected successfully!");
        setShowModal(false);
        setSelectedPayment(null);
        await loadPendingTransfers();
      } else {
        alert(response.message || "Failed to reject payment");
      }
    } catch (error: any) {
      console.error("Failed to reject payment:", error);
      alert(error.message || "Failed to reject payment");
    } finally {
      setProcessing(false);
    }
  };

  const [viewingProof, setViewingProof] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">Loading bank transfers...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bank Transfer Verification</h1>
          <p className="text-gray-600">Review and verify pending bank transfer payments</p>
        </div>
        <Link
          href="/marketplace"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Marketplace
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
          <div className="text-sm text-yellow-600 mb-1">Pending Verification</div>
          <div className="text-2xl font-bold text-yellow-800">{payments.length}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <div className="text-sm text-blue-600 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-blue-800">
            ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Oldest Pending</div>
          <div className="text-sm font-semibold text-gray-800">
            {payments.length > 0
              ? new Date(payments[0].createdAt).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
          <p className="text-gray-600">No pending bank transfers to verify</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Payment Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {payment.marketplaceItem?.title || "Unknown Item"}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Payment ID: #{payment.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        ${payment.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{payment.currency}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Vendor</div>
                      <div className="font-medium">
                        {payment.marketplaceItem?.seller
                          ? `${payment.marketplaceItem.seller.firstName} ${payment.marketplaceItem.seller.lastName}`
                          : "Unknown"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.marketplaceItem?.seller?.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Item Price</div>
                      <div className="font-medium">
                        ${payment.marketplaceItem?.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Transaction Date</div>
                      <div className="text-sm">
                        {payment.transactionDate
                          ? new Date(payment.transactionDate).toLocaleDateString()
                          : "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Reference</div>
                      <div className="text-sm font-mono">
                        {payment.transactionReference || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Submitted</div>
                    <div className="text-sm">
                      {new Date(payment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Proof Image */}
                <div className="lg:w-80">
                  <div className="text-xs text-gray-500 mb-2">Payment Proof</div>
                  {payment.proofImage ? (
                    <div className="relative">
                      <img
                        src={payment.proofImage}
                        alt="Payment proof"
                        className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setViewingProof(payment.proofImage || null)}
                      />
                      <div className="text-xs text-center text-gray-500 mt-1">
                        Click to view full size
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📄</div>
                        <div className="text-sm">No proof image</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => handleVerify(payment)}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  ✓ Verify Payment
                </button>
                <button
                  onClick={() => handleRejectClick(payment)}
                  disabled={processing}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  ✗ Reject Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Payment</h3>
            <p className="text-gray-600 mb-4">
              Rejecting payment for "{selectedPayment.marketplaceItem?.title}". Please provide a
              reason:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-3 mb-4"
              placeholder="e.g., Invalid proof, amount mismatch, fake receipt, etc."
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Reject Payment"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPayment(null);
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

      {/* Image Viewer Modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingProof(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={viewingProof}
              alt="Payment proof - full size"
              className="w-full h-auto rounded-lg"
            />
            <div className="text-center mt-4">
              <button
                onClick={() => setViewingProof(null)}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
