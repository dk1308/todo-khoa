import type { Todo, DayOfWeek } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { TodoForm } from './TodoForm';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DAY_COLORS: Record<DayOfWeek, string> = {
  Monday: 'bg-day-mon',
  Tuesday: 'bg-day-tue',
  Wednesday: 'bg-day-wed',
  Thursday: 'bg-day-thu',
  Friday: 'bg-day-fri',
  Saturday: 'bg-day-sat',
  Sunday: 'bg-day-sun',
};

const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU',
  Friday: 'FRI', Saturday: 'SAT', Sunday: 'SUN',
};

interface Props {
  day: DayOfWeek;
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
  onAdd: (title: string, description: string, day: DayOfWeek) => void;
  onReorder: (day: DayOfWeek, activeId: string, overId: string) => void;
  isToday?: boolean;
}

export function DayColumn({ day, todos, onToggle, onDelete, onEdit, onAdd, onReorder, isToday }: Props) {
  const completedCount = todos.filter(t => t.completed).length;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(day, active.id as string, over.id as string);
    }
  }

  return (
    <div className={`flex flex-col rounded-xl border ${isToday ? 'ring-2 ring-primary/30 border-primary/20' : ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <span className={`h-2 w-2 rounded-full ${DAY_COLORS[day]}`} />
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">{DAY_SHORT[day]}</span>
        {isToday && <span className="text-[10px] font-medium text-primary bg-accent px-1.5 py-0.5 rounded-full">TODAY</span>}
        {todos.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{completedCount}/{todos.length}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={todos.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </SortableContext>
        </DndContext>
        <TodoForm onAdd={onAdd} defaultDay={day} />
      </div>
    </div>
  );
}
