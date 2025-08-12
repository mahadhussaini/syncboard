import { useEffect, useMemo, useState } from 'react';
import { getWorkspaceStats, getUserStats, getWorkspaceTrends } from '@/api/analytics';
import { getUserWorkspaces } from '@/api/workspaces';
import { getTeams } from '@/api/teams';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface WorkspaceOption { id: string; name: string }
interface TeamOption { id: string; name: string }

export default function Analytics() {
  const [workspaces, setWorkspaces] = useState<WorkspaceOption[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [days, setDays] = useState(30);
  const [workspaceStats, setWorkspaceStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>({});

  useEffect(() => {
    (async () => {
      const [ws, user] = await Promise.all([
        getUserWorkspaces(),
        getUserStats(),
      ]);
      setWorkspaces(ws);
      setUserStats(user);
      if (ws?.length) {
        setSelectedWorkspaceId(ws[0].id);
      }
      const ts = await getTeams();
      setTeams(ts);
    })();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    (async () => {
      const [stats, tr] = await Promise.all([
        getWorkspaceStats(selectedWorkspaceId, days),
        getWorkspaceTrends(selectedWorkspaceId, days),
      ]);
      setWorkspaceStats(stats);
      setTrends(tr);
    })();
  }, [selectedWorkspaceId, days]);

  const trendData = useMemo(() => {
    // Convert trends {date: {type: count}} into array of {date, total}
    const rows: Array<{ date: string; total: number }> = [];
    Object.keys(trends || {}).forEach(date => {
      const total = Object.values(trends[date] as any).reduce((acc: any, v: any) => acc + (v as number), 0);
      rows.push({ date, total });
    });
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [trends]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="ml-auto flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={selectedWorkspaceId} onChange={(e) => setSelectedWorkspaceId(e.target.value)}>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select className="border rounded px-2 py-1" value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-500">Boards</div>
          <div className="text-2xl font-semibold">{workspaceStats?.totalBoards ?? '-'}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-500">Items</div>
          <div className="text-2xl font-semibold">{workspaceStats?.totalItems ?? '-'}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-500">Completed</div>
          <div className="text-2xl font-semibold">{workspaceStats?.completedItems ?? '-'}</div>
        </div>
        <div className="bg-white rounded border p-4">
          <div className="text-sm text-gray-500">Active Users</div>
          <div className="text-2xl font-semibold">{workspaceStats?.activeUsers ?? '-'}</div>
        </div>
      </div>

      <div className="bg-white rounded border p-4 h-72">
        <div className="text-sm font-medium mb-2">Activity Trends</div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded border p-4">
        <div className="text-sm font-medium mb-2">Item Status Distribution</div>
        <div className="grid grid-cols-2 gap-4">
          {workspaceStats && Object.keys(workspaceStats.itemStatusDistribution || {}).map((status: string) => (
            <div key={status} className="flex items-center justify-between border rounded p-2">
              <span>{status}</span>
              <span className="font-semibold">{workspaceStats.itemStatusDistribution[status]}</span>
            </div>
          ))}
          {!workspaceStats && <div className="text-sm text-gray-500">No data</div>}
        </div>
      </div>

      <div className="bg-white rounded border p-4 h-72">
        <div className="text-sm font-medium mb-2">User Productivity</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ name: 'Created', value: userStats?.itemsCreated || 0 }, { name: 'Completed', value: userStats?.itemsCompleted || 0 }]}> 
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}