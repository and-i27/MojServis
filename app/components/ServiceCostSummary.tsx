"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ServiceItem = {
  _id: string;
  title: string;
  date: string;
  cost?: number;
  currency?: string;
  carName?: string;
  carId?: string;
};

type ServiceCostSummaryProps = {
  services: ServiceItem[];
  cars: {
    _id: string;
    name: string;
    makeModel?: string;
  }[];
};

type PeriodFilter = "30d" | "90d" | "365d" | "all";

const periodLabel: Record<PeriodFilter, string> = {
  "30d": "Zadnjih 30 dni",
  "90d": "Zadnjih 90 dni",
  "365d": "Zadnje leto",
  all: "Vse",
};

export default function ServiceCostSummary({
  services,
  cars,
}: ServiceCostSummaryProps) {
  const [selectedCarId, setSelectedCarId] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("90d");

  const filteredServices = useMemo(() => {
    const now = new Date();

    return services.filter((service) => {
      if (selectedCarId !== "all" && service.carId !== selectedCarId) {
        return false;
      }

      if (selectedPeriod === "all") {
        return true;
      }

      const serviceDate = new Date(service.date);
      const daysBack = selectedPeriod === "30d" ? 30 : selectedPeriod === "90d" ? 90 : 365;
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - daysBack);

      return serviceDate >= cutoff;
    });
  }, [selectedCarId, selectedPeriod, services]);

  const totalsByCurrency = useMemo(() => {
    const totals = new Map<string, number>();

    for (const service of filteredServices) {
      if (typeof service.cost !== "number") {
        continue;
      }

      const currency = service.currency ?? "EUR";
      totals.set(currency, (totals.get(currency) ?? 0) + service.cost);
    }

    return Array.from(totals.entries());
  }, [filteredServices]);

  const chartData = useMemo(() => {
    const monthlyTotals = new Map<string, number>();

    for (const service of filteredServices) {
      if (typeof service.cost !== "number") {
        continue;
      }

      const date = new Date(service.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) ?? 0) + service.cost);
    }

    return Array.from(monthlyTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cost]) => ({
        name: month,
        stroški: cost,
      }));
  }, [filteredServices]);

  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold">Stroski</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="dashboard-car-filter" className="text-xs text-[color:var(--muted)]">
            Avtomobil
          </label>
          <select
            id="dashboard-car-filter"
            className="authInput"
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
          >
            <option value="all">Vsi avtomobili</option>
            {cars.map((car) => (
              <option key={car._id} value={car._id}>
                {car.name || car.makeModel || "Vehicle"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="dashboard-period-filter" className="text-xs text-[color:var(--muted)]">
            Obdobje
          </label>
          <select
            id="dashboard-period-filter"
            className="authInput"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as PeriodFilter)}
          >
            {(Object.keys(periodLabel) as PeriodFilter[]).map((period) => (
              <option key={period} value={period}>
                {periodLabel[period]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[color:var(--border)] bg-neutral-50 p-4">
        <div className="text-xs uppercase tracking-wide text-[color:var(--muted)]">
          Skupaj porabljeno
        </div>
        {totalsByCurrency.length === 0 ? (
          <div className="mt-2 text-lg font-semibold text-black">0</div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-4">
            {totalsByCurrency.map(([currency, total]) => (
              <div key={currency} className="text-lg font-semibold text-black">
                {total.toFixed(2)} {currency}
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-sm text-[color:var(--muted)]">
          {filteredServices.length} servisnih zapisov za izbran filter.
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-[color:var(--muted)] mb-2">
            Trend stroškov
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stroški" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
        {filteredServices.length === 0 ? (
          <div>Ni stroskov za izbran filter.</div>
        ) : (
          filteredServices.slice(0, 6).map((service) => (
            <div key={service._id} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-black">{service.title}</div>
                {service.carId && (
                  <Link href={`/vehicle/${service.carId}/services`} className="text-xs hover:text-black">
                    {service.carName ?? "Vehicle"}
                  </Link>
                )}
              </div>
              <div className="text-right">
                <div className="text-black">
                  {typeof service.cost === "number"
                    ? `${service.cost.toFixed(2)} ${service.currency ?? "EUR"}`
                    : "Brez stroska"}
                </div>
                <div className="text-xs">{new Date(service.date).toLocaleDateString("sl-SI")}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}