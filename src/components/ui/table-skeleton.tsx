import React from 'react';
import { useState, useEffect } from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

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

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  const [isXlScreen, setIsXlScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsXlScreen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mostra 4 colunas abaixo de XL, número total em XL+
  const displayColumns = isXlScreen ? columns : Math.min(4, columns);

  return (
    <>
      <style>{shimmerStyle}</style>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: displayColumns }).map((_, colIndex) => {
            // Delay escalonado para cada coluna criar efeito de onda
            const delay = colIndex * 0.1;
            return (
              <td 
                key={colIndex} 
                className="px-1 sm:px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-2 sm:py-2.5 md:py-3 lg:py-3 xl:py-4 text-center"
              >
                <div className="flex justify-center">
                  <div 
                    className={`bg-gray-200 rounded shimmer-animation ${
                      colIndex === displayColumns - 1 
                        ? 'h-2.5 sm:h-2.5 md:h-3 lg:h-3 xl:h-3.5 w-4 sm:w-5 md:w-6 lg:w-6 xl:w-8' // Coluna de opções
                        : colIndex === 0
                        ? 'h-2.5 sm:h-2.5 md:h-3 lg:h-3 xl:h-3.5 w-14 sm:w-16 md:w-20 lg:w-24 xl:w-28' // Primeira coluna
                        : 'h-2.5 sm:h-2.5 md:h-3 lg:h-3 xl:h-3.5 w-10 sm:w-12 md:w-14 lg:w-16 xl:w-20' // Outras colunas
                    }`}
                    style={{ animationDelay: `${delay}s` }}
                  />
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export const TableSkeletonHeader: React.FC<{ columns?: number }> = ({ 
  columns = 5
}) => {
  const [isXlScreen, setIsXlScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsXlScreen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mostra 4 colunas abaixo de XL, 5 ou mais em XL+
  const displayColumns = isXlScreen ? columns : Math.min(4, columns);

  return (
    <>
      <style>{shimmerStyle}</style>
      <tr className="border-b-2 border-gray-200">
        {Array.from({ length: displayColumns }).map((_, index) => {
          const delay = index * 0.1;
          return (
            <th 
              key={index} 
              className="px-1 sm:px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 sm:py-2 md:py-2.5 lg:py-3 xl:py-3.5 text-center"
            >
              <div className="flex justify-center">
                <div 
                  className="h-3 sm:h-3 md:h-3.5 lg:h-3.5 xl:h-4 bg-gray-200 rounded w-10 sm:w-12 md:w-16 lg:w-20 xl:w-24 shimmer-animation" 
                  style={{ animationDelay: `${delay}s` }}
                />
              </div>
            </th>
          );
        })}
      </tr>
    </>
  );
};

