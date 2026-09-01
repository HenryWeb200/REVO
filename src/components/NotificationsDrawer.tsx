import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Zap, Clock } from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkReadItem: (id: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkReadItem,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDone = () => {
    onMarkAllRead();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E4E4E7] animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#111827]" />
            <h3 className="font-bold text-base text-[#111827]">Notifications</h3>
            {unreadCount > 0 ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1D63ED]/10 text-[#1D63ED] font-bold">
                {unreadCount} unread
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] font-medium">
                All caught up
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111827] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkReadItem(n.id)}
              className={`p-3.5 rounded-xl border transition-all space-y-1.5 cursor-pointer ${
                n.read
                  ? 'bg-white border-[#E4E4E7]'
                  : 'bg-[#FAFAFA] border-[#1D63ED]/30 ring-1 ring-[#1D63ED]/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#111827] flex items-center space-x-1.5">
                  {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {n.type === 'info' && <Zap className="w-3.5 h-3.5 text-[#1D63ED]" />}
                  <span>{n.title}</span>
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{n.time}</span>
                </span>
              </div>
              <p className="text-xs text-[#71717A] leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className={`text-xs font-semibold cursor-pointer ${
              unreadCount > 0 ? 'text-[#1D63ED] hover:underline' : 'text-[#A1A1AA] cursor-not-allowed'
            }`}
          >
            Mark all as read
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-1.5 bg-[#111827] text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

