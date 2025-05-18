import { Plus } from "lucide-react";
import React from "react";
import Image, { StaticImageData } from "next/image";
import { FaHeart } from "react-icons/fa";

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
        <FaHeart color="#B7021C" size={20} className="absolute top-2 right-2" />
      )}

      {isAddCard ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <Plus size={24} className="text-gray-400 mb-2" />
          <p className="text-xs sm:text-sm text-gray-400 text-center leading-tight">
            Adicionar favorito
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-[#002855] rounded-full w-12 h-12 flex items-center justify-center p-3 ">
              <Image
                src={icon}
                alt="Logo"
                width={100}
                height={100}
                className="w-10 lg:w-14 h-10 lg:h-14 filter brightness-0 invert mix-blend-screen"
              />
            </div>

            <h3 className="text-xs xl:text-sm text-[#002855] font-medium text-center leading-tight">
              {title}
            </h3>
          </div>
          <div className="sm:w-[80%] w-[100%] flex items-center justify-center bg-red-800 py-2 px-4 rounded-lg my-2">
            <p className="text-xs lg-text-lg text-white text-center">
              Fazer simulação
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FavoriteCard;
