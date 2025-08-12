import { useEffect, useState } from 'react';
import { getUserWorkspaces } from '@/api/workspaces';
import { Link } from 'react-router-dom';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getUserWorkspaces();
      setWorkspaces(data);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Your Workspaces</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {workspaces.map((w) => (
          <li key={w.id} className="border rounded p-3">
            <div className="font-medium">{w.name}</div>
            <div className="text-sm text-gray-600 mb-2">{w.description || '—'}</div>
            <Link to={`/workspace/${w.id}`} className="text-blue-600 hover:underline text-sm">Open</Link>
          </li>
        ))}
        {workspaces.length === 0 && <li className="text-gray-500">No workspaces yet.</li>}
      </ul>
    </div>
  );
}