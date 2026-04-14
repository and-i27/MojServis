"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { deleteVehicle, removeVehicleImage, updateVehicle } from "@/app/(root)/vehicle/[id]/edit/action";

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
      }))
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

    const confirmed = window.confirm("Are you sure you want to delete this vehicle image?");

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
      "Are you sure you want to delete this vehicle? This action cannot be undone."
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
    <section className="authPage">
      <section className="w-full max-w-3xl rounded-lg border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-6 text-2xl font-semibold text-black">Edit vehicle</div>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="authInput"
                defaultValue={vehicle.name}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="makeModel">Make / Model</label>
              <input
                id="makeModel"
                name="makeModel"
                type="text"
                className="authInput"
                defaultValue={vehicle.makeModel ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="year">Year</label>
              <input
                id="year"
                name="year"
                type="number"
                className="authInput"
                defaultValue={vehicle.year ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="plate">License plate</label>
              <input
                id="plate"
                name="plate"
                type="text"
                className="authInput"
                defaultValue={vehicle.plate ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="vin">VIN</label>
              <input
                id="vin"
                name="vin"
                type="text"
                className="authInput"
                defaultValue={vehicle.vin ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="odometer">Odometer (km)</label>
              <input
                id="odometer"
                name="odometer"
                type="number"
                className="authInput"
                defaultValue={vehicle.odometer ?? ""}
              />
            </div>
          </div>

          {vehicle.images.length > 0 && (
            <div className="flex flex-col gap-2">
              <label>Current images</label>
              <p className="text-xs text-[color:var(--muted)]">
                Click an image to remove it.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {vehicle.images.map((image, index) => {
                  const isRemoving = removingImageRef === image.assetRef;

                  return (
                    <button
                      key={image.assetRef}
                      type="button"
                      onClick={() => handleRemoveImage(image.assetRef)}
                      disabled={saving || deleting || !!removingImageRef}
                      className="group overflow-hidden rounded-lg border border-neutral-200 bg-white text-left disabled:opacity-60"
                    >
                      <div className="relative h-28 w-full">
                        <Image
                          src={image.url}
                          alt={`${vehicle.name} current image ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 flex items-end bg-black/0 p-2 transition group-hover:bg-black/35">
                          <span className="rounded bg-black/70 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
                            {isRemoving ? "Removing..." : "Remove image"}
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
            <label htmlFor="images">Add more images</label>
            <input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="authInput"
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
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="authInput"
              defaultValue={vehicle.notes ?? ""}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="buttonPrimary w-auto px-6" disabled={saving || deleting || !!removingImageRef} type="submit">
              {saving ? "Updating..." : "Update vehicle"}
            </button>
            <button
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              disabled={saving || deleting || !!removingImageRef}
              type="button"
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete vehicle"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
