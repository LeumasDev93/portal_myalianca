import React from 'react';

// Estilos para animação shimmer
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-color: #e5e7eb;
    }
    50% {
      background-color: #9ca3af;
    }
    100% {
      background-color: #e5e7eb;
    }
  }
  .shimmer-animation {
    animation: shimmer 1.5s ease-in-out infinite;
  }
`;

export const PieChartSkeleton: React.FC = () => {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 py-2 sm:py-3 md:py-4 flex-1">
      {/* Círculo do gráfico de pizza */}
      <div className="w-full flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Círculo externo */}
          <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] lg:w-[190px] lg:h-[190px] 2xl:w-[200px] 2xl:h-[200px] rounded-full bg-gray-200 shimmer-animation" />
          {/* Círculo interno (para criar efeito de donut) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] md:w-[110px] md:h-[110px] lg:w-[120px] lg:h-[120px] 2xl:w-[140px] 2xl:h-[140px] rounded-full bg-white" />
          
          {/* Segmentos decorativos */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-white transform -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-1/2 h-[2px] bg-white transform -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-1/2 h-[2px] bg-white transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      {/* Legendas */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 2xl:gap-4 justify-center w-full px-2 flex-shrink-0">
        {[1, 2, 3].map((i) => {
          const delay = i * 0.2;
          return (
            <div key={i} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <span 
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 xl:w-4 xl:h-4 rounded-full bg-gray-200 shimmer-animation" 
                style={{ animationDelay: `${delay}s` }}
              />
              <div 
                className="h-3 sm:h-3.5 md:h-4 w-12 sm:w-16 md:w-20 2xl:w-24 bg-gray-200 rounded shimmer-animation" 
                style={{ animationDelay: `${delay}s` }}
              />
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export const ChartCardSkeleton: React.FC = () => {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 md:p-4 lg:p-5 2xl:p-6 h-full flex flex-col">
      {/* Header com tabs */}
      <div className="mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="h-5 sm:h-6 md:h-7 w-24 sm:w-32 md:w-36 bg-gray-200 rounded shimmer-animation" />
          <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-gray-200 rounded-full shimmer-animation" style={{ animationDelay: '0.1s' }} />
        </div>
        
        {/* Tabs skeleton */}
        <div className="flex gap-1 sm:gap-2 border-b pb-2">
          {[1, 2, 3].map((i) => {
            const delay = i * 0.15;
            return (
              <div 
                key={i} 
                className="h-7 sm:h-8 md:h-9 w-16 sm:w-20 md:w-24 2xl:w-28 bg-gray-200 rounded shimmer-animation" 
                style={{ animationDelay: `${delay}s` }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Gráfico de pizza */}
      <div className="flex-1 flex flex-col">
        <PieChartSkeleton />
      </div>
    </div>
    </>
  );
};

