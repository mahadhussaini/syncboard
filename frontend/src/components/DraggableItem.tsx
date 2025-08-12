import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AttachmentList from './AttachmentList';

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

interface DraggableItemProps {
  item: BoardItem;
}

function DraggableItem({ item }: DraggableItemProps) {
  const [showAttachments, setShowAttachments] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'URGENT': return 'bg-red-200 text-red-900';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
      >
        <div className="font-medium text-sm mb-2">{item.title}</div>
        
        {item.description && (
          <div className="text-xs text-gray-600 mb-2 line-clamp-2">
            {item.description}
          </div>
        )}

        <div className="flex items-center justify-between">
          {item.priority && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
              {item.priority}
            </span>
          )}
          
          <div className="flex items-center gap-2">
            <button className="text-xs text-gray-600 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); setShowAttachments((s) => !s); }}>
              {showAttachments ? 'Hide Attachments' : 'Attachments'}
            </button>
            {item.type && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {item.type}
              </span>
            )}
          </div>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {item.dueDate && (
          <div className="text-xs text-gray-500 mt-2">
            Due: {new Date(item.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>

      {showAttachments && (
        <div className="border rounded p-2 bg-gray-50">
          <AttachmentList itemId={item.id} />
        </div>
      )}
    </div>
  );
}

export default DraggableItem;
export { DraggableItem }; 