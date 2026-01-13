'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

export default function UniversitiesPage() {
  const universities = [
    { id: '1', name: 'University of Colombo', location: 'Colombo', students: '12,000', courses: '45', status: 'Active' },
    { id: '2', name: 'University of Moratuwa', location: 'Moratuwa', students: '9,500', courses: '38', status: 'Active' },
    { id: '3', name: 'University of Peradeniya', location: 'Peradeniya', students: '11,200', courses: '52', status: 'Active' },
    { id: '4', name: 'University of Kelaniya', location: 'Kelaniya', students: '10,800', courses: '41', status: 'Active' },
    { id: '5', name: 'University of Jaffna', location: 'Jaffna', students: '7,300', courses: '36', status: 'Active' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'University Name' },
    { key: 'location', label: 'Location' },
    { key: 'students', label: 'Total Students' },
    { key: 'courses', label: 'Courses' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-600 mt-2">Manage all registered universities</p>
        </div>
        <Button variant="primary">Add New University</Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search universities..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <Table columns={columns} data={universities} />
      </Card>
    </div>
  );
}
