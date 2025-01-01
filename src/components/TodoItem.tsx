import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Todo } from '@/types/todo';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  const startEditing = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed) {
      onEdit(todo.id, trimmed, editDesc.trim());
    }
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 rounded-lg border p-3 transition-all ${todo.completed ? 'bg-muted/50 opacity-70' : 'bg-card'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground/40 hover:text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={() => onToggle(todo.id)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          todo.completed ? 'border-primary bg-primary' : 'border-muted-foreground/40 hover:border-primary'
        }`}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
          </svg>
        )}
      </button>

      {editing ? (
        <div className="min-w-0 flex-1 space-y-1">
          <input
            ref={titleRef}
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded border bg-background px-2 py-0.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Description (optional)"
            className="w-full rounded border bg-background px-2 py-0.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={saveEdit}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex-1 cursor-pointer" onDoubleClick={startEditing}>
          <p className={`text-sm font-medium leading-tight ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {todo.title}
          </p>
          {todo.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{todo.description}</p>
          )}
        </div>
      )}

      {!editing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(todo.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
