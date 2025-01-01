/**
 * Excel Service - Handles reading/writing todos to/from .xlsx files.
 * 
 * Since this is a client-side React app (no server), we use:
 * - localStorage for session persistence
 * - xlsx library for Excel import/export in the browser
 * 
 * Users can export their todos to .xlsx and import from .xlsx files.
 */

import * as XLSX from 'xlsx';
import type { Todo, DayOfWeek, } from '@/types/todo';
import { DAYS_OF_WEEK } from '@/types/todo';

const STORAGE_KEY = 'weekly-todos';

/** Load todos from localStorage */
export function loadTodos(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Save todos to localStorage */
export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** Export todos to an .xlsx file and trigger download */
export function exportToExcel(todos: Todo[]): void {
  const rows = todos.map(t => ({
    ID: t.id,
    Title: t.title,
    Description: t.description,
    Day: t.day,
    Completed: t.completed ? 'Yes' : 'No',
    Order: t.order,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  // Set column widths for readability
  ws['!cols'] = [
    { wch: 36 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 8 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Todos');
  XLSX.writeFile(wb, 'weekly-todos.xlsx');
}

/** Import todos from an .xlsx file */
export function importFromExcel(file: File): Promise<Todo[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

        const todos: Todo[] = rows
          .filter(r => r.Title && DAYS_OF_WEEK.includes(r.Day as DayOfWeek))
          .map((r, index) => ({
            id: r.ID || crypto.randomUUID(),
            title: r.Title,
            description: r.Description || '',
            day: r.Day as DayOfWeek,
            completed: r.Completed === 'Yes',
            order: r.Order != null ? Number(r.Order) : index,
          }));

        resolve(todos);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
