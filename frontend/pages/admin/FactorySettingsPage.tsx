import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Settings, Users, Shield, Lock } from 'lucide-react';

const FactorySettingsPage: React.FC = () => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
      return (
          <div className="flex flex-col items-center justify-center h-96 text-red-600">
              <Lock className="w-12 h-12 mb-4" />
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p>You do not have permission to view this page.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Factory Configuration</h1>
            <p className="text-gray-500">Manage tenant-wide settings, user roles, and audit standards.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-bold text-amber-800 mb-2">Development Mode</h3>
            <p className="text-amber-700 text-sm">
                This module is currently under development. In the future, this page will allow Tenant Admins to:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-amber-700 space-y-1">
                <li>Configure available audit types per zone</li>
                <li>Manage user roles and permissions (RBAC)</li>
                <li>Set up factory zones and coordinates for the Digital Twin</li>
                <li>Export compliance reports</li>
            </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-60 pointer-events-none">
                <Settings className="w-8 h-8 text-gray-400 mb-4" />
                <h3 className="font-bold text-gray-700">General Settings</h3>
                <p className="text-sm text-gray-500 mt-2">Configure timezone, units, and system notifications.</p>
            </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-60 pointer-events-none">
                <Users className="w-8 h-8 text-gray-400 mb-4" />
                <h3 className="font-bold text-gray-700">User Management</h3>
                <p className="text-sm text-gray-500 mt-2">Add/Remove users and assign departments.</p>
            </div>
             <div className="bg-white p-6 rounded-xl border border-gray-200 opacity-60 pointer-events-none">
                <Shield className="w-8 h-8 text-gray-400 mb-4" />
                <h3 className="font-bold text-gray-700">Audit Standards</h3>
                <p className="text-sm text-gray-500 mt-2">Define passing scores and critical failure thresholds.</p>
            </div>
        </div>
    </div>
  );
};

export default FactorySettingsPage;