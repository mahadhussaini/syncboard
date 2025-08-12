import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBoard, createColumn } from '@/api/boards';
import DraggableBoard from '@/components/DraggableBoard';
import { useSocket } from '@/utils/socket';
import AIPanel from '@/components/AIPanel';

interface BoardItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  assigneeId?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  order: number;
}

interface Column {
  id: string;
  name: string;
  order: number;
  items: BoardItem[];
}

interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  workspaceId?: string;
}

export default function Board() {
  const { boardId } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [showAI, setShowAI] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!boardId) return;
    (async () => {
      const data = await getBoard(boardId);
      setBoard(data);
    })();
  }, [boardId]);

  useEffect(() => {
    if (!socket || !board) return;
    if (board.workspaceId) {
      socket.emit('join_workspace', board.workspaceId, () => {});
    }
    socket.emit('join_board', board.id, () => {});

    return () => {
      if (board.workspaceId) {
        socket.emit('leave_workspace', board.workspaceId);
      }
      socket.emit('leave_board', board.id);
    };
  }, [socket, board]);

  async function addColumn() {
    if (!boardId || !newColumnName || !board) return;
    const col = await createColumn(boardId, { name: newColumnName, order: (board?.columns?.length || 0) + 1 });
    setBoard((prev: Board | null) => (prev ? { ...prev, columns: [...(prev?.columns || []), col] } : null));
    setNewColumnName('');
  }

  if (!board) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b bg-white">
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        <div className="ml-auto flex gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="New column name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addColumn()}
          />
          <button onClick={addColumn} className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700">
            Add Column
          </button>
          <button onClick={() => setShowAI(s => !s)} className="bg-purple-600 text-white rounded px-3 py-1 hover:bg-purple-700">
            {showAI ? 'Hide AI' : 'Show AI'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className={`flex-1 overflow-hidden ${showAI ? 'border-r' : ''}`}>
          <DraggableBoard board={board} onBoardUpdate={setBoard} />
        </div>
        {showAI && (
          <AIPanel workspaceId={board.workspaceId || ''} />
        )}
      </div>
    </div>
  );
}