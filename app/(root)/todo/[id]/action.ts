"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/WriteClient";
import { requireUser } from "@/lib/requireUser";

type TodoMutationResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

type OwnedTodo = {
  _id: string;
  carId?: string;
};

async function getOwnedTodo(
  id: string,
  userId: string,
): Promise<OwnedTodo | null> {
  return writeClient.fetch(
    `*[_type == "todo" && _id == $id && user._ref == $userId][0]{
      _id,
      "carId": car->_id
    }`,
    { id, userId },
  );
}

function revalidateTodoPaths(todoId: string, carId?: string) {
  revalidatePath("/todo");
  revalidatePath(`/todo/${todoId}`);

  if (carId) {
    revalidatePath(`/vehicle/${carId}`);
    revalidatePath(`/vehicle/${carId}/todo`);
  }
}

export async function updateTodo(
  id: string,
  formData: FormData,
): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "Opravilo ni bilo najdeno." };
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const dueDate = String(formData.get("dueDate") || "").trim();
    const priority =
      String(formData.get("priority") || "medium").trim() || "medium";
    const status = String(formData.get("status") || "open").trim() || "open";
    const reminderEnabled = formData.get("reminderEnabled") === "on";
    const reminderOffset =
      String(formData.get("reminderOffset") || "1week").trim() || "1week";

    if (!title) {
      return { success: false, error: "Naslov je obvezen." };
    }

    if (!dueDate) {
      return { success: false, error: "Datum roka je obvezen." };
    }

    let patch = writeClient.patch(id).set({
      title,
      description: description || undefined,
      dueDate,
      priority,
      status,
      reminderEnabled,
      reminderOffset: reminderEnabled ? reminderOffset : undefined,
    });

    patch = patch.unset(["reminderLastSentAt"]);

    if (!reminderEnabled) {
      patch = patch.unset(["reminderOffset"]);
    }

    await patch.commit();

    revalidateTodoPaths(id, todo.carId);

    return { success: true, error: null, redirectTo: `/todo/${id}` };
  } catch (err) {
    console.error("UPDATE TODO ERROR:", err);
    return {
      success: false,
      error: "Pri posodobljanju opravila prišlo do napake.",
    };
  }
}

export async function completeTodo(id: string): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "Opravilo ni bilo najdeno." };
    }

    await writeClient.patch(id).set({ status: "done" }).commit();

    revalidateTodoPaths(id, todo.carId);

    return { success: true, error: null, redirectTo: `/todo/${id}` };
  } catch (err) {
    console.error("COMPLETE TODO ERROR:", err);
    return {
      success: false,
      error: "Pri označevanju opravila kot končanega prišlo do napake.",
    };
  }
}

export async function deleteTodo(id: string): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "Opravilo ni bilo najdeno." };
    }

    await writeClient.delete(id);

    revalidateTodoPaths(id, todo.carId);

    return {
      success: true,
      error: null,
      redirectTo: todo.carId ? `/vehicle/${todo.carId}/todo` : "/todo",
    };
  } catch (err) {
    console.error("DELETE TODO ERROR:", err);
    return { success: false, error: "Pri brisanju opravila prišlo do napake." };
  }
}
