'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

export default function CoursesPage() {
  const courses = [
    { id: '1', name: 'Computer Science', university: 'University of Colombo', duration: '4 Years', students: '320', status: 'Active' },
    { id: '2', name: 'Engineering', university: 'University of Moratuwa', duration: '4 Years', students: '450', status: 'Active' },
    { id: '3', name: 'Medicine', university: 'University of Peradeniya', duration: '5 Years', students: '280', status: 'Active' },
    { id: '4', name: 'Business Management', university: 'University of Kelaniya', duration: '3 Years', students: '390', status: 'Active' },
    { id: '5', name: 'Law', university: 'University of Colombo', duration: '3 Years', students: '220', status: 'Active' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Course Name' },
    { key: 'university', label: 'University' },
    { key: 'duration', label: 'Duration' },
    { key: 'students', label: 'Enrolled Students' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Manage all available courses</p>
        </div>
        <Button variant="primary">Add New Course</Button>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search courses..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Universities</option>
              <option>University of Colombo</option>
              <option>University of Moratuwa</option>
              <option>University of Peradeniya</option>
            </select>
          </div>
        </div>
        <Table columns={columns} data={courses} />
      </Card>
    </div>
  );
}
