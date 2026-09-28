import { Container } from '../components/ui/Container';
import {
  useNotifications,
  useMarkAsRead,
  useDeleteNotification,
  useClearAllNotifications
} from '../hooks/useNotifications';
import { Bell, Package, Tag, Star, Info, CheckCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

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
  const { data: notificationsData, isLoading } = useNotifications(page, ITEMS_PER_PAGE);
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();
  const clearAllNotifications = useClearAllNotifications();

  const notificationsList = notificationsData?.notifications || [];
  const meta = notificationsData?.meta;
  const totalItems = meta?.total ?? notificationsList.length;
  const totalPages = meta?.pages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const hasUnread = notificationsList.some((n: any) => !n.isRead);

  // If current page is beyond totalPages (e.g. after deletes), auto-navigate back
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  // Mark each unread notification
  const handleMarkAllRead = async () => {
    try {
      const unreadItems = notificationsList.filter((n: any) => !n.isRead && !n.read);
      await Promise.all(unreadItems.map((n: any) => markAsRead.mutateAsync(n._id || n.id)));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification.mutateAsync(id);
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        const ids = notificationsList.map((n: any) => n._id || n.id).filter(Boolean);
        await clearAllNotifications.mutateAsync(ids);
        setPage(1);
        toast.success('All notifications cleared');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to clear notifications');
      }
    }
  };

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
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group ${notification.isRead
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

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 font-medium">
                Showing{' '}
                <span className="font-semibold text-neutral-800">
                  {Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalItems)}
                </span>
                –
                <span className="font-semibold text-neutral-800">
                  {Math.min(page * ITEMS_PER_PAGE, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-neutral-800">{totalItems}</span> notifications
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-neutral-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => handlePageChange(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === p
                            ? 'bg-[#0a7a40] text-white shadow-xs'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                  aria-label="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
