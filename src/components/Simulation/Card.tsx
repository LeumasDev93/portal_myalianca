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
    <div className="flex flex-col items-center justify-between bg-blue-100 border border-[#002855] rounded-xl w-full h-full xl:h-40 sm:w-[200px] xl:w-[270px] px-4 py-6 xl:py-8 cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="w-full flex justify-between items-start">
        <div>
          <h3 className="text-xs xl:text-lg text-[#002855] font-semibold">
            {product.name}
          </h3>
          <span className="text-[10px] xl:text-sm text-[#002855]">
            {product.description}
          </span>
        </div>
        <span className="text-[#002855] text-xl lg:text-2xl">
          {getIconComponent(product.webIcon)}
        </span>
      </div>
      <button className="w-full cursor-pointer bg-[#002855] hover:bg-[#002855]/70 py-1 xl:px-4 rounded-lg text-white text-center text-xs xl:text-base transition-colors">
        Simular Agora
      </button>
    </div>
  );
};

export default Card;
