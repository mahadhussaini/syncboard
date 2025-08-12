import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWorkspaceBoards, createBoard } from '@/api/boards';

export default function WorkspaceBoards() {
  const { workspaceId } = useParams();
  const [boards, setBoards] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!workspaceId) return;
    (async () => {
      const data = await getWorkspaceBoards(workspaceId);
      setBoards(data);
    })();
  }, [workspaceId]);

  async function onCreate() {
    if (!workspaceId || !name) return;
    const board = await createBoard(workspaceId, { name });
    setBoards((prev) => [board, ...prev]);
    setName('');
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Boards</h2>
      <div className="flex gap-2">
        <input className="border rounded px-2 py-1" placeholder="New board name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={onCreate} className="bg-blue-600 text-white rounded px-3">Create</button>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {boards.map((b) => (
          <li key={b.id} className="border rounded p-3">
            <div className="font-medium">{b.name}</div>
            <Link to={`/board/${b.id}`} className="text-blue-600 hover:underline text-sm">Open</Link>
          </li>
        ))}
        {boards.length === 0 && <li className="text-gray-500">No boards yet.</li>}
      </ul>
    </div>
  );
}