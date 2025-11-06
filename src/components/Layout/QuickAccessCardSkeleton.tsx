import React from "react";

export default function QuickAccessCardSkeleton() {
  return (
    <div className="flex flex-col border rounded-xl w-60 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] shadow-md p-3 xl:p-4 relative bg-white border-gray-200 animate-pulse">
      {/* Título e ícone na mesma linha - igual ao card real */}
      <div className="flex justify-between items-center mb-2">
        {/* Título skeleton */}
        <div className="flex-1 mr-2">
          <div className="h-[14px] sm:h-3 xl:h-5 bg-gray-200 rounded w-3/4" />
        </div>
        {/* Ícone skeleton */}
        <div className="flex-shrink-0 mr-4">
          <div className="w-5 h-5 xl:w-6 xl:h-6 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Descrição skeleton */}
      <div className="flex-1 mb-3">
        <div className="h-3 xl:h-4 bg-gray-200 rounded w-full" />
      </div>

      {/* Botão skeleton */}
      <div className="w-full">
        <div className="h-[26px] bg-gray-200 rounded-lg w-full" />
      </div>
    </div>
  );
}

