import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import VehicleImageGallery from "@/components/vehicle/VehicleImageGallery";

type CarDetail = {
  _id: string;
  name: string;
  makeModel?: string;
  year?: number;
  plate?: string;
  vin?: string;
  odometer?: number;
  notes?: string;
  imageUrls?: string[];
};

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const car: CarDetail | null = await client.fetch(
    `*[_type == "car" && _id == $id][0]{
      _id,
      name,
      "makeModel": coalesce(makeModel, make),
      year,
      plate,
      vin,
      odometer,
      notes,
      "imageUrls": images[].asset->url
    }`,
    { id }
  );

  if (!car) return notFound();

  const title = car.name || car.makeModel || "Vehicle";

  return (
    <section className="mainContent">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[color:var(--muted)]">Vehicle</p>
        <h1 className="heading text-left">{title}</h1>
        <p className="text-sm text-[color:var(--muted)]">
          {car.notes || "Service history, inspections and documents in one place."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-lg border border-[color:var(--border)] bg-white shadow-sm">
          <VehicleImageGallery title={title} images={car.imageUrls ?? []} />
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Overview</div>
            <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
              <div className="flex items-center justify-between gap-4">
                <span>Make / Model</span>
                <span className="text-right text-black">{car.makeModel ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Year</span>
                <span className="text-right text-black">{car.year ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Plate</span>
                <span className="text-right text-black">{car.plate ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>VIN</span>
                <span className="text-right text-black">{car.vin ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Odometer (km)</span>
                <span className="text-right text-black">
                  {car.odometer ? car.odometer.toLocaleString("en-US") : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Actions</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/vehicle/${car._id}/services`} className="button w-auto">
                Services
              </Link>
              <Link href={`/vehicle/${car._id}/todo`} className="button w-auto">
                To-do
              </Link>
              <Link href={`/vehicle/${car._id}/edit`} className="button w-auto">
                Edit vehicle
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 text-sm text-[color:var(--muted)]">
        Keep your invoices, inspection reports, and service history attached to this vehicle.
      </div>
    </section>
  );
}
