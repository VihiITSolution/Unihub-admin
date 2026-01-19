'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { adminService, User } from '@/services/admin.service';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getUsers({
        role: roleFilter || undefined,
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
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await adminService.updateUserStatus(userId, { isActive: !currentStatus });
      if (response.success) {
        loadUsers();
      } else {
        alert(response.message || 'Failed to update user status');
      }
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        loadUsers();
      } else {
        alert(response.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user');
    }
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
      key: 'joined', 
      label: 'Joined',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => (
        <div className="flex space-x-2">
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
            onClick={() => handleDeleteUser(user.id)}
            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // Filter users by search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}


      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['', 'learner', 'tutor', 'vendor'].map((role) => (
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
               role === 'learner' ? 'Students' : 
               role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </nav>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={`Search ${roleFilter ? (roleFilter === 'learner' ? 'students' : roleFilter + 's') : 'users'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
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

        <Table columns={columns} data={filteredUsers} />

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
    </div>
  );
}
