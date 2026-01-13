'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-2">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-primary-50 text-primary-600 font-medium">
                General
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                Security
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                Notifications
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                Integrations
              </button>
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="General Settings">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  defaultValue="Unihub.lk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  rows={4}
                  defaultValue="University Hub for Sri Lankan Students"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@unihub.lk"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Asia/Colombo</option>
                  <option>UTC</option>
                  <option>Asia/Kolkata</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
