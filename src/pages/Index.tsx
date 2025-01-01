import { useState, useRef, useMemo } from 'react';
import { CalendarDays, LayoutGrid, Download, Upload, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/hooks/useTodos';
import { DayColumn } from '@/components/DayColumn';
import { TodoForm } from '@/components/TodoForm';
import { TodoItem } from '@/components/TodoItem';
import type { DayOfWeek } from '@/types/todo';
import { DAYS_OF_WEEK } from '@/types/todo';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function getTodayDay(): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

export default function Index() {
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo, getTodosForDay, reorderTodos, handleExport, handleImport, uncheckAll } = useTodos();
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDay());
  const fileRef = useRef<HTMLInputElement>(null);
  const today = getTodayDay();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const dailyTodos = useMemo(() => getTodosForDay(selectedDay), [getTodosForDay, selectedDay]);

  const handleDailyDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTodos(selectedDay, active.id as string, over.id as string);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Weekly Todos</h1>
            <p className="text-sm text-muted-foreground">Recurring tasks that repeat every week</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border bg-muted p-0.5">
              <button
                onClick={() => setView('weekly')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'weekly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Weekly
              </button>
              <button
                onClick={() => setView('daily')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'daily' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Daily
              </button>
            </div>
            {/* Excel import/export */}
            <Button variant="outline" size="sm" onClick={uncheckAll} title="Uncheck all items">
              <RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Uncheck All</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} title="Export to Excel">
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} title="Import from Excel">
              <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Import</span>
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />
          </div>
        </div>

        {/* Weekly View */}
        {view === 'weekly' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DAYS_OF_WEEK.map(day => (
              <DayColumn
                key={day}
                day={day}
                todos={getTodosForDay(day)}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onAdd={addTodo}
                onReorder={reorderTodos}
                isToday={day === today}
              />
            ))}
          </div>
        )}

        {/* Daily View */}
        {view === 'daily' && (
          <div className="mx-auto max-w-lg">
            {/* Day selector */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg border bg-muted p-1">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                    selectedDay === day
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  } ${day === today ? 'ring-1 ring-primary/30' : ''}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDailyDragEnd}>
                <SortableContext items={dailyTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {dailyTodos.map(todo => (
                    <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />
                  ))}
                </SortableContext>
              </DndContext>
              <TodoForm onAdd={addTodo} defaultDay={selectedDay} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          {todos.length} total tasks · {todos.filter(t => t.completed).length} completed
        </div>
      </div>
    </div>
  );
}
