'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Page Views',
      value: '45,823',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      trend: { value: 15, isPositive: true },
    },
    {
      title: 'Applications',
      value: '1,289',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      trend: { value: 3, isPositive: true },
    },
    {
      title: 'Avg. Session',
      value: '5m 32s',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: { value: 2, isPositive: false },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Platform performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Traffic Overview">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart Placeholder - Integrate with charting library</p>
          </div>
        </Card>

        <Card title="User Growth">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart Placeholder - Integrate with charting library</p>
          </div>
        </Card>
      </div>

      <Card title="Popular Universities">
        <div className="space-y-4">
          {[
            { name: 'University of Colombo', visits: 8432, percentage: 35 },
            { name: 'University of Moratuwa', visits: 6521, percentage: 27 },
            { name: 'University of Peradeniya', visits: 5234, percentage: 22 },
            { name: 'University of Kelaniya', visits: 3891, percentage: 16 },
          ].map((uni, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{uni.name}</span>
                <span className="text-sm text-gray-500">{uni.visits} visits</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${uni.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
