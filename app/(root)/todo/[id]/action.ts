"use server";

import { revalidatePath } from "next/cache";
import { serverClient } from "@/sanity/lib/serverClient";
import { requireUser } from "@/lib/requireUser";

type TodoMutationResult = {
  success: boolean;
  error: string | null;
  redirectTo?: string;
};

async function getOwnedTodo(id: string, userId: string) {
  return serverClient.fetch(
    `*[_type == "todo" && _id == $id && user._ref == $userId][0]{
      _id,
      "carId": car->_id
    }`,
    { id, userId }
  );
}

function revalidateTodoPaths(todoId: string, carId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/todo");
  revalidatePath(`/todo/${todoId}`);

  if (carId) {
    revalidatePath(`/vehicle/${carId}`);
    revalidatePath(`/vehicle/${carId}/todo`);
  }
}

export async function updateTodo(
  id: string,
  formData: FormData
): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "To-do not found." };
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

    await serverClient
      .patch(id)
      .set({
        title,
        description: description || undefined,
        dueDate,
        priority,
        status,
      })
      .commit();

    revalidateTodoPaths(id, todo.carId);

    return { success: true, error: null, redirectTo: `/todo/${id}` };
  } catch (err) {
    console.error("UPDATE TODO ERROR:", err);
    return { success: false, error: "Failed to update to-do." };
  }
}

export async function completeTodo(id: string): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "To-do not found." };
    }

    await serverClient.patch(id).set({ status: "done" }).commit();

    revalidateTodoPaths(id, todo.carId);

    return { success: true, error: null, redirectTo: `/todo/${id}` };
  } catch (err) {
    console.error("COMPLETE TODO ERROR:", err);
    return { success: false, error: "Failed to complete to-do." };
  }
}

export async function deleteTodo(id: string): Promise<TodoMutationResult> {
  try {
    const { userId } = await requireUser();
    const todo = await getOwnedTodo(id, userId);

    if (!todo?._id) {
      return { success: false, error: "To-do not found." };
    }

    await serverClient.delete(id);

    revalidateTodoPaths(id, todo.carId);

    return {
      success: true,
      error: null,
      redirectTo: todo.carId ? `/vehicle/${todo.carId}/todo` : "/todo",
    };
  } catch (err) {
    console.error("DELETE TODO ERROR:", err);
    return { success: false, error: "Failed to delete to-do." };
  }
}
