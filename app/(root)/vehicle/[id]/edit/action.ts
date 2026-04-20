"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeClient } from "@/sanity/lib/WriteClient";

type VehicleMutationResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

type CarImage = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
};

type CarRecord = {
  _id: string;
  images?: CarImage[];
};

async function getCurrentUserId() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await writeClient.fetch(
    `*[_type == "user" && email == $email][0]{ _id }`,
    { email },
  );

  return user?._id ?? null;
}

async function getOwnedCar(
  id: string,
  ownerId: string,
): Promise<CarRecord | null> {
  return writeClient.fetch(
    `*[_type == "car" && _id == $id && owner._ref == $ownerId][0]{
      _id,
      images
    }`,
    { id, ownerId },
  );
}

export async function updateVehicle(
  id: string,
  formData: FormData,
): Promise<VehicleMutationResult> {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return { success: false, error: "Za urejanje vozila se prijavite." };
    }

    const car = await getOwnedCar(id, ownerId);
    if (!car?._id) {
      return { success: false, error: "Vozilo ni najdeno." };
    }

    const name = String(formData.get("name") || "").trim();
    const makeModel = String(formData.get("makeModel") || "").trim();
    const yearRaw = String(formData.get("year") || "").trim();
    const plate = String(formData.get("plate") || "").trim();
    const vin = String(formData.get("vin") || "").trim();
    const odometerRaw = String(formData.get("odometer") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!name) {
      return { success: false, error: "Ime je obvezno." };
    }

    const year = yearRaw ? Number(yearRaw) : undefined;
    const odometer = odometerRaw ? Number(odometerRaw) : undefined;

    const imageFiles = formData.getAll("images");
    const newImageRefs: CarImage[] = [];

    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const asset = await writeClient.assets.upload("image", file, {
          filename: file.name,
        });
        newImageRefs.push({
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        });
      }
    }

    const images =
      newImageRefs.length > 0
        ? [...(car.images ?? []), ...newImageRefs]
        : car.images;

    await writeClient
      .patch(id)
      .set({
        name,
        makeModel: makeModel || undefined,
        year: Number.isFinite(year) ? year : undefined,
        plate: plate || undefined,
        vin: vin || undefined,
        odometer: Number.isFinite(odometer) ? odometer : undefined,
        notes: notes || undefined,
        images: images && images.length > 0 ? images : undefined,
      })
      .unset(["make", "model"])
      .commit();

    revalidatePath(`/vehicle/${id}`);
    revalidatePath(`/vehicle/${id}/edit`);

    return { success: true, error: null, redirectTo: `/vehicle/${id}` };
  } catch (err) {
    console.error("UPDATE VEHICLE ERROR:", err);
    return {
      success: false,
      error: "Pri posodabljanju vozila je prišlo do napake.",
    };
  }
}

export async function removeVehicleImage(
  id: string,
  assetRef: string,
): Promise<VehicleMutationResult> {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return { success: false, error: "Za odstranjevanje slike se prijavite." };
    }

    const car = await getOwnedCar(id, ownerId);
    if (!car?._id) {
      return { success: false, error: "Vozilo ni najdeno." };
    }

    const nextImages = (car.images ?? []).filter(
      (image) => image.asset._ref !== assetRef,
    );

    await writeClient
      .patch(id)
      .set({
        images: nextImages.length > 0 ? nextImages : undefined,
      })
      .commit();

    revalidatePath(`/vehicle/${id}`);
    revalidatePath(`/vehicle/${id}/edit`);

    return { success: true, error: null };
  } catch (err) {
    console.error("REMOVE VEHICLE IMAGE ERROR:", err);
    return {
      success: false,
      error: "Pri odstranjevanju slike je prišlo do napake.",
    };
  }
}

export async function deleteVehicle(
  id: string,
): Promise<VehicleMutationResult> {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return { success: false, error: "Za brisanje vozila se prijavite." };
    }

    const car = await getOwnedCar(id, ownerId);
    if (!car?._id) {
      return { success: false, error: "Vozilo ni najdeno." };
    }

    await writeClient.delete(id);

    revalidatePath(`/vehicle/${id}`);
    revalidatePath(`/vehicle/${id}/edit`);

    return { success: true, error: null, redirectTo: "/dashboard" };
  } catch (err) {
    console.error("DELETE VEHICLE ERROR:", err);
    return {
      success: false,
      error: "Pri brisanju vozila je prišlo do napake.",
    };
  }
}
