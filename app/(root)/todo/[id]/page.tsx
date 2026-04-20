import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import TodoDetailForm from "@/app/components/TodoDetailForm";
import { reminderOffsetLabel } from "@/lib/todoReminder";

type TodoDetailPageData = {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: string;
  status: string;
  reminderEnabled?: boolean;
  reminderOffset?: string;
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
      reminderEnabled,
      reminderOffset,
      "carName": car->name,
      "carId": car->_id
    }`,
    { id, userId },
  );

  if (!todo) {
    notFound();
  }

  return (
    <section className="main">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="w-full sm:w-1/2 text-center space-y-2">
          <h1>Podrobnosti opravila</h1>

          <Link
            href={`/vehicle/${todo.carId}/todo`}
            className="inline-block hover:text-secondary/80"
          >
            Nazaj na opravila vozila {todo.carName ?? "vehicle"}
          </Link>
          <div>
            Opomnik:{" "}
            {todo.reminderEnabled
              ? (reminderOffsetLabel[todo.reminderOffset ?? "1week"] ??
                todo.reminderOffset)
              : "Ne aktiven"}
          </div>
        </div>

        <div className="flex flex-wrap items-center text-center gap-4 w-full sm:w-auto sm:h-full">
          <Link href="/todo" className="btn w-full sm:w-auto">
            Vsa opravila
          </Link>
          <Link
            href={`/vehicle/${todo.carId}`}
            className="btn w-full sm:w-auto"
          >
            Nazaj na vozilo
          </Link>
        </div>
      </div>

      <div className="border-b"></div>

      <section className="section-primary">
        <TodoDetailForm todo={todo} />
      </section>
    </section>
  );
}
