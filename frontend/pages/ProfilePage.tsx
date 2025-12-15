import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Award } from 'lucide-react';
import { gameService } from '../services/gameService';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [fullProfile, setFullProfile] = useState<Player | null>(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: In a real implementation, you might hit a dedicated /api/users/profile endpoint
    // to get extended details not present in the Auth Context
    const refreshProfile = async () => {
      setLoading(true);
      try {
        const data = await gameService.fetchPlayerProfile();
        setFullProfile(data);
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
        refreshProfile();
    }
  }, [user]);

  if (!fullProfile) return <div>Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {fullProfile.username.substring(0, 2).toUpperCase()}
                </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{fullProfile.username}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {fullProfile.email}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        {fullProfile.role}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Member Since: {new Date(fullProfile.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Level</p>
                    <p className="text-2xl font-bold text-gray-900">{fullProfile.level}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total XP</p>
                    <p className="text-2xl font-bold text-gray-900">{fullProfile.totalXp.toLocaleString()}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Detailed Stats */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-red-600" />
                Performance Overview
            </h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Games Completed</span>
                    <span className="font-bold text-gray-900">{fullProfile.gamesCompleted}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Total Score</span>
                    <span className="font-bold text-gray-900">{fullProfile.totalScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Achievements Unlocked</span>
                    <span className="font-bold text-gray-900">{fullProfile.achievements.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tenant ID</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{fullProfile.tenantId}</span>
                </div>
            </div>
         </div>

         {/* Placeholders for future sections */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
             <p className="text-sm font-medium">Activity History Chart (Coming Soon)</p>
         </div>
      </div>
    </div>
  );
};

export default ProfilePage;