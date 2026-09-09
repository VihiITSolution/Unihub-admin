'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { adminService, AdminUserDetails, User } from '@/services/admin.service';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<AdminUserDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getUsers({
        role: roleFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'active',
        search: searchQuery.trim() || undefined,
        page,
        limit: 10
      });

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 300);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      setError(null);
      setNotice(null);
      const response = await adminService.updateUserStatus(userId, { isActive: !currentStatus });
      if (response.success) {
        setNotice(`User ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
        await loadUsers();
      } else {
        setError(response.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleVerification = async (user: User) => {
    try {
      setError(null);
      setNotice(null);
      const response = await adminService.updateUserStatus(user.id, { isVerified: !user.isVerified });
      if (response.success) {
        setNotice(`User marked as ${user.isVerified ? 'unverified' : 'verified'}.`);
        await loadUsers();
      } else {
        setError(response.message || 'Failed to update verification');
      }
    } catch (err) {
      setError('Failed to update verification');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setError(null);
      setNotice(null);
      const response = await adminService.deleteUser(userToDelete.id);
      if (response.success) {
        setNotice('User deleted successfully.');
        setUserToDelete(null);
        await loadUsers();
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const openUserDetails = async (user: User) => {
    setSelectedUser(user);
    setUserDetails(null);
    setIsDetailsLoading(true);
    try {
      const response = await adminService.getUserDetails(user.id);
      if (response.success && response.data) {
        setUserDetails(response.data);
      } else {
        setError(response.message || 'Failed to load user details');
      }
    } catch {
      setError('Failed to load user details');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (user: User) => `${user.firstName} ${user.lastName}`
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.primaryRole === 'admin' ? 'bg-purple-100 text-purple-800' :
          user.primaryRole === 'tutor' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.primaryRole || user.role || 'learner'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'verification',
      label: 'Verification',
      render: (user: User) => (
        <div className="flex flex-col gap-1 text-xs">
          <span className={user.phoneVerifiedAt ? 'text-green-700' : 'text-gray-500'}>
            Mobile: {user.phoneVerifiedAt ? 'verified' : 'not verified'}
          </span>
          {user.studentProfile && (
            <span className={user.studentProfile.studentEmailVerifiedAt ? 'text-green-700' : 'text-gray-500'}>
              Student email: {user.studentProfile.studentEmailVerifiedAt ? 'confirmed' : 'not confirmed'}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'joined', 
      label: 'Joined',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openUserDetails(user)}
            className="rounded bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 hover:bg-primary-200"
          >
            Details
          </button>
          <button
            onClick={() => handleToggleStatus(user.id, user.isActive)}
            className={`px-3 py-1 rounded text-xs font-medium ${
              user.isActive 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleVerification(user)}
            className={`px-3 py-1 rounded text-xs font-medium ${user.isVerified ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
          >
            {user.isVerified ? 'Unverify' : 'Verify'}
          </button>
          <button
            onClick={() => setUserToDelete(user)}
            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage all registered users</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {notice}
        </div>
      )}


      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['', 'student', 'tutor', 'vendor', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => {
                setRoleFilter(role);
                setPage(1);
              }}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${roleFilter === role
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {role === '' ? 'All Users' : 
               role === 'student' ? 'Students' :
               role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Search ${roleFilter ? (roleFilter === 'student' ? 'students' : roleFilter + 's') : 'users'}...`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All account statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button 
            onClick={loadUsers}
            className="ml-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <Table columns={columns} data={users} />

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="user-details-title">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Account review</p>
                <h2 id="user-details-title" className="mt-1 text-2xl font-bold text-slate-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{selectedUser.email} · User #{selectedUser.id}</p>
              </div>
              <button type="button" onClick={closeUserDetails} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close user details">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {isDetailsLoading && (
                <div className="flex min-h-64 items-center justify-center text-slate-600">
                  <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /> Loading account activity…
                </div>
              )}

              {!isDetailsLoading && !userDetails && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">User details could not be loaded. Please try again.</div>
              )}

              {userDetails && (() => {
                const { user, activities } = userDetails;
                const date = (value?: string) => value ? new Date(value).toLocaleDateString() : '—';
                const statusClass = (value?: string) => value === 'approved' || value === 'available' || value === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : value === 'rejected' || value === 'reversed' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
                const summaryCards = [
                  ['Courses', activities.summary.courses],
                  ['Videos', activities.summary.videos],
                  ['Marketplace', activities.summary.marketplaceListings],
                  ['Boarding', activities.summary.boardingListings],
                  ['Learning', activities.summary.enrollments],
                  ['Referrals', activities.summary.referralsMade],
                ];
                return (
                  <div className="space-y-6">
                    <section className="rounded-2xl bg-gradient-to-r from-primary-700 to-teal-700 p-5 text-white">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">{user.primaryRole || 'student'} account</p>
                          <p className="mt-1 text-sm text-white/80">Joined {date(user.createdAt)} · Last login {date(user.lastLogin)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-white/15 px-3 py-1.5">{user.isActive ? 'Active' : 'Inactive'}</span>
                          <span className="rounded-full bg-white/15 px-3 py-1.5">{user.phoneVerifiedAt ? 'Mobile verified' : 'Mobile pending'}</span>
                          <span className="rounded-full bg-white/15 px-3 py-1.5">{user.isVerified ? 'Account verified' : 'Account unverified'}</span>
                        </div>
                      </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                      {summaryCards.map(([label, count]) => (
                        <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                          <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
                        </div>
                      ))}
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="font-bold text-slate-900">Profile and verification</h3>
                        <dl className="mt-4 grid grid-cols-1 gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                          <div><dt className="text-slate-500">Mobile</dt><dd className="font-medium text-slate-900">{user.verifiedPhoneNumber || user.phoneNumber || 'Not provided'}</dd></div>
                          <div><dt className="text-slate-500">Roles</dt><dd className="font-medium text-slate-900">{user.roles?.join(', ') || user.primaryRole || 'student'}</dd></div>
                          <div><dt className="text-slate-500">Student profile</dt><dd className="font-medium text-slate-900">{user.isStudentProfileComplete ? 'Complete' : 'Incomplete'}</dd></div>
                          <div><dt className="text-slate-500">Tutor profile</dt><dd className="font-medium text-slate-900">{user.tutorProfile?.approvalStatus || (user.isTutorProfileComplete ? 'Complete' : 'Not started')}</dd></div>
                        </dl>
                        {user.studentProfile && (
                          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm">
                            <p className="font-semibold text-slate-800">Student information</p>
                            <p className="mt-2 text-slate-600">{user.studentProfile.customUniversity || user.studentProfile.universityName || 'University not set'} · {user.studentProfile.customDepartment || user.studentProfile.department || 'Department not set'}</p>
                            <p className="mt-1 text-slate-600">{user.studentProfile.degreeOrCourse || 'Course not set'} · Year {user.studentProfile.currentYear || '—'}, semester {user.studentProfile.currentSemester || '—'}</p>
                            <p className="mt-1 text-slate-600">Student email: {user.studentProfile.studentEmail || 'Not provided'} {user.studentProfile.studentEmailVerifiedAt ? '(confirmed)' : ''}</p>
                          </div>
                        )}
                        {user.tutorProfile && (
                          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">Tutor information</p>
                            <p className="mt-1">{user.tutorProfile.yearsOfExperience || 0} years experience · {user.tutorProfile.totalStudents || 0} students</p>
                            {!!user.tutorProfile.expertiseAreas?.length && <p className="mt-1">{user.tutorProfile.expertiseAreas.join(', ')}</p>}
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="font-bold text-slate-900">Affiliate activity</h3>
                        {activities.affiliate.account ? (
                          <div className="mt-4 rounded-lg bg-primary-50 p-4 text-sm text-primary-950">
                            <p className="font-semibold">Referral code: {activities.affiliate.account.referralCode}</p>
                            <p className="mt-1">Link status: {activities.affiliate.account.isActive ? 'Active' : 'Inactive'}</p>
                          </div>
                        ) : <p className="mt-4 text-sm text-slate-500">No affiliate account has been created.</p>}
                        {activities.affiliate.referredBy && (
                          <p className="mt-4 text-sm text-slate-600">Referred by <span className="font-semibold text-slate-900">{activities.affiliate.referredBy.referrer?.firstName} {activities.affiliate.referredBy.referrer?.lastName}</span> · {activities.affiliate.referredBy.status}</p>
                        )}
                        <div className="mt-4 space-y-2">
                          {activities.affiliate.referralsMade.slice(0, 6).map((referral) => (
                            <div key={referral.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                              <span className="min-w-0 truncate text-slate-700">{referral.referred ? `${referral.referred.firstName} ${referral.referred.lastName}` : `Referral #${referral.id}`}{referral.activityType ? ` · ${referral.activityType}` : ''}</span>
                              <span className={`ml-2 shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${statusClass(referral.status)}`}>{referral.status}</span>
                            </div>
                          ))}
                          {!activities.affiliate.referralsMade.length && <p className="text-sm text-slate-500">No referrals made yet.</p>}
                        </div>
                        {!!activities.affiliate.payoutRequests.length && <p className="mt-4 text-xs text-slate-500">Latest payout: LKR {activities.affiliate.payoutRequests[0].amount.toLocaleString()} · {activities.affiliate.payoutRequests[0].status} · {activities.affiliate.payoutRequests[0].accountMask}</p>}
                      </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="font-bold text-slate-900">Teaching and video activity</h3>
                        <div className="mt-4 space-y-2">
                          {activities.courses.map((course) => <div key={course.id} className="rounded-lg border border-slate-100 p-3 text-sm"><p className="font-medium text-slate-900">{course.title}</p><p className="mt-1 text-slate-500">{course.approvalStatus || 'draft'} · {course.isPublished ? 'Published' : 'Not published'} · {date(course.createdAt)}</p></div>)}
                          {!activities.courses.length && <p className="text-sm text-slate-500">No courses created.</p>}
                        </div>
                        {!!activities.videoLessons.length && <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-sm font-semibold text-slate-700">Recent videos</p>{activities.videoLessons.slice(0, 6).map((video) => <p key={video.id} className="mt-2 text-sm text-slate-600">{video.title} · {video.duration || 0} min · {video.course?.title || 'Course unavailable'}</p>)}</div>}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <h3 className="font-bold text-slate-900">Listings and learning activity</h3>
                        <div className="mt-4 space-y-2">
                          {activities.marketplaceListings.map((item) => <div key={`market-${item.id}`} className="rounded-lg border border-slate-100 p-3 text-sm"><p className="font-medium text-slate-900">Marketplace · {item.title}</p><p className="mt-1 text-slate-500">{item.approvalStatus} · LKR {Number(item.price || 0).toLocaleString()} · {date(item.createdAt)}</p></div>)}
                          {activities.boardingListings.map((place) => <div key={`boarding-${place.id}`} className="rounded-lg border border-slate-100 p-3 text-sm"><p className="font-medium text-slate-900">Boarding · {place.title}</p><p className="mt-1 text-slate-500">{place.city || 'Location not set'} · {place.approvalStatus} · {date(place.createdAt)}</p></div>)}
                          {!activities.marketplaceListings.length && !activities.boardingListings.length && <p className="text-sm text-slate-500">No marketplace or boarding listings.</p>}
                        </div>
                        {!!activities.enrollments.length && <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-sm font-semibold text-slate-700">Recent learning</p>{activities.enrollments.slice(0, 6).map((enrollment) => <p key={enrollment.id} className="mt-2 text-sm text-slate-600">{enrollment.course?.title || 'Course unavailable'} · {enrollment.progress || 0}% · {enrollment.status}</p>)}</div>}
                      </div>
                    </section>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 id="delete-user-title" className="text-xl font-bold text-gray-900">Permanently delete user?</h2>
            <p className="mt-3 text-gray-600">
              {userToDelete.firstName} {userToDelete.lastName} ({userToDelete.email}) will be deleted. This cannot be undone and may be blocked when related records must be retained.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setUserToDelete(null)} className="rounded-lg border border-gray-300 px-4 py-2">Cancel</button>
              <button type="button" onClick={handleDeleteUser} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">Delete user</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
