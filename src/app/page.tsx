'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import { adminService, Statistics } from '@/services/admin.service';

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        setError(response.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = statistics ? [
    {
      title: 'Total Users',
      value: statistics.users.total.toLocaleString(),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      trend: { value: statistics.users.learners, isPositive: true, label: `${statistics.users.learners.toLocaleString()} learners` },
    },
    {
      title: 'Tutors',
      value: statistics.users.tutors.toLocaleString(),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      trend: { value: 0, isPositive: true, label: 'Active teaching community' },
    },
    {
      title: 'Active Courses',
      value: statistics.courses.published.toLocaleString(),
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      trend: { value: statistics.courses.total - statistics.courses.published, isPositive: false, label: `${(statistics.courses.total - statistics.courses.published).toLocaleString()} awaiting publication` },
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${statistics.payments.revenue.toLocaleString()}`,
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: statistics.payments.total, isPositive: true, label: `${statistics.payments.total.toLocaleString()} payments processed` },
    },
  ] : [];

  const recentActivities = [
    { user: 'Loading...', action: '-', university: '-', date: '-' },
  ];

  const columns = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'university', label: 'University' },
    { key: 'date', label: 'Date' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadStatistics}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary-600">Platform command center</p>
          <h1 className="page-heading">Good to see you</h1>
          <p className="page-subtitle">Review platform health and take care of the work that needs attention.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/courses/pending" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">Review courses</Link>
          <Link href="/tutors/pending" className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">Tutor applications</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card title="Platform overview" className="xl:col-span-3">
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3 first:pt-0">
              <span className="text-sm text-slate-600">Total enrollments</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">{statistics?.enrollments.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-600">Marketplace items</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">{statistics?.marketplace.totalItems.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-600">Total payments</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">{statistics?.payments.total.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between pb-0 pt-3">
              <span className="text-sm text-slate-600">Total courses</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">{statistics?.courses.total.toLocaleString() || 0}</span>
            </div>
          </div>
        </Card>

        <Card title="System status" className="xl:col-span-2">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API server</span>
              <span className="flex items-center text-sm font-medium text-emerald-600">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database</span>
              <span className="flex items-center text-sm font-medium text-emerald-600">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Storage</span>
              <span className="flex items-center text-sm font-medium text-emerald-600">
                <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
