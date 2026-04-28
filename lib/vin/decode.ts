import { VinLookupResult } from "./types";

type VpicDecodeResult = {
  ErrorCode?: string;
  ErrorText?: string;
  AdditionalErrorText?: string;
  PossibleValues?: string;
  Make?: string;
  Model?: string;
  ModelYear?: string;
  BodyClass?: string;
  VehicleType?: string;
  Manufacturer?: string;
  ManufacturerName?: string;
  PlantCountry?: string;
  PlantCity?: string;
  Series?: string;
  Trim?: string;
  DriveType?: string;
  FuelTypePrimary?: string;
  EngineCylinders?: string;
  EngineKW?: string;
  EngineHP?: string;
};

export function normalizeVin(vin: string) {
  return vin.replace(/\s+/g, "").toUpperCase();
}

function isMaintenanceHtml(contentType: string | null, body: string) {
  return (
    contentType?.includes("text/html") === true &&
    /maintenance/i.test(body) &&
    /vpic/i.test(body)
  );
}

export async function decodeVinWithNhtsa(
  vinInput: string,
  yearInput?: string,
): Promise<VinLookupResult> {
  const vin = normalizeVin(vinInput);
  const modelYear = yearInput?.trim() || "";

  if (vin.length !== 17) {
    throw new Error("VIN mora vsebovati natanko 17 znakov.");
  }

  const batchValue = modelYear ? `${vin},${modelYear};` : `${vin};`;

  const response = await fetch(
    "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: new URLSearchParams({
        format: "json",
        data: batchValue,
      }).toString(),
      cache: "no-store",
    },
  );

  const rawBody = await response.text();
  const contentType = response.headers.get("content-type");

  if (isMaintenanceHtml(contentType, rawBody)) {
    throw new Error("VIN storitev NHTSA je trenutno v maintenance nacinu.");
  }

  if (!response.ok) {
    throw new Error("VIN storitev trenutno ni dosegljiva.");
  }

  let data: { Results?: VpicDecodeResult[] };
  try {
    data = JSON.parse(rawBody) as { Results?: VpicDecodeResult[] };
  } catch {
    throw new Error("VIN storitev je vrnila neveljaven odgovor.");
  }

  const decoded = data.Results?.[0];
  if (!decoded) {
    throw new Error("Za ta VIN ni bilo mogoče pridobiti podatkov.");
  }

  const make = decoded.Make?.trim() || null;
  const model = decoded.Model?.trim() || null;
  const year = decoded.ModelYear?.trim();
  const makeModel = [make, model].filter(Boolean).join(" ").trim();

  if (!(makeModel || year)) {
    throw new Error(
      decoded.ErrorText?.trim() ||
        "VIN je bil prebran, vendar ni dovolj podatkov za prikaz.",
    );
  }

  return {
    vin,
    make,
    model,
    makeModel,
    year: year ? Number(year) : null,
    bodyClass: decoded.BodyClass?.trim() || null,
    vehicleType: decoded.VehicleType?.trim() || null,
    manufacturer:
      decoded.ManufacturerName?.trim() || decoded.Manufacturer?.trim() || null,
    plantCountry: decoded.PlantCountry?.trim() || null,
    plantCity: decoded.PlantCity?.trim() || null,
    series: decoded.Series?.trim() || null,
    trim: decoded.Trim?.trim() || null,
    driveType: decoded.DriveType?.trim() || null,
    fuelType: decoded.FuelTypePrimary?.trim() || null,
    engineCylinders: decoded.EngineCylinders?.trim() || null,
    engineKw: decoded.EngineKW?.trim() || null,
    engineHp: decoded.EngineHP?.trim() || null,
    errorCode: decoded.ErrorCode?.trim() || null,
    errorText: decoded.ErrorText?.trim() || null,
    additionalErrorText: decoded.AdditionalErrorText?.trim() || null,
    possibleValues: decoded.PossibleValues?.trim() || null,
  };
}
