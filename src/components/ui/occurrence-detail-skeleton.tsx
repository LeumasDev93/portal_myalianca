import React from 'react';
import { Separator } from './separator';

export const OccurrenceDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64" />
              <div className="h-4 bg-gray-100 rounded w-48" />
            </div>
            <div className="h-4 bg-gray-100 rounded w-40" />
          </div>

          {/* Timeline Skeleton */}
          <div className="w-full py-4 sm:py-6">
            <div className="relative w-full mx-auto">
              <div className="relative">
                {/* Linha de fundo */}
                <div className="absolute left-0 right-0 h-1 sm:h-1.5 bg-gray-200 rounded-full" style={{ top: '20px' }} />
                
                {/* Steps */}
                <div className="relative h-24 sm:h-28 flex justify-between">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full" />
                      <div className="mt-2 sm:mt-3">
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Detalhes principais */}
        <div className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna esquerda */}
            <div className="space-y-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-5 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Coluna direita */}
            <div className="space-y-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-5 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Documentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 bg-gray-200 rounded w-48" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
        
        {/* Gallery skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

