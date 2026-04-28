import { decodeVinWithNhtsa } from "@/lib/vin/decode";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const vin = request.nextUrl.searchParams.get("vin") ?? "";
  const year = request.nextUrl.searchParams.get("year") ?? "";

  try {
    const result = await decodeVinWithNhtsa(vin, year);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Pri preverjanju VIN je prišlo do napake.";

    const status =
      message === "VIN mora vsebovati natanko 17 znakov."
        ? 400
        : message.includes("maintenance")
          ? 503
          : message.includes("ni dovolj podatkov") ||
              message.includes("ni bilo mogoce pridobiti")
            ? 422
            : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
