"use client";

import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaExclamationTriangle } from "react-icons/fa";

export function StatisticsApiCard() {
  const { data: dashboardData, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-[#002256] mb-6">Estatísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#002256] mb-4">Estatísticas</h2>
        <div className="flex items-center space-x-3">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">
              Erro ao carregar estatísticas
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Card Apólices Ativas */}
        <div className="bg-blue-100 border border-blue-300 p-6 rounded-lg flex flex-col justify-between h-[150px] hover:bg-blue-200 hover:scale-105 selection:bg-blue-200 cursor-pointer transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Apólices Ativas
            </h3>
            <div className="p-2 rounded-full bg-blue-100 text-[#002256]">
              <IoShieldCheckmarkSharp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002256] mb-2">
              {dashboardData?.totalApolice?.toString() || "0"}
            </p>
          </div>
        </div>

        {/* Card Sinistros Ativos */}
        <div className="bg-red-100 border border-red-300 hover:bg-red-200 hover:scale-105 selection:bg-red-200 p-6 rounded-lg flex flex-col justify-between h-[150px] cursor-pointer transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 uppercase">
              Sinistros Ativos
            </h3>
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <FaExclamationTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 mb-2">
              {dashboardData?.totalSinistro?.toString() || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
