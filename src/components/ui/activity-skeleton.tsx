import React from 'react';

export const ActivityItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-md bg-white border-b border-gray-100 animate-pulse">
      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Ícone circular */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Título da atividade */}
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
          {/* Descrição */}
          <div className="h-2 sm:h-3 bg-gray-100 rounded w-full" />
        </div>
      </div>

      {/* Data e hora */}
      <div className="text-right flex-shrink-0 ml-2 sm:ml-3 space-y-1">
        <div className="h-2 sm:h-3 w-16 sm:w-20 bg-gray-200 rounded ml-auto" />
        <div className="h-2 w-12 sm:w-14 bg-gray-100 rounded ml-auto" />
      </div>
    </div>
  );
};

export const ActivityCardSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <div className="flex-1 bg-gray-50 animate-pulse">
      <div className="bg-white rounded-lg shadow-md h-full">
        {/* Header */}
        <div className="px-3 sm:px-4 md:px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 sm:h-7 w-32 sm:w-40 bg-gray-200 rounded" />
              <div className="h-5 w-12 bg-gray-100 rounded-full" />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded-full" />
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* Lista de atividades */}
        <div className="space-y-2 sm:space-y-3 px-3 sm:px-4 md:px-6 py-3">
          {Array.from({ length: items }).map((_, index) => (
            <ActivityItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

