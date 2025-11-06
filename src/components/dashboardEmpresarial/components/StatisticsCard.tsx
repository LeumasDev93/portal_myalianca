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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
      {statistics.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className={`bg-white p-2 sm:p-2.5 md:p-3 lg:p-4 xl:p-6 rounded-lg shadow-md border border-gray-200 ${colors.bg}`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-1.5 md:mb-2 lg:mb-3 xl:mb-4">
              <h3 className="text-[9px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm font-medium text-gray-600 uppercase tracking-tighter sm:tracking-tighter md:tracking-tight lg:tracking-tight xl:tracking-wide leading-tight">
                {stat.title}
              </h3>
              <div className={`p-1 sm:p-1 md:p-1.5 lg:p-1.5 xl:p-2 rounded-full ${colors.icon}`}>
                <IconComponent className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
              </div>
            </div>

            <div className="space-y-0.5 sm:space-y-0.5 md:space-y-1 lg:space-y-1.5 xl:space-y-2">
              <p className={`text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl font-bold ${colors.text}`}>
                {stat.amount}
              </p>
              <p className="text-[9px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm text-gray-500 leading-tight">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { StatisticData };
