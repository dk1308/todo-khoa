import { useState, useEffect, useCallback } from 'react';
import type { Todo, DayOfWeek } from '@/types/todo';
import { loadTodos, saveTodos, exportToExcel, importFromExcel } from '@/services/excelService';
import { arrayMove } from '@dnd-kit/sortable';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  // Persist on every change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = useCallback((title: string, description: string, day: DayOfWeek) => {
    setTodos(prev => {
      const dayTodos = prev.filter(t => t.day === day);
      const maxOrder = dayTodos.length > 0 ? Math.max(...dayTodos.map(t => t.order ?? 0)) : -1;
      return [...prev, {
        id: crypto.randomUUID(),
        title,
        description,
        day,
        completed: false,
        order: maxOrder + 1,
      }];
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const editTodo = useCallback((id: string, title: string, description: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, title, description } : t));
  }, []);

  const getTodosForDay = useCallback((day: DayOfWeek) => {
    return todos.filter(t => t.day === day).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [todos]);

  const reorderTodos = useCallback((day: DayOfWeek, activeId: string, overId: string) => {
    setTodos(prev => {
      const dayTodos = prev.filter(t => t.day === day).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const oldIndex = dayTodos.findIndex(t => t.id === activeId);
      const newIndex = dayTodos.findIndex(t => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(dayTodos, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
      const orderMap = new Map(reordered.map(t => [t.id, t.order]));
      return prev.map(t => orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t);
    });
  }, []);

  const handleExport = useCallback(() => {
    exportToExcel(todos);
  }, [todos]);

  const handleImport = useCallback(async (file: File) => {
    const imported = await importFromExcel(file);
    setTodos(imported);
  }, []);

  const uncheckAll = useCallback(() => {
    setTodos(prev => prev.map(t => ({ ...t, completed: false })));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo, getTodosForDay, reorderTodos, handleExport, handleImport, uncheckAll };
}
