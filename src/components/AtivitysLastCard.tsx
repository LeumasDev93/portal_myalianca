"use client";

import React from "react";
import { FaCar, FaExclamationTriangle, FaHome } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Activity = {
  id: number;
  title: string;
  description: string;
  date: string;
  value?: string;
  icon: React.ReactNode;
};

const activities: Activity[] = [
  {
    id: 1,
    title: "PAGAMENTO REALIZADO",
    description: "Seguro Auto | Parcela 2/12",
    date: "14/05/2025",
    value: "5.000 ECV",
    icon: <FaCar className="w-4 h-4 xl:w-5 xl:h-5 text-white" />,
  },
  {
    id: 2,
    title: "SINISTRO",
    description: "Colisão | Honda Civic",
    date: "14/05/2025",
    icon: (
      <FaExclamationTriangle className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
    ),
  },
  {
    id: 3,
    title: "RENOVAÇÃO DE APÓLICE",
    description: "Seguro Residencial",
    date: "14/05/2025",
    value: "5.000 ECV",
    icon: <FaHome className="w-4 h-4 xl:w-5 xl:h-5 text-white" />,
  },
  {
    id: 4,
    title: "PAGAMENTO REALIZADO",
    description: "Seguro Auto | Parcela 2/12",
    date: "14/05/2025",
    value: "5.000 ECV",
    icon: <FaCar className="w-4 h-4 xl:w-5 xl:h-5 text-white" />,
  },
  {
    id: 5,
    title: "SINISTRO",
    description: "Colisão | Honda Civic",
    date: "14/05/2025",
    icon: (
      <FaExclamationTriangle className="w-4 h-4 xl:w-5 xl:h-5 text-white" />
    ),
  },
];

const AtivitysLastCard = () => {
  return (
    <Card className="flex-1 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-semibold">
          Últimas Atividades
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-center justify-between p-4 rounded-md bg-white ${
              index !== activities.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 bg-[#002855] text-white rounded-full flex items-center justify-center">
                {activity.icon}
              </div>
              <div>
                <p className="text-xs xl:text-sm font-semibold uppercase">
                  {activity.title}
                </p>
                <p className="text-[10px] xl:text-xs text-gray-600">
                  {activity.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              {activity.value && (
                <p className="text-xs xl:text-sm font-bold text-gray-800">
                  {activity.value}
                </p>
              )}
              <p className="text-[10px] xl:text-xs text-gray-500">
                {activity.date}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AtivitysLastCard;
