import React from "react";

export default function QuickAccessCardSkeleton() {
  return (
    <div className="flex flex-col border rounded-xl w-60 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] shadow-md p-3 xl:p-4 relative bg-white border-gray-200 animate-pulse">
      <div className="h-full flex flex-col">
        {/* Ícone skeleton */}
        <div className="flex-shrink-0 mb-2">
          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-gray-200 rounded" />
        </div>

        {/* Título skeleton */}
        <div className="mb-2">
          <div className="h-4 xl:h-5 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Descrição skeleton */}
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Botão skeleton */}
        <div className="mt-auto pt-2">
          <div className="h-8 xl:h-9 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

