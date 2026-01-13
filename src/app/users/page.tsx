'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

export default function UsersPage() {
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active', joined: '2024-01-10' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Student', status: 'Active', joined: '2024-01-09' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Inactive', joined: '2024-01-08' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'Active', joined: '2024-01-07' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Student', status: 'Active', joined: '2024-01-06' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'joined', label: 'Joined Date' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-2">Manage all registered users</p>
        </div>
        <Button variant="primary">Add New User</Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Roles</option>
              <option>Student</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
        <Table columns={columns} data={users} />
      </Card>
    </div>
  );
}
