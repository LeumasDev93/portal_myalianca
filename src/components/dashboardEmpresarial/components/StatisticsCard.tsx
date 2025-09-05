"use client";

import { IconType } from "react-icons";

interface StatisticData {
  title: string;
  amount: string;
  description: string;
  icon: IconType;
  color: string;
}

interface StatisticsCardProps {
  statistics: StatisticData[];
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  // Função para obter classes de cor
  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: "bg-green-50",
        icon: "bg-green-100 text-green-600",
        text: "text-green-600",
        border: "border-green-200",
      },
      red: {
        bg: "bg-red-50",
        icon: "bg-red-100 text-red-600",
        text: "text-red-600",
        border: "border-red-200",
      },
      blue: {
        bg: "bg-blue-100",
        icon: "bg-blue-100 text-blue-600",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "bg-purple-100 text-purple-600",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statistics.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${colors.bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-full ${colors.icon}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <p className={`text-xl font-bold ${colors.text}`}>
                {stat.amount}
              </p>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { StatisticData };
