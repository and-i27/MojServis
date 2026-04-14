"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from '@/sanity/lib/WriteClient';
import { requireUser } from "@/lib/requireUser";

type ServiceActionResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

export async function createVehicleService(
  carId: string,
  formData: FormData
): Promise<ServiceActionResult> {
  try {
    const { userId } = await requireUser();

    const car = await writeClient.fetch(
      `*[_type == "car" && _id == $carId && owner._ref == $userId][0]{ _id }`,
      { carId, userId }
    );

    if (!car?._id) {
      return { success: false, error: "Vehicle not found." };
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const odometerRaw = String(formData.get("odometer") || "").trim();
    const costRaw = String(formData.get("cost") || "").trim();
    const currency = String(formData.get("currency") || "EUR").trim() || "EUR";

    if (!title) {
      return { success: false, error: "Title is required." };
    }

    if (!date) {
      return { success: false, error: "Date is required." };
    }

    const odometer = odometerRaw ? Number(odometerRaw) : undefined;
    const cost = costRaw ? Number(costRaw) : undefined;

    await writeClient.create({
      _type: "serviceRecord",
      title,
      description: description || undefined,
      date,
      odometer: Number.isFinite(odometer) ? odometer : undefined,
      cost: Number.isFinite(cost) ? cost : undefined,
      currency,
      car: { _type: "reference", _ref: carId },
      user: { _type: "reference", _ref: userId },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/vehicle/${carId}`);
    revalidatePath(`/vehicle/${carId}/services`);

    return { success: true, error: null, redirectTo: `/vehicle/${carId}/services` };
  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    return { success: false, error: "Failed to create service record." };
  }
}
