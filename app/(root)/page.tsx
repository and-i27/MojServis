import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";

type CarListItem = {
  _id: string;
  name: string;
  makeModel?: string;
  year?: number;
  plate?: string;
  notes?: string;
  imageUrl?: string;
};

type TodoItem = {
  _id: string;
  title: string;
  dueDate: string;
  carName?: string;
  carId?: string;
};

type ServiceItem = {
  _id: string;
  title: string;
  date: string;
  cost?: number;
  currency?: string;
  carName?: string;
  carId?: string;
};

export default async function Home() {
  const { userId } = await requireUser();

  const [cars, todos, services]: [CarListItem[], TodoItem[], ServiceItem[]] = await Promise.all([
    client.fetch(
      `*[_type == "car" && owner._ref == $userId] | order(_createdAt desc)[0...12]{
        _id,
        name,
        "makeModel": coalesce(makeModel, make),
        year,
        plate,
        notes,
        "imageUrl": images[0].asset->url
      }`,
      { userId }
    ),
    client.fetch(
      `*[_type == "todo" && user._ref == $userId && status == "open"] | order(dueDate asc)[0...5]{
        _id,
        title,
        dueDate,
        "carName": car->name,
        "carId": car->_id
      }`,
      { userId }
    ),
    client.fetch(
      `*[_type == "serviceRecord" && user._ref == $userId] | order(date desc)[0...5]{
        _id,
        title,
        date,
        cost,
        currency,
        "carName": car->name,
        "carId": car->_id
      }`,
      { userId }
    ),
  ]);

  return (
    <section className="mainContent">
      <h1 className="heading">Welcome Back</h1>
      <p className="text-sm text-[color:var(--muted)]">
        Quick overview of your vehicles and recent activity.
      </p>

      {cars.length === 0 ? (
        <div className="rounded-lg border border-[color:var(--border)] bg-white p-6 text-sm text-[color:var(--muted)]">
          No vehicles yet. Add your first vehicle to start tracking services and costs.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((vehicle) => {
            const title = vehicle.name || vehicle.makeModel || "Vehicle";

            return (
              <Link
                key={vehicle._id}
                href={`/vehicle/${vehicle._id}`}
                className="rounded-lg border border-[color:var(--border)] bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div
                  className="mb-4 h-32 w-full rounded-md border border-dashed border-[color:var(--border)] bg-gray-50 bg-cover bg-center"
                  style={vehicle.imageUrl ? { backgroundImage: `url(${vehicle.imageUrl})` } : undefined}
                />
                <div className="text-base font-semibold">{title}</div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">
                  {vehicle.year ? `${vehicle.year} - ` : ""}
                  {vehicle.plate ?? "No plate"}
                  {vehicle.notes ? ` - ${vehicle.notes}` : ""}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Upcoming tasks</div>
          <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
            {todos.length === 0 ? (
              <div>No open tasks yet.</div>
            ) : (
              todos.map((todo) => (
                <div key={todo._id} className="flex items-center justify-between gap-3">
                  <div>
                    <div>{todo.title}</div>
                    {todo.carId && (
                      <Link href={`/vehicle/${todo.carId}/todo`} className="text-xs hover:text-black">
                        {todo.carName ?? "Vehicle"}
                      </Link>
                    )}
                  </div>
                  <span className="text-black">{new Date(todo.dueDate).toLocaleDateString("sl-SI")}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold">Recent services</div>
          <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
            {services.length === 0 ? (
              <div>No service records yet.</div>
            ) : (
              services.map((service) => (
                <div key={service._id} className="flex items-center justify-between gap-3">
                  <div>
                    <div>{service.title}</div>
                    {service.carId && (
                      <Link href={`/vehicle/${service.carId}/services`} className="text-xs hover:text-black">
                        {service.carName ?? "Vehicle"}
                      </Link>
                    )}
                  </div>
                  <span className="text-black">
                    {typeof service.cost === "number"
                      ? `${service.cost.toFixed(2)} ${service.currency ?? "EUR"}`
                      : new Date(service.date).toLocaleDateString("sl-SI")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 text-sm text-[color:var(--muted)]">
        {cars.length} vehicles, {todos.length} open tasks in view, and {services.length} recent service entries.
      </div>
    </section>
  );
}
