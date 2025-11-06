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
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-6">
      {statistics.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className={`bg-white p-2 md:p-3 lg:p-6 rounded-lg shadow-md border border-gray-200 ${colors.bg}`}
          >
            <div className="flex items-center justify-between mb-1.5 md:mb-2 lg:mb-4">
              <h3 className="text-[9px] md:text-[10px] lg:text-sm font-medium text-gray-600 uppercase tracking-tighter md:tracking-tight lg:tracking-wide leading-tight">
                {stat.title}
              </h3>
              <div className={`p-1 md:p-1 lg:p-2 rounded-full ${colors.icon}`}>
                <IconComponent className="w-3 h-3 md:w-3 md:h-3 lg:w-4 lg:h-4" />
              </div>
            </div>

            <div className="space-y-0.5 md:space-y-1 lg:space-y-2">
              <p className={`text-xs md:text-sm lg:text-lg xl:text-xl font-bold ${colors.text}`}>
                {stat.amount}
              </p>
              <p className="text-[9px] md:text-[10px] lg:text-sm text-gray-500 leading-tight">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { StatisticData };
