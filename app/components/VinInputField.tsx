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
    return "VIN je opcijski, vendar priporočljiv za poznejši pregled podatkov.";
  }

  if (/[IOQ]/.test(vin)) {
    return "VIN ne sme vsebovati črk I, O ali Q.";
  }

  if (!/^[A-HJ-NPR-Z0-9]+$/.test(vin)) {
    return "VIN lahko vsebuje samo velike črke in številke.";
  }

  if (vin.length < 17) {
    return `VIN je prekratek. Trenutno: ${vin.length}/17 znakov.`;
  }

  if (vin.length > 17) {
    return `VIN je predolg. Trenutno: ${vin.length}/17 znakov.`;
  }

  return "VIN je videti pravilen.";
}

export default function VinInputField({
  initialVin = "",
}: VinInputFieldProps) {
  const [value, setValue] = useState(initialVin);
  const normalized = useMemo(() => normalizeVin(value), [value]);
  const message = getVinMessage(normalized);
  const isValid = normalized.length === 17 && message === "VIN je videti pravilen.";

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
