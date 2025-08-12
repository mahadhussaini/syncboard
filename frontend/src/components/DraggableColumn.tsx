import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableItem from './DraggableItem';
import { createItem } from '@/api/boards';

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

interface DraggableColumnProps {
  column: Column;
  onColumnUpdate: (column: Column) => void;
}

export default function DraggableColumn({ column, onColumnUpdate }: DraggableColumnProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      const newItem = await createItem({ columnId: column.id, title: newItemTitle });
      onColumnUpdate({ ...column, items: [...column.items, newItem] });
      setNewItemTitle('');
      setIsAddingItem(false);
    } catch (error) {
      // noop
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-80 shrink-0 bg-white/90 backdrop-blur rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="sticky top-0 z-10 bg-white/70 backdrop-blur p-3 border-b border-slate-200 rounded-t-xl cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-slate-800 truncate" title={column.name}>{column.name}</div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200">
            {column.items.length}
          </span>
        </div>
      </div>

      <SortableContext items={column.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 p-3 min-h-[200px]">
          {column.items.length === 0 && (
            <div className="text-xs text-slate-500 rounded-md border border-dashed border-slate-200 p-4 text-center">
              Drop items here
            </div>
          )}
          {column.items.map((item) => (
            <DraggableItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>

      <div className="p-3 pt-0">
        {isAddingItem ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Enter item title..."
              className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemTitle('');
                }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="mt-2 w-full p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md text-sm transition-colors"
          >
            + Add item
          </button>
        )}
      </div>
    </div>
  );
} 