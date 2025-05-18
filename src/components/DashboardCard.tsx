/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "./ui/button";

type FilterOption = "all" | "2024" | "2023" | "2022";

const InsuranceCard = () => {
  const [filter, setFilter] = useState<FilterOption>("all");

  // Dados de seguros de carro por ano (2022-2024)
  const insuranceData = [
    {
      year: "2024",
      color: "#B7021C", // Vermelho
      data: [
        { month: "Jan", value: 350 },
        { month: "Fev", value: 320 },
        { month: "Mar", value: 380 },
        { month: "Abr", value: 340 },
        { month: "Mai", value: 410 },
        { month: "Jun", value: 430 },
        { month: "Jul", value: 450 },
        { month: "Ago", value: 420 },
        { month: "Set", value: 390 },
        { month: "Out", value: 370 },
        { month: "Nov", value: 340 },
        { month: "Dez", value: 310 },
      ],
    },
    {
      year: "2023",
      color: "#002256",
      data: [
        { month: "Jan", value: 320 },
        { month: "Fev", value: 790 },
        { month: "Mar", value: 350 },
        { month: "Abr", value: 310 },
        { month: "Mai", value: 380 },
        { month: "Jun", value: 400 },
        { month: "Jul", value: 420 },
        { month: "Ago", value: 390 },
        { month: "Set", value: 360 },
        { month: "Out", value: 340 },
        { month: "Nov", value: 310 },
        { month: "Dez", value: 280 },
      ],
    },
    {
      year: "2022",
      color: "#FFC72C", // Amarelo
      data: [
        { month: "Jan", value: 880 },
        { month: "Fev", value: 550 },
        { month: "Mar", value: 300 },
        { month: "Abr", value: 270 },
        { month: "Mai", value: 630 },
        { month: "Jun", value: 350 },
        { month: "Jul", value: 370 },
        { month: "Ago", value: 340 },
        { month: "Set", value: 310 },
        { month: "Out", value: 290 },
        { month: "Nov", value: 260 },
        { month: "Dez", value: 230 },
      ],
    },
  ];

  // Configuração do gráfico com cores por ano
  const chartConfig = {
    "2024": {
      label: "2024",
      color: "#B7021C",
    },
    "2023": {
      label: "2023",
      color: "#002256",
    },
    "2022": {
      label: "2022",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  const prepareChartData = () => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return months.map((month) => {
      const monthData: any = { month };
      insuranceData.forEach((yearData) => {
        if (filter === "all" || filter === yearData.year) {
          const yearMonthData = yearData.data.find((d) => d.month === month);
          monthData[yearData.year] = yearMonthData ? yearMonthData.value : 0;
        }
      });
      return monthData;
    });
  };

  const chartData = prepareChartData();

  return (
    <Card className="w-full md:w-1/2 max-w-[800px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            Seguros de Carro (2022-2024)
          </CardTitle>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="outline" className="flex items-center gap-1">
                {filter === "all" ? "Selecionar" : `${filter}`}
                <span>▼</span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filtrar por ano"
              onAction={(key) => setFilter(key as FilterOption)}
            >
              <DropdownItem key="all">Selecionar</DropdownItem>
              <DropdownItem key="2024">2024</DropdownItem>
              <DropdownItem key="2023">2023</DropdownItem>
              <DropdownItem key="2022">2022</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <Tooltip
              formatter={(value, name) => [`${value} apólices`, name]}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend />
            {(filter === "all" || filter === "2024") && (
              <Bar
                dataKey="2024"
                name="2024"
                radius={[8, 8, 0, 0]}
                fill="#B7021C"
              />
            )}
            {(filter === "all" || filter === "2023") && (
              <Bar
                dataKey="2023"
                name="2023"
                radius={[8, 8, 0, 0]}
                fill="#002256"
              />
            )}
            {(filter === "all" || filter === "2022") && (
              <Bar
                dataKey="2022"
                name="2022"
                radius={[8, 8, 0, 0]}
                fill="#60a5fa"
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InsuranceCard;
