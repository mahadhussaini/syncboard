import { useEffect, useState } from 'react';
import { getTeams } from '@/api/teams';

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getTeams();
      setTeams(data);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Your Teams</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teams.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-gray-600">{t.description || '—'}</div>
          </li>
        ))}
        {teams.length === 0 && <li className="text-gray-500">No teams yet.</li>}
      </ul>
    </div>
  );
}