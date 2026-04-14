"use server";

import { revalidatePath } from "next/cache";
import { serverClient } from "@/sanity/lib/serverClient";
import { requireUser } from "@/lib/requireUser";

type TodoActionResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

export async function createVehicleTodo(
  carId: string,
  formData: FormData
): Promise<TodoActionResult> {
  try {
    const { userId } = await requireUser();

    const car = await serverClient.fetch(
      `*[_type == "car" && _id == $carId && owner._ref == $userId][0]{ _id }`,
      { carId, userId }
    );

    if (!car?._id) {
      return { success: false, error: "Vehicle not found." };
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const dueDate = String(formData.get("dueDate") || "").trim();
    const priority = String(formData.get("priority") || "medium").trim() || "medium";
    const status = String(formData.get("status") || "open").trim() || "open";

    if (!title) {
      return { success: false, error: "Title is required." };
    }

    if (!dueDate) {
      return { success: false, error: "Due date is required." };
    }

    await serverClient.create({
      _type: "todo",
      title,
      description: description || undefined,
      dueDate,
      priority,
      status,
      car: { _type: "reference", _ref: carId },
      user: { _type: "reference", _ref: userId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/todo");
    revalidatePath(`/vehicle/${carId}`);
    revalidatePath(`/vehicle/${carId}/todo`);

    return { success: true, error: null, redirectTo: `/vehicle/${carId}/todo` };
  } catch (err) {
    console.error("CREATE TODO ERROR:", err);
    return { success: false, error: "Failed to create to-do." };
  }
}
