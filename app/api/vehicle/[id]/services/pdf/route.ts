import { writeClient } from '@/sanity/lib/WriteClient';
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth } from "@/auth";
import { serviceTypeLabel } from "@/lib/serviceImport";

export const dynamic = "force-dynamic";

type ServicePdfVehicle = {
  _id: string;
  name: string;
  makeModel?: string;
  plate?: string;
  vin?: string;
  odometer?: number;
  services: {
    _id: string;
    serviceType?: string;
    title: string;
    description?: string;
    date: string;
    odometer?: number;
    cost?: number;
    currency?: string;
  }[];
};

function formatCurrency(cost?: number, currency?: string) {
  if (typeof cost !== "number") {
    return "-";
  }

  return `${cost.toFixed(2)} ${currency ?? "EUR"}`;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const vehicle: ServicePdfVehicle | null = await writeClient.fetch(
    `*[_type == "car" && _id == $id && owner._ref == $userId][0]{
      _id,
      name,
      makeModel,
      plate,
      vin,
      odometer,
      "services": *[_type == "serviceRecord" && car._ref == $id && user._ref == $userId] | order(date desc){
        _id,
        serviceType,
        title,
        description,
        date,
        odometer,
        cost,
        currency
      }
    }`,
    { id, userId }
  );

  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const lineHeight = 18;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawText = (text: string, size = 11, bold = false) => {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? boldFont : font,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: pageWidth - margin * 2,
    });

    y -= lineHeight;
  };

  drawText("CarLog Service History Export", 18, true);
  drawText(`Vehicle: ${vehicle.name}`, 12, true);
  drawText(`Make / Model: ${vehicle.makeModel || "-"}`);
  drawText(`Plate: ${vehicle.plate || "-"}`);
  drawText(`VIN: ${vehicle.vin || "-"}`);
  drawText(`Current odometer: ${typeof vehicle.odometer === "number" ? `${vehicle.odometer.toLocaleString("sl-SI")} km` : "-"}`);
  drawText(`Generated: ${new Date().toLocaleString("sl-SI")}`);
  y -= 8;

  const totals = new Map<string, number>();

  if (vehicle.services.length === 0) {
    drawText("No service records found for this vehicle.");
  } else {
    for (const service of vehicle.services) {
      if (typeof service.cost === "number") {
        const currency = service.currency ?? "EUR";
        totals.set(currency, (totals.get(currency) ?? 0) + service.cost);
      }

      drawText(service.title, 12, true);
      drawText(`Date: ${new Date(service.date).toLocaleString("sl-SI")}`);
      drawText(`Type: ${serviceTypeLabel[service.serviceType ?? "regular"] ?? service.serviceType ?? "-"}`);
      drawText(`Odometer: ${typeof service.odometer === "number" ? `${service.odometer.toLocaleString("sl-SI")} km` : "-"}`);
      drawText(`Cost: ${formatCurrency(service.cost, service.currency)}`);
      if (service.description) {
        drawText(`Description: ${service.description}`);
      }
      y -= 8;
    }

    if (totals.size > 0) {
      for (const [currency, amount] of totals.entries()) {
        drawText(`Total service cost (${currency}): ${amount.toFixed(2)} ${currency}`, 12, true);
      }
    }
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${vehicle.name.replace(/[^a-z0-9-_]/gi, "-").toLowerCase()}-service-history.pdf"`,
    },
  });
}
