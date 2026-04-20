import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import VehicleImageGallery from "@/app/components/VehicleImageGallery";
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
    { id },
  );

  if (!car) return notFound();

  const title = car.name || car.makeModel || "Vozilo";

  return (
    <section className="main">
      <h1>{title}</h1>
      <p className="text-lg">Podrobnosti o vozilu</p>
      <p>
        {car.notes && <span className="font-semibold">Vaše opombe: </span>}
        {car.notes ||
          "Zgodovina servisov, pregledov in dokumentov na enem mestu."}
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden section-primary p-0!">
          <VehicleImageGallery title={title} images={car.imageUrls ?? []} />
        </div>

        <div className="grid gap-6">
          <div className="section-primary p-5">
            <div className="font-semibold">Podrobnosti</div>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span>Znamka / Model</span>
                <span className="text-right">{car.makeModel ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Leto proizvodnje</span>
                <span className="text-right">{car.year ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Registrska oznaka</span>
                <span className="text-right">{car.plate ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>VIN</span>
                <span className="text-right">{car.vin ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Prevoženih kilometrov</span>
                <span className="text-right">
                  {car.odometer ? car.odometer.toLocaleString("sl-SI") : "-"} km
                </span>
              </div>
            </div>
          </div>

          <div className="section-primary p-5!">
            <div className="font-semibold">Dejanja</div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-4 sm:-mt-2 h-full">
              <Link
                href={`/vehicle/${car._id}/services`}
                className="btn text-center w-full sm:w-1/3"
              >
                Servisi
              </Link>
              <Link
                href={`/vehicle/${car._id}/todo`}
                className="btn text-center w-full sm:w-1/3"
              >
                Opravila
              </Link>
              <Link
                href={`/vehicle/${car._id}/edit`}
                className="btn text-center w-full sm:w-1/3"
              >
                Uredi vozilo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="section-primary p-5!">
        Za to vozilo si shranite račune, poročila o pregledu in zgodovino
        servisiranja.
      </div>
    </section>
  );
}
