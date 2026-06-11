import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
        ← Back
      </button>

      <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔔 Notifications</h1>
          <p className="text-gray-600">You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 hover:bg-gray-50 transition ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                      {!notif.is_read && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">New</span>}
                    </div>
                    <p className="text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notif.is_read && (
                      <button onClick={() => markAsRead(notif.id)} className="text-xs text-cyan-600 hover:text-cyan-800">
                        Mark read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="text-xs text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">When doctors reply to your appointments, you'll see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;