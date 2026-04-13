import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import EditVehicleForm from "@/components/vehicle/EditVehicleForm";

type EditVehicleImage = {
  url: string;
  assetRef: string;
};

type EditVehicleData = {
  _id: string;
  name: string;
  makeModel?: string;
  year?: number;
  plate?: string;
  vin?: string;
  odometer?: number;
  notes?: string;
  images?: EditVehicleImage[];
};

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicle: EditVehicleData | null = await client.fetch(
    `*[_type == "car" && _id == $id][0]{
      _id,
      name,
      "makeModel": coalesce(makeModel, make),
      year,
      plate,
      vin,
      odometer,
      notes,
      "images": images[]{
        "url": asset->url,
        "assetRef": asset._ref
      }
    }`,
    { id }
  );

  if (!vehicle) {
    return notFound();
  }

  return <EditVehicleForm vehicle={{ ...vehicle, images: vehicle.images ?? [] }} />;
}
