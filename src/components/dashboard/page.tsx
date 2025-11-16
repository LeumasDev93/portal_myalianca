"use client";

import { FinanceCard } from "../empresarial/components/FinanceCard";
import { StatisticsApiCard } from "../empresarial/components/StatisticsApiCard";
import { DashboardCharts } from "../Historico/Charts/DashboartdCharts";

interface DashboardPageProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps = {}) {
  const handleNavigate = (page: string, params?: Record<string, string>) => {
    console.log('📍 DashboardPage.handleNavigate - page:', page, 'params:', params);
    if (onNavigate) {
      onNavigate(page, params);
    }
  };
  return (
    <div className="p-4 w-full">
       <h1 className="text-2xl font-bold text-[#002256] mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div>
          <StatisticsApiCard onNavigate={handleNavigate} />
        </div>
        <div>
          <FinanceCard onNavigate={handleNavigate} />
        </div>
      </div>

      <div className="py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-[35%] xl:w-[30%]">
            <DashboardCharts />
          </div>
        </div>
      </div>

    </div>
  );
}
