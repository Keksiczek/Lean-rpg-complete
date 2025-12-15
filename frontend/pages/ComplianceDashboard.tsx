import React from 'react';
import { WORKPLACES } from '../constants';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Mock trend data
const mockTrend = [
  { name: 'W1', score: 65 }, { name: 'W2', score: 70 }, { name: 'W3', score: 75 }, 
  { name: 'W4', score: 72 }, { name: 'W5', score: 85 }
];

const ComplianceDashboard: React.FC = () => {
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-500">Real-time health monitoring of all factory zones.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">
           Avg. Plant Score: <span className="text-green-600">82%</span>
        </div>
      </div>

      {/* Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {WORKPLACES.map(wp => (
            <div key={wp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
               <div className={`h-2 w-full ${
                  wp.status === 'optimal' ? 'bg-green-500' : wp.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
               }`} />
               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-lg text-gray-800">{wp.name}</h3>
                        <p className="text-xs text-gray-400 uppercase font-bold">{wp.type} Zone</p>
                     </div>
                     <div className="text-right">
                        <span className={`text-2xl font-bold ${
                           wp.status === 'optimal' ? 'text-green-600' : wp.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                           {wp.status === 'optimal' ? '92%' : wp.status === 'warning' ? '78%' : '65%'}
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-400 font-bold uppercase">Last Audit</p>
                        <p className="text-sm font-medium text-gray-700">2 days ago</p>
                     </div>
                     <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-xs text-gray-400 font-bold uppercase">Open Findings</p>
                        <p className="text-sm font-medium text-gray-700 flex items-center">
                           {wp.redTags} <AlertTriangle className="w-3 h-3 ml-1 text-red-400" />
                        </p>
                     </div>
                  </div>

                  <div className="h-16 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockTrend}>
                           <defs>
                              <linearGradient id={`color${wp.id}`} x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor={wp.status === 'optimal' ? '#22c55e' : '#ef4444'} stopOpacity={0.1}/>
                                 <stop offset="95%" stopColor={wp.status === 'optimal' ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <Tooltip contentStyle={{display:'none'}} />
                           <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke={wp.status === 'optimal' ? '#22c55e' : '#ef4444'} 
                              fillOpacity={1} 
                              fill={`url(#color${wp.id})`} 
                              strokeWidth={2}
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ComplianceDashboard;
