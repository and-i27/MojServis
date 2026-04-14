"use client";

import { useState } from "react";
import { createVehicleTodo } from "@/app/(root)/vehicle/[id]/todo/action";

type AddVehicleTodoFormProps = {
  carId: string;
};

export default function AddVehicleTodoForm({ carId }: AddVehicleTodoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createVehicleTodo(carId, formData);

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

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="title">Task title</label>
          <input id="title" name="title" type="text" className="authInput" required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" name="dueDate" type="datetime-local" className="authInput" required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" className="authInput" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className="authInput" />
        </div>

        <input type="hidden" name="status" value="open" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button className="buttonPrimary w-auto px-6" disabled={saving} type="submit">
          {saving ? "Saving..." : "Add to-do"}
        </button>
      </div>
    </form>
  );
}
