"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/WriteClient";
import { requireUser } from "@/lib/requireUser";

type TodoActionResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

export async function createVehicleTodo(
  carId: string,
  formData: FormData,
): Promise<TodoActionResult> {
  try {
    const { userId } = await requireUser();

    const car = await writeClient.fetch(
      `*[_type == "car" && _id == $carId && owner._ref == $userId][0]{ _id }`,
      { carId, userId },
    );

    if (!car?._id) {
      return { success: false, error: "Vozilo ni najdeno." };
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const dueDate = String(formData.get("dueDate") || "").trim();
    const priority =
      String(formData.get("priority") || "medium").trim() || "medium";
    const status = String(formData.get("status") || "open").trim() || "open";
    const reminderEnabled = formData.get("reminderEnabled") === "on";
    const reminderOffset = String(formData.get("reminderOffset") || "1week").trim() || "1week";

    if (!title) {
      return { success: false, error: "Ime opravila je obvezno." };
    }

    if (!dueDate) {
      return { success: false, error: "Datum roka je obvezen." };
    }

    await writeClient.create({
      _type: "todo",
      title,
      description: description || undefined,
      dueDate,
      priority,
      status,
      reminderEnabled,
      reminderOffset: reminderEnabled ? reminderOffset : undefined,
      car: { _type: "reference", _ref: carId },
      user: { _type: "reference", _ref: userId },
    });

    revalidatePath("/todo");
    revalidatePath(`/vehicle/${carId}`);
    revalidatePath(`/vehicle/${carId}/todo`);

    return { success: true, error: null, redirectTo: `/vehicle/${carId}/todo` };
  } catch (err) {
    console.error("CREATE TODO ERROR:", err);
    return {
      success: false,
      error: "Pri dodajanju opravila je prišlo do napake.",
    };
  }
}
