import React from "react";

export default function QuickAccessCardSkeleton() {
  return (
    <div className="relative group bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden h-[280px] sm:h-[300px] md:h-[320px] xl:h-[350px] 2xl:h-[400px] animate-pulse">
      <div className="h-full flex flex-col p-4 sm:p-5 md:p-6">
        {/* Ícone skeleton */}
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 xl:w-20 xl:h-20 bg-gray-200 rounded-lg" />
        </div>

        {/* Título skeleton */}
        <div className="mb-2">
          <div className="h-5 sm:h-6 md:h-7 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Descrição skeleton */}
        <div className="flex-1 mb-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Botão skeleton */}
        <div className="mt-auto">
          <div className="h-10 sm:h-11 md:h-12 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
}

