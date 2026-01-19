'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { adminService, Course } from '@/services/admin.service';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [publishedFilter, setPublishedFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
  }, [page, publishedFilter]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCourses({
        isPublished: publishedFilter === '' ? undefined : publishedFilter === 'true',
        page,
        limit: 10
      });

      if (response.success && response.data) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Failed to load courses');
      }
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Course Title' },
    { 
      key: 'tutor', 
      label: 'Tutor',
      render: (course: Course) => course.tutor 
        ? `${course.tutor.firstName} ${course.tutor.lastName}` 
        : 'N/A'
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (course: Course) => `$${Number(course.price).toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (course: Course) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {course.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    { 
      key: 'enrollments', 
      label: 'Enrollments',
      render: (course: Course) => course.enrollmentCount || 0
    },
    { 
      key: 'created', 
      label: 'Created',
      render: (course: Course) => new Date(course.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course: Course) => (
        <button
          onClick={() => router.push(`/courses/review/${course.id}`)}
          className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          View / Manage
        </button>
      )
    }
  ];

  // Filter courses by search query
  const filteredCourses = courses.filter(course => {
    if (!searchQuery) return true;
    return course.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Manage all available courses</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select 
              value={publishedFilter}
              onChange={(e) => {
                setPublishedFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <button 
            onClick={loadCourses}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        <Table columns={columns} data={filteredCourses} />

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
