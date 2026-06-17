"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StudyTaxon, Taxon } from "@prisma/client";

type TaxaWithTaxon = StudyTaxon & { taxon: Taxon };

type TaxaBarChartProps = {
  data: TaxaWithTaxon[];
};

export function TaxaBarChart({ data }: TaxaBarChartProps) {
  const chartData = data
    .filter((t) => t.magnitude !== null)
    .map((t) => ({
      name: t.taxon.species || t.taxon.genus,
      fullName: t.taxon.name,
      value: t.direction === "UP" ? t.magnitude! : t.direction === "DOWN" ? -t.magnitude! : 0,
      direction: t.direction,
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-text3 font-mono text-xs">
        Žádná kvantitativní data taxonů
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 80, bottom: 4 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#4A6080", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "rgba(0,212,170,0.1)" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#8FA8C8", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "#0D1526",
              border: "1px solid rgba(0,212,170,0.15)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
              color: "#E8F4F1",
            }}
            formatter={(value) => [
              `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2).replace(".", ",")}×`,
              "Změna",
            ]}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.name === String(label));
              return item?.fullName || String(label);
            }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={20}>
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  entry.direction === "UP"
                    ? "#00D4AA"
                    : entry.direction === "DOWN"
                      ? "#FF4D6A"
                      : "#7B61FF"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
