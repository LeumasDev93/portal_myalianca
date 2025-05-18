"use client";
import React, { useState } from "react";
import { HiMenu } from "react-icons/hi";
import Image from "next/image";
import Logo from "@/assets/alianca.png";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X } from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
}

export const MobileMenu = ({ menuItems }: MobileMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <button
          onClick={() => setMenuOpen(true)}
          className="text-3xl text-[#002256]"
        >
          <HiMenu />
        </button>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-opacity-50 z-40" />
          <aside className="fixed top-0 left-0 w-64 h-full bg-white z-50 shadow-xl p-6 transition-transform transform translate-x-0">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-0 right-0 p-2 text-black"
            >
              <X size={24} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center bg-[#878b92] rounded-full cursor-pointer hover:bg-gray-300 transition duration-200 ease-in-out">
                <Avatar className="w-8 h-8 rounded-full">
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
                    <span className="text-[#B7021C] group-hover:text-white text-xl mr-4">
                      {menu.icon}
                    </span>
                    <span className="text-[#B7021C] group-hover:text-white font-medium">
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
