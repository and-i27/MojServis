"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { VinLookupResult } from "@/lib/vin/types";

type VehicleVinDetailsDialogProps = {
  vin?: string;
  initialYear?: number;
};

function normalizeVin(vin: string) {
  return vin.replace(/\s+/g, "").toUpperCase();
}

export default function VehicleVinDetailsDialog({
  vin,
  initialYear,
}: VehicleVinDetailsDialogProps) {
  const normalizedVin = useMemo(() => normalizeVin(vin ?? ""), [vin]);
  const [open, setOpen] = useState(false);
  const [lookupYear, setLookupYear] = useState(initialYear ? String(initialYear) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VinLookupResult | null>(null);

  async function handleLookup() {
    if (!normalizedVin || loading) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ vin: normalizedVin });
      if (lookupYear.trim()) {
        params.set("year", lookupYear.trim());
      }

      const response = await fetch(`/api/vin/decode?${params.toString()}`);
      const data = (await response.json()) as
        | VinLookupResult
        | {
            error?: string;
          };

      if ("makeModel" in data && response.ok) {
        setResult(data);
        return;
      }

      const errorMessage =
        "error" in data && typeof data.error === "string"
          ? data.error
          : "Podatkov iz VIN ni bilo mogoče pridobiti.";

      if (!response.ok || !("makeModel" in data)) {
        setResult(null);
        setError(errorMessage);
      }
    } catch (lookupError) {
      console.error("VIN DETAILS LOOKUP ERROR:", lookupError);
      setResult(null);
      setError("Pri pridobivanju VIN podatkov je prišlo do napake.");
    } finally {
      setLoading(false);
    }
  }

  if (!normalizedVin) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="btn mt-2 w-full sm:w-auto"
        onClick={() => {
          setOpen(true);
          void handleLookup();
        }}
      >
        Preglej podatke preko VIN
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-secondary p-6 text-primary shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">VIN pregled</h2>
                <p className="mt-1 break-all text-sm">{normalizedVin}</p>
              </div>
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Zapri
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-lg bg-background/12 p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="vin-lookup-year" className="mb-2 block text-sm">
                  Letnik za natančnejši prikaz
                </label>
                <input
                  id="vin-lookup-year"
                  type="number"
                  min="1981"
                  className="text-input w-full"
                  value={lookupYear}
                  onChange={(event) => setLookupYear(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn flex items-center justify-center gap-2"
                onClick={() => void handleLookup()}
                disabled={loading}
              >
                <Search size={16} />
                {loading ? "Pridobivam..." : "Osveži podatke"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

            {result && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Znamka / Model</div>
                    <div className="mt-1 font-semibold">{result.makeModel || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Letnik</div>
                    <div className="mt-1 font-semibold">{result.year ?? "-"}</div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Tip vozila</div>
                    <div className="mt-1 font-semibold">{result.vehicleType || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Body class</div>
                    <div className="mt-1 font-semibold">{result.bodyClass || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Proizvajalec</div>
                    <div className="mt-1 font-semibold">{result.manufacturer || "-"}</div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Lokacija tovarne</div>
                    <div className="mt-1 font-semibold">
                      {[result.plantCity, result.plantCountry].filter(Boolean).join(", ") || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Serija / Trim</div>
                    <div className="mt-1 font-semibold">
                      {[result.series, result.trim].filter(Boolean).join(" / ") || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Pogon / Gorivo</div>
                    <div className="mt-1 font-semibold">
                      {[result.driveType, result.fuelType].filter(Boolean).join(" / ") || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Motor</div>
                    <div className="mt-1 font-semibold">
                      {[
                        result.engineCylinders ? `${result.engineCylinders} cyl` : null,
                        result.engineHp ? `${result.engineHp} hp` : null,
                        result.engineKw ? `${result.engineKw} kW` : null,
                      ]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/12 p-4">
                    <div className="text-sm opacity-80">Error code</div>
                    <div className="mt-1 font-semibold">{result.errorCode || "-"}</div>
                  </div>
                </div>

                {(result.errorText ||
                  result.additionalErrorText ||
                  result.possibleValues) && (
                  <div className="mt-5 rounded-lg border border-primary/25 bg-background/12 p-4">
                    <div className="font-semibold">Opombe dekodiranja</div>
                    {result.errorText && <p className="mt-2 text-sm">{result.errorText}</p>}
                    {result.additionalErrorText && (
                      <p className="mt-2 text-sm">{result.additionalErrorText}</p>
                    )}
                    {result.possibleValues && (
                      <p className="mt-2 text-sm">
                        Možne vrednosti: {result.possibleValues}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
