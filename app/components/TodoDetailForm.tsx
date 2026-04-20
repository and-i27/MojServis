"use client";

import { useState } from "react";
import {
  completeTodo,
  deleteTodo,
  updateTodo,
} from "@/app/(root)/todo/[id]/action";
import { reminderOffsetLabel } from "@/lib/todoReminder";

type TodoDetailFormProps = {
  todo: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    status: string;
    reminderEnabled?: boolean;
    reminderOffset?: string;
  };
};

export default function TodoDetailForm({ todo }: TodoDetailFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(
    Boolean(todo.reminderEnabled),
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || completing || deleting) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateTodo(todo._id, formData);

    if (!result.success) {
      setError(result.error);
      setSaving(false);
      return;
    }

    if (result.redirectTo) {
      window.location.assign(result.redirectTo);
      return;
    }

    setSaving(false);
  }

  async function handleComplete() {
    if (saving || completing || deleting || todo.status === "done") return;

    setCompleting(true);
    setError(null);

    const result = await completeTodo(todo._id);

    if (!result.success) {
      setError(result.error);
      setCompleting(false);
      return;
    }

    if (result.redirectTo) {
      window.location.assign(result.redirectTo);
      return;
    }

    setCompleting(false);
  }

  async function handleDelete() {
    if (saving || completing || deleting) return;

    const confirmed = window.confirm(
      "Ali ste prepričani, da želite izbrisati to opravilo?",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const result = await deleteTodo(todo._id);

    if (!result.success) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    if (result.redirectTo) {
      window.location.assign(result.redirectTo);
      return;
    }

    setDeleting(false);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="title">Ime opravila</label>
          <input
            id="title"
            name="title"
            type="text"
            className="text-input"
            defaultValue={todo.title}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dueDate">Datum roka</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="text-input"
            defaultValue={todo.dueDate.slice(0, 16)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="priority">Prioriteta</label>
          <select
            id="priority"
            name="priority"
            className="text-input h-8"
            defaultValue={todo.priority}
          >
            <option value="low">Nizka</option>
            <option value="medium">Srednja</option>
            <option value="high">Visoka</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="status">Stanje</label>
          <select
            id="status"
            name="status"
            className="text-input h-8"
            defaultValue={todo.status}
          >
            <option value="open">Odprto</option>
            <option value="done">Končano</option>
            <option value="cancelled">Preklicano</option>
          </select>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            id="reminderEnabled"
            name="reminderEnabled"
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />
          <label htmlFor="reminderEnabled">Omogoči opomnik preko e-pošte</label>
        </div>

        {reminderEnabled && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="reminderOffset">Čas opomnika</label>
            <select
              id="reminderOffset"
              name="reminderOffset"
              className="text-input"
              defaultValue={todo.reminderOffset ?? "1week"}
            >
              {Object.entries(reminderOffsetLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="description">Opis</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="text-input"
            defaultValue={todo.description ?? ""}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          className="btn w-auto disabled:opacity-60"
          disabled={saving || completing || deleting}
          type="submit"
        >
          {saving ? "Shranjevanje..." : "Shrani spremembe"}
        </button>
        <button
          className="btn w-auto disabled:opacity-60"
          disabled={saving || completing || deleting || todo.status === "done"}
          type="button"
          onClick={handleComplete}
        >
          {completing ? "Označevanje..." : "Označi kot končano"}
        </button>
        <button
          className="btn border border-red-600 bg-red-300! text-red-600! disabled:opacity-60"
          disabled={saving || completing || deleting}
          type="button"
          onClick={handleDelete}
        >
          {deleting ? "Brisanje..." : "Izbriši opravilo"}
        </button>
      </div>
    </form>
  );
}
