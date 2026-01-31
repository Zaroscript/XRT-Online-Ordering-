import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  renderItem: (item: any, dragHandleProps: any) => React.ReactNode;
  item: any;
}

export function SortableItem({ id, renderItem, item }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Important for touch devices
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {renderItem(item, listeners)}
    </div>
  );
}

interface SortableListProps {
  items: any[];
  onSortEnd: (oldIndex: number, newIndex: number) => void;
  renderItem: (item: any, dragHandleProps: any) => React.ReactNode;
  keyExtractor?: (item: any) => string;
}

export const SortableList = ({
  items,
  onSortEnd,
  renderItem,
  keyExtractor = (item) => item.id,
}: SortableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(
        (item) => keyExtractor(item) === active.id,
      );
      const newIndex = items.findIndex(
        (item) => keyExtractor(item) === over?.id,
      );
      onSortEnd(oldIndex, newIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => keyExtractor(item))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem
              key={keyExtractor(item)}
              id={keyExtractor(item)}
              item={item}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
