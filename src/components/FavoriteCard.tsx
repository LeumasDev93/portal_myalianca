import { Plus } from "lucide-react";
import React from "react";
import Image, { StaticImageData } from "next/image";
import { BsPinAngleFill } from "react-icons/bs";

interface FavoritsCardProps {
  icon?: string | StaticImageData;
  title?: string;
  price?: string;
  isAddCard?: boolean;
  onClick?: () => void;
}

const FavoriteCard: React.FC<FavoritsCardProps> = ({
  icon = "",
  title = "Seguro de Viagem",
  isAddCard = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center justify-center rounded-xl bg-white w-32 h-32 sm:h-40 sm:w-40 xl:w-52 space-y-2 shadow-xl cursor-pointer hover:shadow-md transition p-2"
    >
      {!isAddCard && (
        <BsPinAngleFill
          color="#B7021C"
          size={20}
          className="absolute top-2 right-2"
        />
      )}

      {isAddCard ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Plus className="text-gray-400 mb-2 size-6 sm:size-8 xl:size-10" />
          <p className="text-[10px] sm:text-xs xl:text-sm text-gray-400 text-center leading-tight">
            Adicionar acesso rápido
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-[#002855] rounded-full w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 flex items-center justify-center p-2 xl:p-3">
              <Image
                src={icon}
                alt="Logo"
                width={100}
                height={100}
                className="w-full h-full filter brightness-0 invert mix-blend-screen"
              />
            </div>

            <h3 className="text-[10px] sm:text-[12px] xl:text-sm text-[#002855] font-medium text-center leading-tight">
              {title}
            </h3>
          </div>
          <div className="sm:w-[80%] w-[70%] flex items-center justify-center bg-red-800 py-1 px-2 sm:py-2 sm:px-4 rounded-full my-2">
            <p className="text-[10px] font-semibold sm:text-xs xl:text-lg text-white text-center">
              Saber mais
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FavoriteCard;
