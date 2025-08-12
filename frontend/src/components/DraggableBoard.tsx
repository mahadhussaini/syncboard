import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useSocket } from '@/utils/socket';
import { moveItem, updateColumn } from '@/api/boards';
import DraggableColumn from './DraggableColumn';
import DraggableItem from './DraggableItem';

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

interface DraggableBoardProps {
  board: Board;
  onBoardUpdate: (board: Board) => void;
}

export default function DraggableBoard({ board, onBoardUpdate }: DraggableBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<Board>(board);
  const socket = useSocket();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setBoardData(board);
  }, [board]);

  useEffect(() => {
    if (!socket) return;

    const handleItemUpdated = (payload: { itemId: string; data: any }) => {
      // Handle real-time item updates
      console.log('Item updated:', payload);
    };

    const handleColumnUpdated = (payload: { columnId: string; data: any }) => {
      // Handle real-time column updates
      console.log('Column updated:', payload);
    };

    socket.on('item_updated', handleItemUpdated);
    socket.on('column_updated', handleColumnUpdated);

    return () => {
      socket.off('item_updated', handleItemUpdated);
      socket.off('column_updated', handleColumnUpdated);
    };
  }, [socket]);

  const columnIds = boardData.columns.map(c => c.id);

  const isColumnId = (id: string) => columnIds.includes(id);

  const findItem = (id: string): { item: BoardItem; columnId: string } | null => {
    for (const column of boardData.columns) {
      const item = column.items.find(item => item.id === id);
      if (item) {
        return { item, columnId: column.id };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Only preview item cross-column moves here; column sort is handled on drag end
    const isActiveItem = findItem(activeId);
    const isOverItem = findItem(overId);

    if (!isActiveItem) return;

    if (isOverItem && isActiveItem.columnId !== isOverItem.columnId) {
      setBoardData(prev => {
        const newBoard = { ...prev };
        const activeColumn = newBoard.columns.find(col => col.id === isActiveItem.columnId);
        const overColumn = newBoard.columns.find(col => col.id === isOverItem.columnId);

        if (activeColumn && overColumn) {
          activeColumn.items = activeColumn.items.filter(item => item.id !== activeId);
          const movedItem = { ...isActiveItem.item, order: overColumn.items.length };
          overColumn.items.push(movedItem);
        }

        return newBoard;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Column reordering
    if (isColumnId(activeId) && isColumnId(overId)) {
      const oldIndex = columnIds.indexOf(activeId);
      const newIndex = columnIds.indexOf(overId);

      // Optimistic reorder
      const newColumns = arrayMove(boardData.columns, oldIndex, newIndex).map((col, idx) => ({ ...col, order: idx }));
      setBoardData(prev => ({ ...prev, columns: newColumns }));

      try {
        // Persist orders (only for changed columns)
        await Promise.all(
          newColumns.map((col, idx) => (col.order !== idx ? updateColumn(col.id, { order: idx }) : updateColumn(col.id, { order: idx })))
        );
      } catch (error) {
        console.error('Failed to persist column order:', error);
        // Revert
        setBoardData(board);
      }
      return;
    }

    // Item movement
    const isActiveItem = findItem(activeId);
    const isOverItem = findItem(overId);
    if (!isActiveItem) return;

    try {
      if (isOverItem) {
        const newColumnId = isOverItem.columnId;
        // Optimistic update already handled in dragOver; ensure final state
        setBoardData(prev => {
          const newBoard = { ...prev };
          const activeColumn = newBoard.columns.find(col => col.id === isActiveItem.columnId);
          const overColumn = newBoard.columns.find(col => col.id === newColumnId);
          if (activeColumn && overColumn) {
            activeColumn.items = activeColumn.items.filter(item => item.id !== activeId);
            const movedItem = { ...isActiveItem.item, order: overColumn.items.length };
            overColumn.items.push(movedItem);
          }
          return newBoard;
        });

        // API call
        await moveItem(activeId, newColumnId);

        // Emit real-time update
        if (socket && boardData.workspaceId) {
          socket.emit('item_update', {
            workspaceId: boardData.workspaceId,
            boardId: boardData.id,
            itemId: activeId,
            data: { newColumnId },
          });
        }
      }
    } catch (error) {
      console.error('Failed to move item:', error);
      setBoardData(board);
    }
  };

  const activeItem = activeId ? findItem(activeId)?.item : null;

  return (
    <div className="h-full overflow-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 min-h-full">
          <SortableContext items={boardData.columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            {boardData.columns.map((column) => (
              <DraggableColumn
                key={column.id}
                column={column}
                onColumnUpdate={(updatedColumn: Column) => {
                  setBoardData(prev => ({
                    ...prev,
                    columns: prev.columns.map(col => (col.id === column.id ? updatedColumn : col)),
                  }));
                }}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>{activeItem ? <DraggableItem item={activeItem} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
} 