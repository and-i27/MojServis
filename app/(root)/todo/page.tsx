import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import { reminderOffsetLabel } from "@/lib/todoReminder";

type TodoListItem = {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  priority: string;
  reminderEnabled?: boolean;
  reminderOffset?: string;
  carName?: string;
  carId?: string;
};

const statusLabel: Record<string, string> = {
  open: "Stanje: odprto",
  done: "Stanje: končano",
  cancelled: "Stanje: preklicano",
};

const priorityLabel: Record<string, string> = {
  low: "Nizka prioriteta",
  medium: "Srednja prioriteta",
  high: "Visoka prioriteta",
};

const statusClassName: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  done: "bg-green-100 text-green-800",
  cancelled: "bg-neutral-200 text-neutral-700",
};

export default async function TodoPage() {
  const { userId } = await requireUser();

  const todos: TodoListItem[] = await client.fetch(
    `*[_type == "todo" && user._ref == $userId] | order(dueDate asc){
      _id,
      title,
      description,
      dueDate,
      status,
      priority,
      reminderEnabled,
      reminderOffset,
      "carName": car->name,
      "carId": car->_id
    }`,
    { userId },
  );

  return (
    <section className="main">
      <h1>Vsa opravila</h1>
      <p className="text-lg">Vsi opomniki in čakajoča dela za vaša vozila.</p>

      <div className="section-primary p-5!">
        {todos.length === 0 ? (
          <p className="text-sm">Ni še dodanih opravil.</p>
        ) : (
          <div className="grid gap-3">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className="rounded-lg bg-background text-secondary p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{todo.title}</div>
                    {todo.carId && (
                      <div className="text-sm">
                        Vozilo:{" "}
                        <Link
                          href={`/vehicle/${todo.carId}`}
                          className="text-sm hover:text-secondary/80"
                        >
                          {todo.carName ?? "Vozilo"}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700">
                      {priorityLabel[todo.priority] ?? todo.priority}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 ${statusClassName[todo.status] ?? "bg-neutral-100 text-neutral-700"}`}
                    >
                      {statusLabel[todo.status] ?? todo.status}
                    </span>
                  </div>
                </div>

                <div className="border-b"></div>

                <div className="mt-2 text-sm">
                  Rok: {new Date(todo.dueDate).toLocaleDateString("sl-SI")}
                </div>
                {!todo.reminderEnabled && (
                  <div className="mt-1 text-sm">
                    Opomnik:{" "}
                    {reminderOffsetLabel[todo.reminderOffset ?? "1week"] ??
                      "E - poštna opombe aktivne"}
                  </div>
                )}
                {todo.description && (
                  <p className="mt-2 text-sm">{todo.description}</p>
                )}
                <div className="mt-4 mb-2">
                  <Link href={`/todo/${todo._id}`} className="btn w-auto">
                    Podrobnosti
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
