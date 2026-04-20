import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import AddVehicleServiceForm from "@/app/components/AddVehicleServiceForm";
import { serviceTypeLabel } from "@/lib/serviceImport";

type VehicleServicesPageData = {
  _id: string;
  name: string;
  odometer?: number;
  services: {
    _id: string;
    serviceType?: string;
    title: string;
    description?: string;
    date: string;
    odometer?: number;
    cost?: number;
    currency?: string;
  }[];
};

export default async function VehicleServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await requireUser();
  const { id } = await params;

  const vehicle: VehicleServicesPageData | null = await client.fetch(
    `*[_type == "car" && _id == $id && owner._ref == $userId][0]{
      _id,
      name,
      odometer,
      "services": *[_type == "serviceRecord" && car._ref == $id && user._ref == $userId] | order(date desc){
        _id,
        serviceType,
        title,
        description,
        date,
        odometer,
        cost,
        currency
      }
    }`,
    { id, userId },
  );

  if (!vehicle) {
    return (
      <section className="main">
        <div className="section-primary">Vozilo ni bilo najdeno.</div>
      </section>
    );
  }

  return (
    <section className="main">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="sm:w-1/2 text-center">
          <h1>Servisi vozila</h1>
          <p className="text-lg">
            Spremljajte zgodovino servisov in stroške za {vehicle.name}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/import/services" className="button w-auto">
            <button className="btn min-w-30">Uvozi servis</button>
          </Link>
          <Link
            href={`/api/vehicle/${id}/services/pdf`}
            className="button w-auto"
          >
            <button className="btn min-w-30">Izvozi PDF</button>
          </Link>
          <Link href={`/vehicle/${id}`} className="button w-auto">
            <button className="btn min-w-30">Nazaj na vozilo</button>
          </Link>
        </div>
      </div>

      <div className="border-b"></div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-primary p-5!">
          <div className="mb-4 font-semibold">Dodaj servis</div>
          <AddVehicleServiceForm carId={id} />
        </div>

        <div className="section-primary p-5!">
          <div className="mb-4 font-semibold">Zgodovina servisov</div>
          {vehicle.services.length === 0 ? (
            <p className="text-sm">Za to vozilo še ni servisnih zapisov.</p>
          ) : (
            <div className="grid gap-3">
              {vehicle.services.map((service) => (
                <div
                  key={service._id}
                  className="rounded-lg bg-background text-secondary p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-medium">{service.title}</div>
                    <div className="text-sm">
                      {new Date(service.date).toLocaleDateString("sl-SI")}
                    </div>
                  </div>

                  <div className="border-b"></div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      Prevoženi km:{" "}
                      {service.odometer
                        ? service.odometer.toLocaleString("sl-SI")
                        : "-"}{" "}
                      km
                    </span>
                    <span>
                      Stroški:{" "}
                      {typeof service.cost === "number"
                        ? `${service.cost.toFixed(2)} ${service.currency ?? "EUR"}`
                        : "-"}
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
