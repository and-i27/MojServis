"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/requireUser";
import { writeClient } from "@/sanity/lib/WriteClient";
import type { ImportedServiceRow } from "@/lib/serviceImport";

type ImportServiceResult = {
  success: boolean;
  error: string | null;
  importedCount: number;
  skippedCount: number;
  messages: string[];
};

type UserCar = {
  _id: string;
  name: string;
  plate?: string;
  vin?: string;
  odometer?: number;
};

function normalizeLookupValue(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export async function importVehicleServices(
  rows: ImportedServiceRow[],
): Promise<ImportServiceResult> {
  try {
    const { userId } = await requireUser();

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        success: false,
        error: "Ni izbranih vrstic za uvoz.",
        importedCount: 0,
        skippedCount: 0,
        messages: [],
      };
    }

    const cars: UserCar[] = await writeClient.fetch(
      `*[_type == "car" && owner._ref == $userId]{
        _id,
        name,
        plate,
        vin,
        odometer
      }`,
      { userId },
    );

    const carsByPlate = new Map<string, UserCar>();
    const carsByVin = new Map<string, UserCar>();

    for (const car of cars) {
      const plateKey = normalizeLookupValue(car.plate);
      const vinKey = normalizeLookupValue(car.vin);

      if (plateKey) {
        carsByPlate.set(plateKey, car);
      }

      if (vinKey) {
        carsByVin.set(vinKey, car);
      }
    }

    let importedCount = 0;
    let skippedCount = 0;
    const messages: string[] = [];
    const highestOdometerByCar = new Map<string, number>();

    for (const row of rows) {
      if (row.errors.length > 0) {
        skippedCount += 1;
        messages.push(
          `Vrstica ${row.rowNumber}: preskočena zaradi validacijskih napak.`,
        );
        continue;
      }

      const plateKey = normalizeLookupValue(row.plate);
      const vinKey = normalizeLookupValue(row.vin);
      const car =
        (vinKey ? carsByVin.get(vinKey) : undefined) ??
        (plateKey ? carsByPlate.get(plateKey) : undefined);

      if (!car) {
        skippedCount += 1;
        messages.push(
          `Vrstica ${row.rowNumber}: ni ustreznega vozila, ki bi ustrezal registrski oznaki \"${row.plate || "-"}\" ali VIN-u \"${row.vin || "-"}\".`,
        );
        continue;
      }

      const odometer = row.odometer ? Number(row.odometer) : undefined;
      const cost = row.cost ? Number(row.cost) : undefined;

      await writeClient.create({
        _type: "serviceRecord",
        serviceType: row.serviceType,
        title: row.title,
        description: row.description || undefined,
        date: row.date,
        odometer: Number.isFinite(odometer) ? odometer : undefined,
        cost: Number.isFinite(cost) ? cost : undefined,
        currency: row.currency || "EUR",
        car: { _type: "reference", _ref: car._id },
        user: { _type: "reference", _ref: userId },
      });

      if (Number.isFinite(odometer)) {
        const currentHighest =
          highestOdometerByCar.get(car._id) ?? car.odometer ?? 0;
        highestOdometerByCar.set(
          car._id,
          Math.max(currentHighest, odometer as number),
        );
      }

      importedCount += 1;
    }

    for (const [carId, odometer] of highestOdometerByCar.entries()) {
      await writeClient.patch(carId).set({ odometer }).commit();
      revalidatePath(`/vehicle/${carId}`);
      revalidatePath(`/vehicle/${carId}/services`);
    }

    revalidatePath("/dashboard");
    revalidatePath("/import/services");

    return {
      success: true,
      error: null,
      importedCount,
      skippedCount,
      messages,
    };
  } catch (error) {
    console.error("IMPORT SERVICES ERROR:", error);

    return {
      success: false,
      error: "Pri uvozu servisnih zapisov je prišlo do napake.",
      importedCount: 0,
      skippedCount: 0,
      messages: [],
    };
  }
}
