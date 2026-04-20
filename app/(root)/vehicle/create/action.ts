"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeClient } from '@/sanity/lib/WriteClient';

export type CreateCarResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

export async function createCar(formData: FormData): Promise<CreateCarResult> {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return { success: false, error: "Za dodajanje vozila se morate prijaviti." };
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

    let user = await writeClient.fetch(
      `*[_type == "user" && email == $email][0]{ _id }`,
      { email }
    );

    if (!user?._id) {
      const created = await writeClient.create({
        _type: "user",
        name: session?.user?.name ?? "User",
        email,
        provider: "system",
      });
      user = { _id: created._id };
    }

    const imageFiles = formData.getAll("images");
    const imageRefs: {
      _type: "image";
      asset: { _type: "reference"; _ref: string };
    }[] = [];

    for (const file of imageFiles) {
      if (file instanceof File && file.size > 0) {
        const asset = await writeClient.assets.upload("image", file, {
          filename: file.name,
        });
        imageRefs.push({
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        });
      }
    }

    const createdCar = await writeClient.create({
      _type: "car",
      name,
      owner: { _type: "reference", _ref: user._id },
      makeModel: makeModel || undefined,
      year: Number.isFinite(year) ? year : undefined,
      plate: plate || undefined,
      vin: vin || undefined,
      odometer: Number.isFinite(odometer) ? odometer : undefined,
      notes: notes || undefined,
      images: imageRefs.length ? imageRefs : undefined,
    });

    revalidatePath(`/vehicle/${createdCar._id}`);

    return {
      success: true,
      error: null,
      redirectTo: `/vehicle/${createdCar._id}`,
    };
  } catch (err) {
    console.error("CREATE CAR ERROR:", err);
    return { success: false, error: "Pri dodajanju vozila je prišlo do napake." };
  }
}
