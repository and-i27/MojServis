export const serviceTypeLabel: Record<string, string> = {
  regular: "Redni servis",
  extraordinary: "Izredni servis",
  small: "Mali servis",
  major: "Veliki servis",
  repair: "Popravilo",
  other: "Drugo",
};

export type ImportedServiceRow = {
  rowNumber: number;
  plate: string;
  vin: string;
  title: string;
  serviceType: string;
  date: string;
  odometer: string;
  cost: string;
  currency: string;
  description: string;
  errors: string[];
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function pickValue(raw: Record<string, unknown>, aliases: string[]) {
  const normalizedEntries = Object.entries(raw).map(
    ([key, value]) => [normalizeHeader(key), value] as const,
  );

  for (const alias of aliases) {
    const match = normalizedEntries.find(([key]) => key === alias);
    if (match) {
      return match[1];
    }
  }

  return "";
}

function normalizeServiceType(value: string) {
  const normalized = normalizeHeader(value);

  switch (normalized) {
    case "regular":
    case "redniservis":
      return "regular";
    case "extraordinary":
    case "izredniservis":
      return "extraordinary";
    case "small":
    case "maliservis":
      return "small";
    case "major":
    case "velikiservis":
      return "major";
    case "repair":
    case "popravilo":
      return "repair";
    case "other":
    case "drugo":
      return "other";
    default:
      return value ? "other" : "regular";
  }
}

function normalizeDate(value: string) {
  if (!value) {
    return "";
  }

  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }

  const slDateMatch = value.match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/,
  );
  if (slDateMatch) {
    const [, day, month, year, hour = "0", minute = "0"] = slDateMatch;
    const localDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    if (!Number.isNaN(localDate.getTime())) {
      return localDate.toISOString();
    }
  }

  return "";
}

function normalizeDecimal(value: string) {
  return value.replace(/\s/g, "").replace(",", ".");
}

export function normalizeImportedServiceRow(
  raw: Record<string, unknown>,
  rowNumber: number,
): ImportedServiceRow {
  const plate = toStringValue(
    pickValue(raw, [
      "plate",
      "licenseplate",
      "registration",
      "registrska",
      "registrskaoznaka",
    ]),
  );
  const vin = toStringValue(pickValue(raw, ["vin", "chassis", "sasija"]));
  const title = toStringValue(
    pickValue(raw, ["title", "service", "servicetitle", "name", "naziv"]),
  );
  const serviceType = normalizeServiceType(
    toStringValue(
      pickValue(raw, ["servicetype", "type", "vrstaservisa", "vrsta"]),
    ),
  );
  const date = normalizeDate(
    toStringValue(pickValue(raw, ["date", "servicedate", "datum"])),
  );
  const odometer = normalizeDecimal(
    toStringValue(pickValue(raw, ["odometer", "kilometers", "km"])),
  );
  const cost = normalizeDecimal(
    toStringValue(pickValue(raw, ["cost", "price", "amount", "strosek"])),
  );
  const currency =
    toStringValue(pickValue(raw, ["currency", "valuta"])) || "EUR";
  const description = toStringValue(
    pickValue(raw, ["description", "notes", "opis", "opombe"]),
  );

  const errors: string[] = [];

  if (!plate && !vin) {
    errors.push("Manjkajoča registrska oznaka ali VIN.");
  }

  if (!title) {
    errors.push("Manjkajoč naslov servisa.");
  }

  if (!date) {
    errors.push("Manjkajoč ali neveljaven datum servisa.");
  }

  if (odometer && Number.isNaN(Number(odometer))) {
    errors.push("Neveljavna vrednost prevoženih kilometrov.");
  }

  if (cost && Number.isNaN(Number(cost))) {
    errors.push("Neveljavna vrednost stroškov.");
  }

  return {
    rowNumber,
    plate,
    vin,
    title,
    serviceType,
    date,
    odometer,
    cost,
    currency,
    description,
    errors,
  };
}

export function getServiceImportTemplateHeaders() {
  return [
    "plate",
    "vin",
    "title",
    "serviceType",
    "date",
    "odometer",
    "cost",
    "currency",
    "description",
  ];
}
