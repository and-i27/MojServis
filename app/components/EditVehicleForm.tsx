"use client";

import VinInputField from "@/app/components/VinInputField";
import {
  deleteVehicle,
  removeVehicleImage,
  updateVehicle,
} from "@/app/(root)/vehicle/[id]/edit/action";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type VehicleImage = {
  url: string;
  assetRef: string;
};

type EditVehicleFormProps = {
  vehicle: {
    _id: string;
    name: string;
    makeModel?: string;
    year?: number;
    plate?: string;
    vin?: string;
    odometer?: number;
    notes?: string;
    images: VehicleImage[];
  };
};

export default function EditVehicleForm({ vehicle }: EditVehicleFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingImageRef, setRemovingImageRef] = useState<string | null>(null);
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
    if (saving || deleting || removingImageRef) return;

    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateVehicle(vehicle._id, formData);

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

  async function handleRemoveImage(assetRef: string) {
    if (saving || deleting || removingImageRef) return;

    const confirmed = window.confirm(
      "Ali ste prepričani, da želite odstraniti to sliko vozila?",
    );

    if (!confirmed) {
      return;
    }

    setRemovingImageRef(assetRef);
    setError(null);

    const result = await removeVehicleImage(vehicle._id, assetRef);

    if (!result.success) {
      setError(result.error);
      setRemovingImageRef(null);
      return;
    }

    window.location.reload();
  }

  async function handleDelete() {
    if (saving || deleting || removingImageRef) return;

    const confirmed = window.confirm(
      "Ali ste prepričani, da želite izbrisati to vozilo? Tega ni mogoče razveljaviti.",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError(null);

    const result = await deleteVehicle(vehicle._id);

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
    <section className="main">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="text-center sm:w-1/2">
          <h1>Uredi {vehicle.name}</h1>
          <p className="text-lg">
            Uredite podatke o vozilu, dodajte ali odstranite slike in dodajte
            opombe.
          </p>
        </div>
        <Link
          href={`/vehicle/${vehicle._id}`}
          className="btn w-full text-center sm:w-auto"
        >
          Nazaj na vozilo
        </Link>
      </div>

      <div className="border-b"></div>

      <section className="section-primary w-full">
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
                defaultValue={vehicle.name}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="makeModel">Znamka / Model</label>
              <input
                id="makeModel"
                name="makeModel"
                type="text"
                className="text-input"
                defaultValue={vehicle.makeModel ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="year">Letnik</label>
              <input
                id="year"
                name="year"
                type="number"
                className="text-input"
                defaultValue={vehicle.year ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="plate">Registrska oznaka</label>
              <input
                id="plate"
                name="plate"
                type="text"
                className="text-input"
                defaultValue={vehicle.plate ?? ""}
              />
            </div>

            <VinInputField initialVin={vehicle.vin ?? ""} />

            <div className="flex flex-col gap-2">
              <label htmlFor="odometer">Prevoženi km</label>
              <input
                id="odometer"
                name="odometer"
                type="number"
                className="text-input"
                defaultValue={vehicle.odometer ?? ""}
              />
            </div>
          </div>

          {vehicle.images.length > 0 && (
            <div className="flex flex-col gap-2">
              <label>Trenutne slike</label>
              <p>Kliknite na sliko, da jo odstranite.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {vehicle.images.map((image, index) => {
                  const isRemoving = removingImageRef === image.assetRef;

                  return (
                    <button
                      key={image.assetRef}
                      type="button"
                      onClick={() => handleRemoveImage(image.assetRef)}
                      disabled={saving || deleting || !!removingImageRef}
                      className="group overflow-hidden rounded-lg border border-primary bg-primary/10 text-left disabled:opacity-60"
                    >
                      <div className="relative h-28 w-full">
                        <Image
                          src={image.url}
                          alt={`${vehicle.name} trenutna slika ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 flex items-center bg-black/0 p-2 transition group-hover:cursor-pointer group-hover:bg-black/35">
                          <span className="mx-auto rounded bg-secondary/65 px-2 py-1 text-[11px] text-primary opacity-0 transition group-hover:opacity-100">
                            {isRemoving ? "Odstranjevanje..." : "Odstrani sliko"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="images">Dodaj več slik</label>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((preview) => (
                  <div
                    key={preview.url}
                    className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                  >
                    <div className="relative h-28 w-full">
                      <Image
                        src={preview.url}
                        alt={preview.name}
                        fill
                        unoptimized
                        className="object-cover"
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
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="text-input"
              defaultValue={vehicle.notes ?? ""}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="btn w-auto px-6 disabled:opacity-60"
              disabled={saving || deleting || !!removingImageRef}
              type="submit"
            >
              {saving ? "Posodabljanje..." : "Posodobi vozilo"}
            </button>
            <button
              className="btn border border-red-600 bg-red-300! text-red-600! disabled:opacity-60"
              disabled={saving || deleting || !!removingImageRef}
              type="button"
              onClick={handleDelete}
            >
              {deleting ? "Brisanje..." : "Izbriši vozilo"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
