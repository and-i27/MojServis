import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import AddVehicleTodoForm from "@/app/components/AddVehicleTodoForm";
import { reminderOffsetLabel } from "@/lib/todoReminder";

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
    reminderEnabled?: boolean;
    reminderOffset?: string;
  }[];
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
        priority,
        reminderEnabled,
        reminderOffset
      }
    }`,
    { id, userId },
  );

  if (!vehicle) {
    return (
      <section className="main">
        <div className="section-primary p-5">Vozilo ni najdeno.</div>
      </section>
    );
  }

  return (
    <section className="main">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="sm:w-1/2 text-center">
          <h1>Opravila za vozilo</h1>
          <p className="text-lg">
            Dodaj opomnike in spremljaj odprta opravila za {vehicle.name}.
          </p>
        </div>
        <Link
          href={`/vehicle/${id}`}
          className="btn text-center w-full sm:w-auto"
        >
          Nazaj na vozilo
        </Link>
      </div>

      <div className="border-b"></div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-primary p-5!">
          <div className="mb-4 font-semibold">Dodaj opravilo</div>
          <AddVehicleTodoForm carId={id} />
        </div>

        <div className="section-primary p-5!">
          <div className="mb-4 font-semibold">Opravila za vozilo</div>
          {vehicle.todos.length === 0 ? (
            <p className="text-sm">Za to vozilo še ni opravil.</p>
          ) : (
            <div className="grid gap-3">
              {vehicle.todos.map((todo) => (
                <div
                  key={todo._id}
                  className="rounded-lg bg-background text-secondary p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium">{todo.title}</div>
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

                  <div className="text-sm">
                    Rok {new Date(todo.dueDate).toLocaleDateString("sl-SI")}
                  </div>
                  {todo.reminderEnabled && (
                    <div className="mt-1 text-sm text-[color:var(--muted)]">
                      {reminderOffsetLabel[todo.reminderOffset ?? "1week"] ??
                        "Email reminder active"}
                    </div>
                  )}
                  {todo.description && (
                    <p className="text-sm">{todo.description}</p>
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
      </div>
    </section>
  );
}
