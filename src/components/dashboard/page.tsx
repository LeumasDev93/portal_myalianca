"use client";

import { useRouter } from "next/navigation";
import { FinanceCard } from "../dashboardEmpresarial/components/FinanceCard";
import { StatisticsApiCard } from "../dashboardEmpresarial/components/StatisticsApiCard";
import { DashboardCharts } from "../Historico/Charts/DashboartdCharts";

export default function DashboardPage() {
  const router = useRouter();
  const onNavigate = (path: string) => {
    router.push(`/${path}`);
  };
  return (
    <div className="p-4 w-full">
       <h1 className="text-2xl font-bold text-[#002256] mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 mb-8">
        <div>
          <StatisticsApiCard onNavigate={onNavigate} />
        </div>
        <div>
          <FinanceCard onNavigate={onNavigate} />
        </div>
      </div>

      <div className="py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div
            className="w-full lg:w-[35%] xl:w-[30%]"
            style={{ minHeight: "400px", maxHeight: "650px" }}
          >
            <DashboardCharts />
          </div>
        </div>
      </div>

    </div>
  );
}
