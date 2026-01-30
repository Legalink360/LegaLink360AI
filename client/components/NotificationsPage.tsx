"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, Info, MessageSquare, Clock, ArrowLeft, Archive, Trash2 } from "lucide-react";

type NotificationType = "success" | "warning" | "info" | "message";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  content?: string;
  timestamp: Date;
  read: boolean;
};

type NotificationsPageProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NotificationsPage({ isOpen, onClose }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Document Processed Successfully",
      description: "Your uploaded contract has been analyzed and is ready for review.",
      content: "Your employment contract has been successfully analyzed by our AI system. The document contains standard terms and conditions. Key findings:\n\n• Contract Duration: 2 years\n• Notice Period: 30 days\n• Confidentiality Clause: Present\n• Non-compete Clause: 6 months\n\nNo major red flags detected. Please review the analysis for any specific concerns.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "New Feature: AI Legal Analysis",
      description: "We've added advanced AI analysis for property law documents.",
      content: "We're excited to introduce a new feature to LegaLink360! Our enhanced AI analysis system can now process and analyze property law documents with greater accuracy.\n\nNew capabilities:\n• Property ownership verification\n• Boundary dispute analysis\n• Land title review\n• Zoning compliance check\n\nThis feature is now available to all premium users. Start by uploading any property-related legal document.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      type: "message",
      title: "Reply from Legal Advisor",
      description: "Your question about contract terms has been answered.",
      content: "Thank you for your inquiry about the arbitration clause in your service agreement.\n\nAccording to the arbitration clause in section 8.2, any disputes will be resolved through binding arbitration rather than court proceedings. This means:\n\n1. Faster resolution (typically 6-12 months)\n2. Private proceedings\n3. Limited appeal rights\n\nWould you like me to explain any other sections of your contract?",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "4",
      type: "warning",
      title: "Action Required: Pending Documents",
      description: "3 documents are waiting for your approval.",
      content: "You have 3 documents that require your attention:\n\n1. Partnership Agreement Draft - Created 2 days ago\n   Status: Pending your review and approval\n\n2. Updated Terms of Service - Created 1 day ago\n   Status: Awaiting signature\n\n3. Client Engagement Letter - Created today\n   Status: Pending review\n\nPlease review these documents at your earliest convenience. Click the button below to access them.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    setExpandedNotificationId(null);
  };

  const archiveNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    setExpandedNotificationId(null);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-500" />;
      case "message":
        return <MessageSquare size={20} className="text-blue-500" />;
      case "info":
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const expandedNotification = notifications.find((n) => n.id === expandedNotificationId);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </h2>
            {unreadCount > 0 && !expandedNotification && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Notifications List */}
          <div className={`${expandedNotification ? "hidden md:flex md:w-1/3" : "w-full"} flex flex-col border-r border-slate-200 dark:border-slate-700`}>
            {notifications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
                  />
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    All caught up!
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
                    No notifications at the moment
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      setExpandedNotificationId(notification.id);
                      markAsRead(notification.id);
                    }}
                    className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      expandedNotificationId === notification.id
                        ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500"
                        : !notification.read
                          ? "bg-blue-50 dark:bg-slate-800/50"
                          : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-500">
                          <Clock size={12} />
                          {formatTime(notification.timestamp)}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expanded Notification View */}
          {expandedNotification && (
            <div className="w-full md:w-2/3 flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setExpandedNotificationId(null)}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 md:hidden"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(expandedNotification.type)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {expandedNotification.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock size={14} />
                      {formatTime(expandedNotification.timestamp)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-base leading-relaxed">
                    {expandedNotification.content || expandedNotification.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => archiveNotification(expandedNotification.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Archive size={18} />
                  Archive
                </button>
                <button
                  onClick={() => deleteNotification(expandedNotification.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!expandedNotification && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={markAllAsRead}
              className="text-sm px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-sm px-3 py-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
