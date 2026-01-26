import React from 'react';
import type { Notification } from '../../types';
import { X, Check, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationCenterProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    notifications,
    onClose,
    onMarkAsRead
}) => {
    return (
        <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Powiadomienia</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Brak nowych powiadomień
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 transition-colors ${notification.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {format(new Date(notification.createdAt), 'dd.MM.yyyy HH:mm')}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => onMarkAsRead(notification._id)}
                                            className="text-blue-500 hover:text-blue-700 h-fit pt-1"
                                            title="Oznacz jako przeczytane"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
