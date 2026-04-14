import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";

type TodoListItem = {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  priority: string;
  carName?: string;
  carId?: string;
};

const statusLabel: Record<string, string> = {
  open: "Status: open",
  done: "Status: done",
  cancelled: "Status: canceleed",
};

const priorityLabel: Record<string, string> = {
  low: "low priority",
  medium: "medium priority",
  high: "high priority",
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
      "carName": car->name,
      "carId": car->_id
    }`,
    { userId }
  );

  return (
    <section className="mainContent">
      <div>
        <h1 className="heading text-left">All To-do</h1>
        <p className="text-sm text-[color:var(--muted)]">
          All reminders and pending work for your vehicles.
        </p>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
        {todos.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">No to-do items yet.</p>
        ) : (
          <div className="grid gap-3">
            {todos.map((todo) => (
              <div key={todo._id} className="rounded-lg border border-[color:var(--border)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-black">{todo.title}</div>
                    {todo.carId && (
                      <Link href={`/vehicle/${todo.carId}`} className="text-sm text-[color:var(--muted)] hover:text-black">
                        {todo.carName ?? "Vehicle"}
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-700">
                      {priorityLabel[todo.priority] ?? todo.priority}
                    </span>
                    <span className={`rounded-full px-2 py-1 ${statusClassName[todo.status] ?? "bg-neutral-100 text-neutral-700"}`}>
                      {statusLabel[todo.status] ?? todo.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">
                  Due {new Date(todo.dueDate).toLocaleString("sl-SI")}
                </div>
                {todo.description && (
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{todo.description}</p>
                )}
                <div className="mt-3">
                  <Link href={`/todo/${todo._id}`} className="button w-auto">
                    Open
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
