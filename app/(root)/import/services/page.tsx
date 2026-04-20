import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { requireUser } from "@/lib/requireUser";
import ServiceImportForm from "@/app/components/ServiceImportForm";

type UserCarSummary = {
  _id: string;
  name: string;
  plate?: string;
  vin?: string;
};

export default async function ServiceImportPage() {
  const { userId } = await requireUser();

  const cars: UserCarSummary[] = await client.fetch(
    `*[_type == "car" && owner._ref == $userId] | order(name asc){
      _id,
      name,
      plate,
      vin
    }`,
    { userId },
  );

  return (
    <section className="main">
      <div className="flex flex-wrap items-start justify-between text-center gap-4">
        <div>
          <h1>Uvozi Servise</h1>
          <p className="text-lg">
            Uvoz zgodovine servisiranja v bazo podatkov iz CSV ali Excel
            datotek.
          </p>
        </div>
        <Link href="/" className="btn w-full sm:w-30">
          Domov
        </Link>
      </div>

      <div className="border-b"></div>

      <ServiceImportForm knownCars={cars} />
    </section>
  );
}
