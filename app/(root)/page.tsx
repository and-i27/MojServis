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
  const { session } = await requireUser();

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
    <section className="main">
      <h1>Dobrodošli nazaj, {session.user.name}!</h1>
      <p className="text-lg">Hiter pregled vaših vozil in nedavnih dejavnosti</p>

      {cars.length === 0 ? (
        <div className="sm:flex sm:items-center sm:justify-between sm:space-y-0 space-y-3 rounded-lg bg-secondary p-6 text-primary text-sm shadow-xl">
          <p className="w-fit">Nimate še vozil. Dodajte svoje prvo vozilo, da začnete spremljati storitve in stroške.</p>
          <Link href="/vehicle/create" className="w-full sm:w-auto">
            <button className="btn w-full">Dodaj vozilo</button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((vehicle) => {
            const title = vehicle.name || vehicle.makeModel || "Vehicle";

            return (
              <Link
                key={vehicle._id}
                href={`/vehicle/${vehicle._id}`}
                className="rounded-lg bg-secondary text-primary p-4 shadow transition hover:shadow-xl"
              >
                <div
                  className="mb-4 h-32 w-full rounded-md bg-cover bg-center"
                  style={vehicle.imageUrl ? { backgroundImage: `url(${vehicle.imageUrl})` } : undefined}
                />
                <div className="font-semibold">{title}</div>
                <div className="mt-2 text-sm">
                  {vehicle.year ? `Letnik ${vehicle.year} - ` : ""}
                  {vehicle.plate ? `Registrska oznaka: ${vehicle.plate}` : "Brez registrske oznake"}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-secondary text-primary p-5 shadow-xl">
          <div className="font-semibold">Prihajajoča opravila</div>
          <div className="mt-4 grid gap-3 text-sm">
            {todos.length === 0 ? (
              <div>Nimate odprtega opravila.</div>
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

        <div className="rounded-lg bg-secondary text-primary p-5 shadow-xl">
          <div className="font-semibold">Zadnji servisi</div>
          <div className="mt-4 grid gap-3 text-sm">
            {services.length === 0 ? (
              <div>Nimate še zabeleženih servisov.</div>
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

      <div className="rounded-lg bg-secondary text-primary p-5 text-sm shadow-xl">
        {cars.length} vozil, {todos.length} odprtih opravil in {services.length} nedavnih vnosov servisa.
      </div>
    </section>
  );
}
