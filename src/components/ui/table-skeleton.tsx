import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td 
              key={colIndex} 
              className="px-2 md:px-3 py-3 md:py-4 text-center"
            >
              <div className="flex justify-center">
                <div 
                  className={`h-4 bg-gray-200 rounded ${
                    colIndex === columns - 1 
                      ? 'w-8' // Coluna de opções (menor)
                      : colIndex === 0
                      ? 'w-24 md:w-32' // Primeira coluna
                      : 'w-16 md:w-20' // Outras colunas
                  }`}
                />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const TableSkeletonHeader: React.FC<{ columns?: number }> = ({ 
  columns = 5 
}) => {
  return (
    <tr className="border-b-2 border-gray-200 animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <th 
          key={index} 
          className="px-2 md:px-3 py-2 md:py-3 text-center"
        >
          <div className="flex justify-center">
            <div className="h-4 bg-gray-300 rounded w-20 md:w-24" />
          </div>
        </th>
      ))}
    </tr>
  );
};

