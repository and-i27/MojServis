import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import TodoDetailForm from "@/components/todo/TodoDetailForm";

type TodoDetailPageData = {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: string;
  status: string;
  carName?: string;
  carId?: string;
};

export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requireUser();
  const { id } = await params;

  const todo: TodoDetailPageData | null = await client.fetch(
    `*[_type == "todo" && _id == $id && user._ref == $userId][0]{
      _id,
      title,
      description,
      dueDate,
      priority,
      status,
      "carName": car->name,
      "carId": car->_id
    }`,
    { id, userId }
  );

  if (!todo) {
    notFound();
  }

  return (
    <section className="authPage">
      <section className="w-full max-w-3xl rounded-lg border border-[color:var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-black">To-do detail</div>
            {todo.carId && (
              <Link href={`/vehicle/${todo.carId}/todo`} className="mt-2 inline-block text-sm text-[color:var(--muted)] hover:text-black">
                Back to {todo.carName ?? "vehicle"} tasks
              </Link>
            )}
          </div>
          <Link href="/todo" className="button w-auto">
            All to-dos
          </Link>
        </div>

        <TodoDetailForm todo={todo} />
      </section>
    </section>
  );
}
