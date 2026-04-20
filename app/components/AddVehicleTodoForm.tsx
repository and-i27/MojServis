"use client";

import { useState } from "react";
import { createVehicleTodo } from "@/app/(root)/vehicle/[id]/todo/action";
import { reminderOffsetLabel } from "@/lib/todoReminder";

type AddVehicleTodoFormProps = {
  carId: string;
};

export default function AddVehicleTodoForm({ carId }: AddVehicleTodoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

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
          <label htmlFor="title">Ime opravila</label>
          <input
            id="title"
            name="title"
            type="text"
            className="text-input"
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
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="priority">Prioriteta</label>
          <select
            id="priority"
            name="priority"
            className="text-input h-8"
            defaultValue="medium"
          >
            <option value="low">Nizka</option>
            <option value="medium">Srednja</option>
            <option value="high">Visoka</option>
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
          <label htmlFor="reminderEnabled">
            Omogoči opomnik preko e - pošte
          </label>
        </div>

        {reminderEnabled && (
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="reminderOffset">Čas opomnika</label>
            <select
              id="reminderOffset"
              name="reminderOffset"
              className="text-input h-8"
              defaultValue="1week"
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
            rows={3}
            className="text-input"
          />
        </div>

        <input type="hidden" name="status" value="open" />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn w-auto px-6" disabled={saving} type="submit">
          {saving ? "Shranjujem..." : "Dodaj opravilo"}
        </button>
      </div>
    </form>
  );
}
