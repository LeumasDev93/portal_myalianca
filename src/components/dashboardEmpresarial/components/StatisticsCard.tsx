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
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
      {statistics.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className={`bg-white p-3 md:p-4 lg:p-6 rounded-lg shadow-md border border-gray-200 ${colors.bg}`}
          >
            <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
              <h3 className="text-[10px] md:text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-tight md:tracking-normal lg:tracking-wide leading-tight">
                {stat.title}
              </h3>
              <div className={`p-1.5 md:p-2 lg:p-2.5 rounded-full ${colors.icon}`}>
                <IconComponent className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
              </div>
            </div>

            <div className="space-y-1 md:space-y-1.5 lg:space-y-2">
              <p className={`text-sm md:text-base lg:text-lg xl:text-2xl font-bold ${colors.text}`}>
                {stat.amount}
              </p>
              <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 leading-tight">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { StatisticData };
