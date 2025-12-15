import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminRole } from '../../types';
import ChecklistManager from '../../components/ChecklistManager';
import AuditApprovalQueue from '../../components/AuditApprovalQueue';
import { Shield, FileText, Users, AlertCircle, BarChart2, Briefcase } from 'lucide-react';
import FactorySettingsPage from './FactorySettingsPage'; // Reuse existing component

// Placeholder for User Management (Module 4 Tab 4)
const UsersAdmin = () => (
    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
        <h3 className="font-bold text-gray-700">User Management</h3>
        <p className="text-gray-500 text-sm mb-4">Manage roles and permissions for your tenant.</p>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold">Import Users (CSV)</button>
    </div>
);

const AdminDashboard: React.FC = () => {
  const { role, isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'audits' | 'checklists' | 'workplaces' | 'users'>('audits');

  if (!isAdmin && role !== AdminRole.AUDIT_MANAGER) {
    return <div className="p-10 text-center text-red-600 font-bold">Access Denied. Tenant Admin or Audit Manager privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-600" />
          Admin Console
        </h1>
        <p className="text-sm text-gray-500 ml-9">Manage audits, checklists, and facility compliance.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('audits')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'audits' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <BarChart2 className="w-4 h-4 mr-2" /> Audit Management
           </button>
           <button 
             onClick={() => setActiveTab('checklists')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'checklists' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <FileText className="w-4 h-4 mr-2" /> Checklists
           </button>
           <button 
             onClick={() => setActiveTab('workplaces')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'workplaces' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Briefcase className="w-4 h-4 mr-2" /> Workplaces
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
           >
             <Users className="w-4 h-4 mr-2" /> Users
           </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
           {activeTab === 'audits' && <AuditApprovalQueue />}
           {activeTab === 'checklists' && <ChecklistManager />}
           {activeTab === 'workplaces' && <FactorySettingsPage />}
           {activeTab === 'users' && <UsersAdmin />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
