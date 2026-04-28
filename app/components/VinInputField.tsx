"use client";

import { useMemo, useState } from "react";

type VinInputFieldProps = {
  initialVin?: string;
};

function normalizeVin(vin: string) {
  return vin.replace(/\s+/g, "").toUpperCase();
}

function getVinMessage(vin: string) {
  if (!vin) {
    return "VIN je opcijski, vendar priporocen za poznejsi pregled podatkov.";
  }

  if (/[IOQ]/.test(vin)) {
    return "VIN ne sme vsebovati crk I, O ali Q.";
  }

  if (!/^[A-HJ-NPR-Z0-9]+$/.test(vin)) {
    return "VIN lahko vsebuje samo velike crke in stevilke.";
  }

  if (vin.length < 17) {
    return `VIN je prekratek. Trenutno: ${vin.length}/17 znakov.`;
  }

  if (vin.length > 17) {
    return `VIN je predolg. Trenutno: ${vin.length}/17 znakov.`;
  }

  return "VIN izgleda pravilno.";
}

export default function VinInputField({
  initialVin = "",
}: VinInputFieldProps) {
  const [value, setValue] = useState(initialVin);
  const normalized = useMemo(() => normalizeVin(value), [value]);
  const message = getVinMessage(normalized);
  const isValid = normalized.length === 17 && message === "VIN izgleda pravilno.";

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="vin">VIN</label>
      <input
        id="vin"
        name="vin"
        type="text"
        className="text-input"
        value={value}
        maxLength={17}
        onChange={(event) => setValue(normalizeVin(event.target.value))}
      />
      <p className={`text-xs ${isValid ? "text-primary/90" : "text-red-400"}`}>
        {message}
      </p>
    </div>
  );
}
