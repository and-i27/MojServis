import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import AddVehicleTodoForm from "@/components/vehicle/AddVehicleTodoForm";

type VehicleTodoPageData = {
  _id: string;
  name: string;
  todos: {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: string;
    priority: string;
  }[];
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

export default async function VehicleTodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requireUser();
  const { id } = await params;

  const vehicle: VehicleTodoPageData | null = await client.fetch(
    `*[_type == "car" && _id == $id && owner._ref == $userId][0]{
      _id,
      name,
      "todos": *[_type == "todo" && car._ref == $id && user._ref == $userId] | order(dueDate asc){
        _id,
        title,
        description,
        dueDate,
        status,
        priority
      }
    }`,
    { id, userId }
  );

  if (!vehicle) {
    return (
      <section className="mainContent">
        <div className="rounded-lg border border-[color:var(--border)] bg-white p-6 text-sm text-[color:var(--muted)]">
          Vehicle not found.
        </div>
      </section>
    );
  }

  return (
    <section className="mainContent">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="heading text-left">Vehicle To-do</h1>
          <p className="text-sm text-[color:var(--muted)]">
            Add reminders and track open tasks for {vehicle.name}.
          </p>
        </div>
        <Link href={`/vehicle/${id}`} className="button w-auto">
          Back to vehicle
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold">Add to-do</div>
          <AddVehicleTodoForm carId={id} />
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-semibold">Vehicle tasks</div>
          {vehicle.todos.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">
              No tasks yet for this vehicle.
            </p>
          ) : (
            <div className="grid gap-3">
              {vehicle.todos.map((todo) => (
                <div key={todo._id} className="rounded-lg border border-[color:var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium text-black">{todo.title}</div>
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
      </div>
    </section>
  );
}
