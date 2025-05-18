"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Car, CarFront, HeartPulse, Home, Plane } from "lucide-react";

// Tipos para os dados
type InsuranceType = {
  id: number;
  name: string;
  icon: React.ReactNode;
  updates: string[];
  lastUpdated: string;
};

// Dados mockados
const insuranceData: InsuranceType[] = [
  {
    id: 1,
    name: "Seguro Automóvel",
    icon: <CarFront className="w-full h-full" />,
    updates: ["Novas coberturas para danos naturais", "Ajuste nas franquias"],
    lastUpdated: "15/05/2023",
  },
  {
    id: 2,
    name: "Seguro Saúde",
    icon: <HeartPulse className="w-full h-full" />,
    updates: [
      "Inclusão de 10 novas clínicas",
      "Reajuste de 5% nos planos básicos",
    ],
    lastUpdated: "22/05/2023",
  },
  {
    id: 3,
    name: "Seguro Residencial",
    icon: <Home className="w-full h-full" />,
    updates: [
      "Cobertura ampliada para desastres",
      "Novo serviço de assistência 24h",
    ],
    lastUpdated: "30/05/2023",
  },
  {
    id: 4,
    name: "Seguro Viagem",
    icon: <Plane className="w-full h-full" />,
    updates: ["Novos países cobertos", "Assistência médica ampliada"],
    lastUpdated: "05/06/2023",
  },
];

const InsuranceCard1 = () => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl">Últimos 12 meses</CardTitle>
          <Car className="ml-auto w-4 h-4" />
        </div>
        <CardDescription>
          Novas atualizações de preços de seguros de saúde e vida
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {insuranceData.map((insurance) => (
          <article key={insurance.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 p-1.5 flex items-center justify-center">
                {insurance.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-base font-semibold">
                  {insurance.name}
                </p>
                <ul className="mt-1 space-y-1">
                  {insurance.updates.map((update, index) => (
                    <li
                      key={index}
                      className="text-xs sm:text-sm text-gray-600 flex items-start"
                    >
                      <span className="mr-1">•</span> {update}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Atualizado em: {insurance.lastUpdated}
                </p>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsuranceCard1;
