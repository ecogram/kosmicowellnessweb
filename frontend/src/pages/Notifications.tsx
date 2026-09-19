import { Container } from '../components/ui/Container';
import { 
  useNotifications, 
  useMarkAsRead, 
  useDeleteNotification, 
  useClearAllNotifications 
} from '../hooks/useNotifications';
import { Bell, Package, Tag, Star, Info, CheckCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';

const getIcon = (type: string) => {
  switch (type) {
    case 'order_update': return <Package className="w-5 h-5 text-[#0a7a40]" />;
    case 'promo': return <Tag className="w-5 h-5 text-emerald-600" />;
    case 'review': return <Star className="w-5 h-5 text-amber-500" />;
    default: return <Info className="w-5 h-5 text-teal-600" />;
  }
};

export function Notifications() {
  const [page, setPage] = useState(1);
  const { data: notificationsData, isLoading } = useNotifications(page, 20);
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAllNotifications = useClearAllNotifications();

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  // Mark each unread notification individually (no bulk endpoint in API)
  const handleMarkAllRead = () => {
    notificationsList
      .filter((n: any) => !n.isRead)
      .forEach((n: any) => markAsRead.mutate(n._id));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllNotifications.mutate();
    }
  };

  const notificationsList = notificationsData?.notifications || [];
  const hasUnread = notificationsList.some((n: any) => !n.isRead);

  return (
    <Container className="py-10 md:py-16 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#0a7a40]" />
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Stay updated with your order statuses, special offers, and health reminders
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAsRead.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eefbf3] text-[#0a7a40] hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notificationsList.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAllNotifications.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : notificationsList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 shadow-xs p-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0a7a40] mx-auto flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1">No notifications yet</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You're all caught up! Order updates and wellness announcements will appear right here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificationsList.map((notification: any) => (
            <div 
              key={notification._id} 
              onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group ${
                notification.isRead 
                  ? 'bg-neutral-50/70 border-neutral-200 opacity-80 hover:opacity-100' 
                  : 'bg-white border-emerald-300 shadow-xs hover:border-emerald-500'
              }`}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mt-0.5">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-bold truncate ${notification.isRead ? 'text-neutral-800' : 'text-emerald-950 font-extrabold'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-[11px] text-neutral-400 whitespace-nowrap shrink-0">
                    {new Date(notification.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${notification.isRead ? 'text-neutral-500' : 'text-neutral-700'}`}>
                  {notification.message}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-[#0a7a40] rounded-full"></span>
                )}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, notification._id)}
                  className="text-neutral-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {Boolean(
            (notificationsData?.pagination?.totalPages || notificationsData?.pagination?.pages) &&
            (notificationsData?.pagination?.totalPages || notificationsData?.pagination?.pages) > 1
          ) && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-neutral-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 text-xs text-neutral-500 font-medium">
                Page {page} of {notificationsData?.pagination?.totalPages || notificationsData?.pagination?.pages || 1}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (notificationsData?.pagination?.totalPages || notificationsData?.pagination?.pages || 1)}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
