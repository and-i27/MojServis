"use client";

import { useState } from "react";
import { createVehicleService } from "@/app/(root)/vehicle/[id]/services/action";

type AddVehicleServiceFormProps = {
  carId: string;
  currentOdometer?: number;
};

export default function AddVehicleServiceForm({
  carId,
  currentOdometer,
}: AddVehicleServiceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createVehicleService(carId, formData);

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
          <label htmlFor="title">Ime servisa</label>
          <input
            id="title"
            name="title"
            type="text"
            className="text-input"
            required
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor="description">Opis</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="text-input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="date">Datum</label>
          <input
            id="date"
            name="date"
            type="date"
            className="text-input"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="odometer">Prevoženi km</label>
          <input
            id="odometer"
            name="odometer"
            type="number"
            className="text-input"
            defaultValue={currentOdometer ?? undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cost">Stroški</label>
          <input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            className="text-input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="currency">Valuta</label>
          <input
            id="currency"
            name="currency"
            type="text"
            className="text-input"
            defaultValue="EUR"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button className="btn w-auto px-6" disabled={saving} type="submit">
          {saving ? "Shranjujem..." : "Dodaj servis"}
        </button>
      </div>
    </form>
  );
}
