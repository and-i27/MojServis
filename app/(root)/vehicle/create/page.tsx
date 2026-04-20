"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createCar } from "./action";

export default function CreateVehiclePage() {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));

    const files = Array.from(e.target.files ?? []);
    setPreviews(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCar(formData);

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
    <section className="main">
      <h1>Dodaj vozilo</h1>
      <p className="text-lg text-center">
        Dodajte novo vozilo, da ga lahko spremljate in upravljate z njegovimi
        storitvami in stroški.
      </p>
      <section className="section-primary">
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name">Ime *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="text-input"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="makeModel">Znamka in model</label>
              <input
                id="makeModel"
                name="makeModel"
                type="text"
                className="text-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="year">Letnik</label>
              <input
                id="year"
                name="year"
                type="number"
                className="text-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="plate">Registrska oznaka</label>
              <input
                id="plate"
                name="plate"
                type="text"
                className="text-input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="vin">VIN</label>
              <input id="vin" name="vin" type="text" className="text-input" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="odometer">Prevoženi km</label>
              <input
                id="odometer"
                name="odometer"
                type="number"
                min="0"
                className="text-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="images">Slike</label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="btn p-2!"
              onChange={handleImageChange}
            />
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 h-fit">
                {previews.map((preview) => (
                  <div
                    key={preview.url}
                    className=" rounded-lg border border-neutral-200 bg-white"
                  >
                    <div className="relative h-32 w-full">
                      <Image
                        src={preview.url}
                        alt={preview.name}
                        fill
                        unoptimized
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <p className="truncate px-2 py-1 text-xs text-neutral-600">
                      {preview.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="notes">Opombe</label>
            <textarea id="notes" name="notes" rows={4} className="text-input" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="btn w-auto px-6" disabled={saving} type="submit">
              {saving ? "Shranjujem..." : "Shrani vozilo"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
