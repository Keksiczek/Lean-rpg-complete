import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Save, Globe, Clock, Building } from 'lucide-react';

const AccountSettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [timeFormat, setTimeFormat] = useState('24h');
  const [defaultPlant, setDefaultPlant] = useState('magna-1');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // TODO: Connect to API endpoint PUT /api/users/settings
    // await apiClient.put('/api/users/settings', { language, timeFormat, defaultPlant });
    setTimeout(() => {
        setIsSaving(false);
        alert("Settings saved locally (API integration pending).");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-500">Manage your application preferences and regional settings.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Language */}
            <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
                    <Globe className="w-4 h-4 mr-2" />
                    Application Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            language === 'en' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('cs')}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            language === 'cs' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        Čeština
                    </button>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Time Format */}
            <div>
                 <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 mr-2" />
                    Time Format
                </label>
                <select 
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="24h">24 Hour (14:30)</option>
                    <option value="12h">12 Hour (2:30 PM)</option>
                </select>
            </div>

             <hr className="border-gray-100" />

             {/* Default Plant */}
             <div>
                 <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
                    <Building className="w-4 h-4 mr-2" />
                    Default Plant / Location
                </label>
                <select 
                    value={defaultPlant}
                    onChange={(e) => setDefaultPlant(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="magna-1">Magna Plant 1 (Liberec)</option>
                    <option value="magna-2">Magna Plant 2 (Nymburk)</option>
                    <option value="magna-hq">Headquarters</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">This setting determines which factory map loads by default.</p>
            </div>
        </div>

        <div className="flex justify-end">
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center disabled:opacity-50"
            >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    </div>
  );
};

export default AccountSettingsPage;