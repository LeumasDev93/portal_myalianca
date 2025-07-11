import { Plus } from "lucide-react";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface FavoritsCardProps {
  icon?: string | StaticImageData;
  title?: string;
  quantity?: number;
  status?: string;
  price?: string;
  isAddCard?: boolean;
  onClick?: () => void;
}

const FavoriteCard: React.FC<FavoritsCardProps> = ({
  icon = "",
  title = "",
  status = "",
  quantity = 0,
  isAddCard = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center justify-between bg-white border border-gray-200 rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-4 xl:py-6 shadow-md cursor-pointer transition hover:shadow-xl"
    >
      {isAddCard ? (
        <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2">
          <Plus className="text-gray-400 size-3 sm:size-4 xl:size-8" />
          <p className="text-[10px] sm:text-xs xl:text-sm text-gray-400 leading-tight">
            Adicionar acesso rápido
          </p>
        </div>
      ) : (
        <>
          {/* Topo com título e ícone */}
          <div className="w-full flex justify-between items-start">
            <div>
              <h3 className="text-[10px] sm:text-xs xl:text-lg text-[#002855] font-semibold">
                {title}
              </h3>
              {/* Parte inferior com quantidade */}
              <p className="w-full rounded-lg text-gray-600 text-left text-xs xl:text-base">
                {quantity}
              </p>
              <span className="text-[8px] sm:text-[10px] xl:text-sm text-[#002855]">
                {status}
              </span>
            </div>
            <div className="rounded-full size-3 sm:size-4 xl:size-6">
              <Image
                src={icon}
                alt="icon"
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FavoriteCard;
