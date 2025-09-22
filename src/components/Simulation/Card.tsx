/* eslint-disable @typescript-eslint/no-unused-vars */
// components/Card.tsx
import { Product } from "@/types/typesData";
import React from "react";
import { IoCalculatorOutline } from "react-icons/io5";
import {
  FaCarAlt,
  FaHome,
  FaShieldAlt,
  FaHeart,
  FaPlane,
  FaShip,
  FaMotorcycle,
  FaBicycle,
  FaTruck,
  FaBus,
} from "react-icons/fa";
import {
  MdHome,
  MdBusiness,
  MdSchool,
  MdSportsSoccer,
  MdDirectionsCar,
} from "react-icons/md";
import {
  TbTopologyStar3,
  TbBuilding,
  TbCar,
  TbPlane,
  TbShip,
} from "react-icons/tb";
import { AiFillCar, AiFillHome, AiFillSafetyCertificate } from "react-icons/ai";
import { BsCarFrontFill, BsHouseFill, BsShieldFill } from "react-icons/bs";
import { GiCarWheel, GiHouse, GiShield } from "react-icons/gi";
import { TfiLayoutWidthDefault } from "react-icons/tfi";

interface CardProps {
  product: Product;
}

const Card = ({ product }: CardProps) => {
  const getIconComponent = (iconName: string) => {
    if (!iconName) return <TfiLayoutWidthDefault />;

    // Mapeia nomes específicos de ícones para componentes
    const iconMap: { [key: string]: React.ComponentType } = {
      // Font Awesome
      FaCarAlt: FaCarAlt,
      FaHome: FaHome,
      FaShieldAlt: FaShieldAlt,
      FaHeart: FaHeart,
      FaPlane: FaPlane,
      FaShip: FaShip,
      FaMotorcycle: FaMotorcycle,
      FaBicycle: FaBicycle,
      FaTruck: FaTruck,
      FaBus: FaBus,

      // Material Design
      MdHome: MdHome,
      MdBusiness: MdBusiness,
      MdSchool: MdSchool,
      MdSportsSoccer: MdSportsSoccer,
      MdDirectionsCar: MdDirectionsCar,

      // Tabler Icons
      TbTopologyStar3: TbTopologyStar3,
      TbBuilding: TbBuilding,
      TbCar: TbCar,
      TbPlane: TbPlane,
      TbShip: TbShip,

      // Ant Design
      AiFillCar: AiFillCar,
      AiFillHome: AiFillHome,
      AiFillSafetyCertificate: AiFillSafetyCertificate,

      // Bootstrap
      BsCarFrontFill: BsCarFrontFill,
      BsHouseFill: BsHouseFill,
      BsShieldFill: BsShieldFill,

      // Game Icons
      GiCarWheel: GiCarWheel,
      GiHouse: GiHouse,
      GiShield: GiShield,
    };

    const IconComponent = iconMap[iconName];

    if (IconComponent) {
      return <IconComponent />;
    }

    return <TfiLayoutWidthDefault />;
  };

  return (
    <div className="flex flex-col items-center justify-between bg-blue-100 border border-[#002855] rounded-xl w-full h-full min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="w-full flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 pr-2">
          <h3 className="text-sm sm:text-base lg:text-lg text-[#002855] font-semibold leading-tight">
            {product.name}
          </h3>
          <span className="text-xs sm:text-sm text-[#002855] leading-tight block mt-1">
            {product.description}
          </span>
        </div>
        <span className="text-[#002855] text-lg sm:text-xl lg:text-2xl flex-shrink-0">
          {getIconComponent(product.webIcon)}
        </span>
      </div>
      <button className="w-full cursor-pointer bg-[#002855] hover:bg-[#002855]/70 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-white text-center text-sm sm:text-base transition-colors">
        Simular Agora
      </button>
    </div>
  );
};

export default Card;
