import { NextRequest, NextResponse } from "next/server";

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

function normalizeVin(vin: string) {
  return vin.replace(/\s+/g, "").toUpperCase();
}

export async function GET(request: NextRequest) {
  const vinParam = request.nextUrl.searchParams.get("vin") ?? "";
  const yearParam = request.nextUrl.searchParams.get("year") ?? "";
  const vin = normalizeVin(vinParam);
  const modelYear = yearParam.trim();

  if (vin.length !== 17) {
    return NextResponse.json(
      { error: "VIN mora vsebovati natanko 17 znakov." },
      { status: 400 },
    );
  }

  try {
    const batchValue = modelYear ? `${vin},${modelYear}` : vin;
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/${encodeURIComponent(batchValue)}?format=json`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "VIN storitev trenutno ni dosegljiva." },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { Results?: VpicDecodeResult[] };
    const decoded = data.Results?.[0];

    if (!decoded) {
      return NextResponse.json(
        { error: "Za ta VIN ni bilo mogoce pridobiti podatkov." },
        { status: 404 },
      );
    }

    const make = decoded.Make?.trim() || null;
    const model = decoded.Model?.trim() || null;
    const year = decoded.ModelYear?.trim();
    const makeModel = [make, model].filter(Boolean).join(" ").trim();

    if (!(makeModel || year)) {
      return NextResponse.json(
        {
          error:
            decoded.ErrorText?.trim() ||
            "VIN je bil prebran, vendar ni dovolj podatkov za prikaz.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("VIN DECODE ERROR:", error);

    return NextResponse.json(
      { error: "Pri preverjanju VIN je prislo do napake." },
      { status: 500 },
    );
  }
}
