"use client";

import { useEffect, useMemo, useState } from "react";
import { affiliateAdminService } from "@/services/affiliate.service";

const money = (value: number) => `LKR ${new Intl.NumberFormat("en-LK").format(Number(value) || 0)}`;
const pendingReferralStatuses = ["review", "held", "activity_detected"];

export default function AffiliateAdminPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"referrals" | "payouts">("referrals");
  const [filter, setFilter] = useState("all");
  const [bankDetails, setBankDetails] = useState<any | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [referralResponse, payoutResponse] = await Promise.all([affiliateAdminService.referrals(), affiliateAdminService.payouts()]);
      setReferrals(referralResponse.data?.referrals || []);
      setPayouts(payoutResponse.data?.payouts || []);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to load affiliate queues");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const referralAction = async (id: number, action: string) => {
    const reason = action === "reject" || action === "hold" ? window.prompt(`Reason to ${action} this referral (optional):`) || undefined : undefined;
    try { await affiliateAdminService.reviewReferral(id, action, reason); setNotice(`Referral ${action}d successfully.`); await load(); }
    catch (requestError: any) { setError(requestError?.response?.data?.message || `Could not ${action} referral`); }
  };
  const payoutAction = async (id: number, action: string) => {
    const reason = action === "reject" ? window.prompt("Reason for rejecting this payout (optional):") || undefined : undefined;
    try { await affiliateAdminService.reviewPayout(id, action, reason); setNotice(`Payout ${action}d successfully.`); await load(); }
    catch (requestError: any) { setError(requestError?.response?.data?.message || `Could not ${action} payout`); }
  };
  const markPaid = async (id: number) => {
    const transferReference = window.prompt("Bank transfer reference (optional):") || undefined;
    try { await affiliateAdminService.markPaid(id, transferReference); setNotice("Payout marked as paid."); await load(); }
    catch (requestError: any) { setError(requestError?.response?.data?.message || "Could not mark payout paid"); }
  };
  const viewBank = async (payout: any) => {
    try { const result = await affiliateAdminService.payoutDetail(payout.id); setBankDetails(result.data?.payout?.bankDetails || null); setSelectedPayout(payout); }
    catch (requestError: any) { setError(requestError?.response?.data?.message || "Could not load secure bank details"); }
  };

  const pendingReferrals = referrals.filter((referral) => pendingReferralStatuses.includes(referral.status)).length;
  const pendingPayouts = payouts.filter((payout) => payout.status === "pending").length;
  const paidTotal = payouts.filter((payout) => payout.status === "paid").reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
  const riskCount = [...referrals, ...payouts].filter((item) => item.riskFlags?.some((flag: any) => flag.status === "open")).length;
  const activeRows = useMemo(() => {
    const list = tab === "referrals" ? referrals : payouts;
    return filter === "all" ? list : list.filter((item) => item.status === filter);
  }, [filter, payouts, referrals, tab]);
  const filterOptions = tab === "referrals" ? ["all", "review", "held", "available", "rejected"] : ["all", "pending", "approved", "paid", "rejected"];

  return <main className="affiliate-admin-shell">
    <div className="affiliate-admin-page">
      <section className="admin-hero">
        <div className="hero-copy"><span>UniHub growth operations</span><h1>Affiliate command centre</h1><p>Approve genuine student referrals, investigate risk signals, and send completed rewards to the right bank account.</p></div>
        <button className="refresh-button" onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Refresh data"}</button>
      </section>

      {error && <div className="admin-alert error"><strong>Something needs attention</strong><span>{error}</span><button onClick={() => { setError(""); load(); }}>Try again</button></div>}
      {notice && <div className="admin-alert success"><strong>Done</strong><span>{notice}</span><button onClick={() => setNotice("")}>Dismiss</button></div>}

      <section className="metric-grid">
        <article className="metric-card accent"><span>Referral review</span><strong>{pendingReferrals}</strong><small>students waiting for a decision</small></article>
        <article className="metric-card"><span>Payout requests</span><strong>{pendingPayouts}</strong><small>bank transfers waiting to be approved</small></article>
        <article className="metric-card"><span>Risk signals</span><strong>{riskCount}</strong><small>open flags to check before approval</small></article>
        <article className="metric-card"><span>Paid out</span><strong>{money(paidTotal)}</strong><small>completed affiliate transfers</small></article>
      </section>

      <section className="operations-card">
        <header className="operations-header">
          <div className="queue-tabs"><button className={tab === "referrals" ? "active" : ""} onClick={() => { setTab("referrals"); setFilter("all"); }}>Referral queue <b>{referrals.length}</b></button><button className={tab === "payouts" ? "active" : ""} onClick={() => { setTab("payouts"); setFilter("all"); }}>Payout queue <b>{payouts.length}</b></button></div>
          <div className="status-filters">{filterOptions.map((option) => <button key={option} className={filter === option ? "selected" : ""} onClick={() => setFilter(option)}>{option === "all" ? "All" : option.replace("_", " ")}</button>)}</div>
        </header>

        {loading ? <div className="queue-loading"><i /> Loading the affiliate queues…</div> : tab === "referrals" ? <div className="queue-list">
          {activeRows.length ? activeRows.map((referral) => <article className="queue-row referral-row" key={referral.id}>
            <div className="profile-bubble">{referral.referred?.firstName?.charAt(0)}{referral.referred?.lastName?.charAt(0)}</div>
            <div className="queue-person"><strong>{referral.referred?.firstName} {referral.referred?.lastName}</strong><span>Referred by {referral.referrer?.firstName} {referral.referrer?.lastName}</span></div>
            <div className="queue-detail"><label>Qualifying activity</label><strong>{referral.activityType ? `${referral.activityType} activity` : "Awaiting activity"}</strong></div>
            <div className="queue-detail"><label>Submitted</label><strong>{new Date(referral.createdAt).toLocaleDateString("en-LK")}</strong></div>
            <div className="queue-status"><span className={`status-pill ${referral.status}`}>{referral.status.replace("_", " ")}</span>{referral.riskFlags?.some((flag: any) => flag.status === "open") && <span className="risk-pill">Risk flag</span>}</div>
            <div className="queue-actions">{pendingReferralStatuses.includes(referral.status) ? <><button className="approve" onClick={() => referralAction(referral.id, "approve")}>Approve</button><button className="hold" onClick={() => referralAction(referral.id, "hold")}>Hold</button><button className="reject" onClick={() => referralAction(referral.id, "reject")}>Reject</button></> : <span className="complete-text">No action needed</span>}</div>
          </article>) : <EmptyQueue title="No matching referrals" copy="There are no referrals in this status right now." />}
        </div> : <div className="queue-list">
          {activeRows.length ? activeRows.map((payout) => <article className="queue-row payout-row" key={payout.id}>
            <div className="profile-bubble payout">{payout.user?.firstName?.charAt(0)}{payout.user?.lastName?.charAt(0)}</div>
            <div className="queue-person"><strong>{payout.user?.firstName} {payout.user?.lastName}</strong><span>{payout.user?.email}</span></div>
            <div className="queue-detail"><label>Requested</label><strong>{money(payout.amount)}</strong></div>
            <div className="queue-detail"><label>Destination</label><strong>{payout.accountMask}</strong></div>
            <div className="queue-status"><span className={`status-pill ${payout.status}`}>{payout.status}</span>{payout.riskFlags?.some((flag: any) => flag.status === "open") && <span className="risk-pill">Risk flag</span>}</div>
            <div className="queue-actions"><button className="details" onClick={() => viewBank(payout)}>Bank details</button>{payout.status === "pending" && <><button className="approve" onClick={() => payoutAction(payout.id, "approve")}>Approve</button><button className="reject" onClick={() => payoutAction(payout.id, "reject")}>Reject</button></>}{payout.status === "approved" && <button className="paid" onClick={() => markPaid(payout.id)}>Mark paid</button>}{["paid", "rejected"].includes(payout.status) && <span className="complete-text">No action needed</span>}</div>
          </article>) : <EmptyQueue title="No matching payouts" copy="There are no payouts in this status right now." />}
        </div>}
      </section>

      {bankDetails && <section className="bank-inspector"><div><span>Secure payout details</span><h2>{selectedPayout?.user?.firstName} {selectedPayout?.user?.lastName}</h2><p>Only use these details to complete this approved UniHub payout.</p></div><button onClick={() => { setBankDetails(null); setSelectedPayout(null); }}>Close</button><div className="bank-data"><div><label>Account holder</label><strong>{bankDetails.accountHolderName}</strong></div><div><label>Bank & branch</label><strong>{bankDetails.bankName} · {bankDetails.branch}</strong></div><div><label>Account number</label><strong>{bankDetails.accountNumber}</strong></div></div></section>}
    </div>

    <style jsx>{`
      .affiliate-admin-shell { min-height: 100%; padding: 32px; background: #f4f7f8; }.affiliate-admin-page { max-width: 1380px; margin: 0 auto; }.admin-hero { display: flex; align-items: end; justify-content: space-between; gap: 20px; padding: 31px 34px; color: #fff; border-radius: 18px; background: linear-gradient(116deg, #18293a, #195c62); box-shadow: 0 14px 29px rgba(20,55,64,.18); }.hero-copy > span { color: #9de0cf; font-size: 11px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; }.hero-copy h1 { margin: 7px 0 6px; font-size: 32px; line-height: 1; letter-spacing: -.04em; }.hero-copy p { max-width: 650px; margin: 0; color: #d2e2e5; font-size: 13px; line-height: 1.55; }.refresh-button { min-height: 40px; padding: 0 14px; color: #fff; border: 1px solid rgba(255,255,255,.35); border-radius: 8px; background: rgba(255,255,255,.1); cursor: pointer; font-size: 12px; font-weight: 800; }.refresh-button:disabled { cursor: wait; opacity: .65; }.admin-alert { display: flex; align-items: center; gap: 9px; margin-top: 15px; padding: 11px 14px; border-radius: 9px; font-size: 12px; }.admin-alert button { margin-left: auto; border: 0; background: transparent; cursor: pointer; font-size: 12px; font-weight: 800; }.admin-alert.error { color: #9f2d2b; border: 1px solid #f2c3c0; background: #fff0ef; }.admin-alert.success { color: #176449; border: 1px solid #b9e5c8; background: #ebfbf1; }.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 19px 0; }.metric-card { padding: 19px 20px; border: 1px solid #e0e7e7; border-radius: 13px; background: #fff; }.metric-card span { display: block; color: #708082; font-size: 11px; font-weight: 900; letter-spacing: .07em; text-transform: uppercase; }.metric-card strong { display: block; margin: 8px 0 5px; color: #233333; font-size: 25px; letter-spacing: -.04em; }.metric-card small { color: #91a0a1; font-size: 11px; }.metric-card.accent { border-color: #0b6b5f; background: #0b6b5f; }.metric-card.accent span, .metric-card.accent strong { color: #fff; }.metric-card.accent small { color: #cce9df; }.operations-card { overflow: hidden; border: 1px solid #e0e7e7; border-radius: 15px; background: #fff; }.operations-header { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 16px 19px; border-bottom: 1px solid #e8eded; background: #fbfcfc; }.queue-tabs, .status-filters { display: flex; align-items: center; gap: 5px; }.queue-tabs button { padding: 9px 11px; color: #778584; border: 0; border-radius: 7px; background: transparent; cursor: pointer; font-size: 13px; font-weight: 800; }.queue-tabs button.active { color: #0b6b5f; background: #e7f6f0; }.queue-tabs b { display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: 4px; border-radius: 99px; background: currentColor; color: #fff; font-size: 10px; }.status-filters button { padding: 7px 9px; color: #758382; border: 1px solid transparent; border-radius: 999px; background: transparent; cursor: pointer; font-size: 11px; font-weight: 800; text-transform: capitalize; }.status-filters button.selected { color: #0b6b5f; border-color: #b7dace; background: #fff; }.queue-row { display: grid; grid-template-columns: 42px minmax(155px,1.3fr) minmax(105px,.85fr) minmax(95px,.72fr) minmax(100px,.75fr) minmax(210px,1.2fr); align-items: center; gap: 13px; padding: 15px 19px; border-bottom: 1px solid #edf0f0; }.queue-row:last-child { border-bottom: 0; }.queue-row:hover { background: #fcfdfd; }.profile-bubble { display: grid; place-items: center; width: 35px; height: 35px; color: #0b6b5f; border-radius: 11px; background: #e5f5ee; font-size: 12px; font-weight: 900; }.profile-bubble.payout { color: #6a4e11; background: #fff1c9; }.queue-person strong, .queue-detail strong { display: block; color: #2c3a39; font-size: 12px; }.queue-person span { display: block; overflow: hidden; margin-top: 4px; color: #8a9898; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.queue-detail label { display: block; margin-bottom: 5px; color: #9aa6a6; font-size: 9px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }.queue-status { display: flex; flex-wrap: wrap; gap: 5px; }.status-pill, .risk-pill { display: inline-flex; padding: 5px 7px; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: capitalize; white-space: nowrap; }.status-pill { color: #5c6b69; background: #eff2f2; }.status-pill.review, .status-pill.held, .status-pill.pending { color: #85600e; background: #fff3d1; }.status-pill.available, .status-pill.approved, .status-pill.paid { color: #176449; background: #e7f7ee; }.status-pill.rejected { color: #a92d2d; background: #fff0ef; }.risk-pill { color: #ab402b; background: #fff0e8; }.queue-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }.queue-actions button { min-height: 30px; padding: 0 8px; border-radius: 6px; cursor: pointer; font-size: 10px; font-weight: 900; }.queue-actions .approve { color: #fff; border: 1px solid #0b6b5f; background: #0b6b5f; }.queue-actions .hold { color: #88600b; border: 1px solid #ecd89e; background: #fff8e6; }.queue-actions .reject { color: #a42b2b; border: 1px solid #efc0bd; background: #fff4f3; }.queue-actions .details { color: #3a5454; border: 1px solid #d9e4e3; background: #fff; }.queue-actions .paid { color: #fff; border: 1px solid #1b5c86; background: #1b5c86; }.complete-text { color: #9aa5a5; font-size: 10px; font-weight: 700; }.queue-loading, .empty-queue { padding: 54px 20px; color: #889696; text-align: center; font-size: 13px; }.queue-loading i { display: inline-block; width: 14px; height: 14px; margin-right: 8px; vertical-align: -2px; border: 2px solid #d5dfdd; border-top-color: #0b6b5f; border-radius: 50%; animation: spin .7s linear infinite; }.empty-queue h3 { margin: 0 0 7px; color: #536361; font-size: 15px; }.empty-queue p { margin: 0; font-size: 12px; }.bank-inspector { display: grid; grid-template-columns: 1fr auto; gap: 16px; margin-top: 19px; padding: 21px; color: #f9ffff; border-radius: 14px; background: #1f3c43; }.bank-inspector > div > span { color: #a6dbcc; font-size: 10px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }.bank-inspector h2 { margin: 6px 0; font-size: 20px; }.bank-inspector p { margin: 0; color: #c5d7d9; font-size: 12px; }.bank-inspector > button { align-self: start; padding: 7px 9px; color: #fff; border: 1px solid rgba(255,255,255,.3); border-radius: 6px; background: transparent; cursor: pointer; font-size: 11px; font-weight: 800; }.bank-data { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 13px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.14); }.bank-data label { display: block; margin-bottom: 5px; color: #a4c2c2; font-size: 9px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }.bank-data strong { font-size: 13px; }
      @keyframes spin { to { transform: rotate(360deg); } }@media (max-width: 1180px) { .queue-row { grid-template-columns: 40px minmax(145px,1fr) minmax(100px,.8fr) minmax(96px,.7fr) minmax(95px,.7fr); }.queue-actions { grid-column: 2 / -1; justify-content: flex-start; }.metric-grid { grid-template-columns: repeat(2, 1fr); } }.@media (max-width: 700px) { .affiliate-admin-shell { padding: 16px; }.admin-hero { align-items: flex-start; flex-direction: column; padding: 25px 22px; }.hero-copy h1 { font-size: 28px; }.metric-grid { grid-template-columns: 1fr 1fr; gap: 9px; }.metric-card { padding: 15px; }.metric-card strong { font-size: 21px; }.operations-header { align-items: flex-start; flex-direction: column; }.status-filters { width: 100%; overflow-x: auto; padding-bottom: 2px; }.queue-row { grid-template-columns: 38px 1fr auto; gap: 10px; padding: 14px; }.queue-detail { display: none; }.queue-status { grid-column: 2 / 3; }.queue-actions { grid-column: 2 / -1; justify-content: flex-start; }.bank-inspector { grid-template-columns: 1fr; }.bank-inspector > button { justify-self: start; }.bank-data { grid-template-columns: 1fr; } }
    `}</style>
  </main>;
}

function EmptyQueue({ title, copy }: { title: string; copy: string }) {
  return <div className="empty-queue"><h3>{title}</h3><p>{copy}</p></div>;
}
