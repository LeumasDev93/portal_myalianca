import React from 'react';

export const PieChartSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] sm:h-[250px] xl:h-[300px] xl:gap-4 animate-pulse">
      {/* Círculo do gráfico de pizza */}
      <div className="w-full h-[180px] sm:h-[200px] xl:h-full flex items-center justify-center">
        <div className="relative">
          {/* Círculo externo */}
          <div className="w-[160px] h-[160px] sm:w-[160px] sm:h-[160px] xl:w-[200px] xl:h-[200px] rounded-full bg-gray-200" />
          {/* Círculo interno (para criar efeito de donut) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] sm:w-[100px] sm:h-[100px] xl:w-[140px] xl:h-[140px] rounded-full bg-white" />
          
          {/* Segmentos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white transform -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-1/2 h-[2px] bg-white transform -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-1/2 h-[2px] bg-white transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      {/* Legendas */}
      <div className="flex gap-1 sm:gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-4 sm:h-6 rounded-full bg-gray-200" />
            <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 xl:p-6 animate-pulse">
      {/* Header com tabs */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        
        {/* Tabs skeleton */}
        <div className="flex gap-2 border-b pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      
      {/* Gráfico de pizza */}
      <PieChartSkeleton />
    </div>
  );
};

