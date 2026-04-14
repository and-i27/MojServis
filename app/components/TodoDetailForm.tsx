"use client";

import { useState } from "react";
import { completeTodo, deleteTodo, updateTodo } from "@/app/(root)/todo/[id]/action";

type TodoDetailFormProps = {
  todo: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority: string;
    status: string;
  };
};

export default function TodoDetailForm({ todo }: TodoDetailFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

    const confirmed = window.confirm("Are you sure you want to delete this to-do?");
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
          <label htmlFor="title">Task title</label>
          <input id="title" name="title" type="text" className="authInput" defaultValue={todo.title} required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dueDate">Due date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            className="authInput"
            defaultValue={todo.dueDate.slice(0, 16)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" className="authInput" defaultValue={todo.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="authInput"
            defaultValue={todo.description ?? ""}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3 pt-2">
        <button className="buttonPrimary w-auto px-6" disabled={saving || completing || deleting} type="submit">
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button
          className="button w-auto"
          disabled={saving || completing || deleting || todo.status === "done"}
          type="button"
          onClick={handleComplete}
        >
          {completing ? "Completing..." : "Mark as done"}
        </button>
        <button
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          disabled={saving || completing || deleting}
          type="button"
          onClick={handleDelete}
        >
          {deleting ? "Deleting..." : "Delete to-do"}
        </button>
      </div>
    </form>
  );
}
