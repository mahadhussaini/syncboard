import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import api from '@/utils/api';
import { useSocket } from '@/utils/socket';
import Layout from '@/components/Layout';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { user, logout, fetchMe } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!socket) return;

    function onConnect() { setConnected(true); }
    function onDisconnect() { setConnected(false); }
    function onNotification(payload: { notification: Notification }) {
      setNotifications((prev) => [payload.notification, ...prev]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
    };
  }, [socket]);

  useEffect(() => {
    (async () => {
      const res = await api.get('/notifications');
      const data = res.data.data;
      setNotifications(data.notifications || []);
    })();
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome {user?.firstName || user?.email}</h1>
        <div className="flex items-center gap-3">
          <span className={connected ? 'text-green-600' : 'text-gray-500'}>
            {connected ? 'Live' : 'Offline'}
          </span>
          <button onClick={logout} className="bg-gray-800 text-white rounded px-3 py-1">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2">Quick Links</h2>
          <div className="space-x-3">
            <Link className="text-blue-600 hover:underline" to="/teams">Teams</Link>
            <Link className="text-blue-600 hover:underline" to="/workspaces">Workspaces</Link>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2">Notifications</h2>
          <ul className="space-y-2 max-h-80 overflow-auto">
            {notifications.map((n) => (
              <li key={n.id} className="border rounded p-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{n.title}</span>
                  <span className="text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">{n.message}</p>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="text-gray-500 text-sm">No notifications yet.</li>
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}