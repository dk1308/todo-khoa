import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DayOfWeek } from '@/types/todo';
import { DAYS_OF_WEEK } from '@/types/todo';

interface Props {
  onAdd: (title: string, description: string, day: DayOfWeek) => void;
  defaultDay?: DayOfWeek;
}

export function TodoForm({ onAdd, defaultDay }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay || 'Monday');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), day);
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  if (!open) {
    return (
      <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add Todo
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-card p-4">
      <Input
        placeholder="What needs to be done?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      {!defaultDay && (
        <select
          value={day}
          onChange={e => setDay(e.target.value as DayOfWeek)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          {DAYS_OF_WEEK.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!title.trim()}>Add</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
