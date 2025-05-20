"use client";

import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
import Image from "next/image";
import Logo from "@/assets/alianca.png";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X } from "lucide-react";
import { IconType } from "react-icons";
import { MdEmail } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";

interface MenuItem {
  title: string;
  path?: string;
  icon: string | IconType | React.ReactNode; // Aceita string (para imagens), IconType ou ReactNode
  hoverIcon?: React.ReactNode;
  onClick?: () => void;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

export const MobileMenu = ({ menuItems }: MobileMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderIcon = (icon: string | IconType | React.ReactNode) => {
    if (typeof icon === "string") {
      // Se for string, assume que é um caminho de imagem
      return (
        <Image
          src={icon}
          alt="Icon"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
    } else if (React.isValidElement(icon)) {
      // Se já for um elemento React
      return icon;
    } else {
      // Se for um componente de ícone (IconType)
      const Icon = icon as IconType;
      return <Icon className="w-5 h-5" />;
    }
  };

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image src={Logo} alt="Logo" width={40} height={40} />
          <div className="ml-2 flex">
            <h1 className="text-lg font-extrabold text-[#B7021C]">My</h1>
            <h1 className="text-lg font-extrabold text-[#002256]">Alianca</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="relative">
              <MdEmail className="text-[#002256] size-5 md:size-6" />
              <span className="absolute -top-2 -right-2 bg-[#B7021C] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </div>
            <div className="relative">
              <IoNotifications className="text-[#002256] size-5 md:size-6" />
              <span className="absolute -top-2 -right-2 bg-[#B7021C] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                5
              </span>
            </div>
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-3xl text-[#002256]"
          >
            <HiMenu />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <aside className="fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-xl p-6 transition-transform transform translate-x-0">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-black hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center justify-center bg-[#878b92] rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 rounded-full">
                  <AvatarImage
                    src="https://github.com/LeumasDev93.png"
                    className="rounded-full w-full h-full"
                  />
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
              </div>
              <span className="font-semibold text-black text-sm md:text-lg">
                Nelson Andrade
              </span>
            </div>
            <hr className="border-b border-[#170766] my-4" />
            <ul className="space-y-2 mt-10">
              {menuItems.map((menu, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      menu.onClick?.();
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full p-3 rounded-md hover:bg-[#B7021C] group transition-colors"
                  >
                    <span className="text-[#002256] group-hover:text-white text-xl mr-4">
                      {renderIcon(menu.icon)}
                    </span>
                    <span className="text-[#002256] group-hover:text-white font-medium">
                      {menu.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </>
      )}
    </>
  );
};
