import React, { useEffect, useState } from 'react';
import { Notification } from '../types';
import { gameService } from '../services/gameService';
import { Bell, CheckCircle, AlertTriangle, ClipboardList, Check } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    // TODO: Connect to GET /api/notifications
    const data = await gameService.getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await gameService.markAllNotificationsRead();
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'task': return <ClipboardList className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBgColor = (type: string) => {
      switch (type) {
          case 'task': return 'bg-blue-50';
          case 'warning': return 'bg-amber-50';
          case 'success': return 'bg-emerald-50';
          default: return 'bg-slate-50';
      }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-500">Stay updated with audit results and tasks.</p>
            </div>
            {notifications.length > 0 && (
                <button 
                    onClick={handleMarkAllRead}
                    className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg"
                >
                    <Check className="w-4 h-4 mr-2" /> Mark All Read
                </button>
            )}
        </div>

        {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : notifications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>You're all caught up! No notifications.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {notifications.map(note => (
                    <div 
                        key={note.id}
                        className={`p-5 rounded-xl border transition-all ${
                            note.read ? 'bg-white border-gray-200' : 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-50'
                        }`}
                    >
                        <div className="flex items-start">
                             <div className={`p-2 rounded-lg mr-4 ${getBgColor(note.type)}`}>
                                 {getIcon(note.type)}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h3 className={`font-bold text-gray-900 ${!note.read && 'text-blue-700'}`}>
                                         {note.title}
                                     </h3>
                                     <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                         {new Date(note.timestamp).toLocaleString()}
                                     </span>
                                 </div>
                                 <p className="text-gray-600 mt-1">{note.message}</p>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default NotificationsPage;