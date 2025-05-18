"use client";

import React from "react";
import Image from "next/image";
import Logo from "@/assets/alianca.png";

// Definição do tipo do item de menu
export interface MenuItem {
  title: string;
  path: string;
  icon: string;
  hoverIcon?: string | React.ReactNode;
  onClick?: () => void;
}

type MenuProps = {
  onMenuClick: (path: string) => void;
  menuItems: MenuItem[];
};

export function Menu({ onMenuClick, menuItems }: MenuProps) {
  const handleMenuClick = (path: string) => {
    onMenuClick(path);
  };

  return (
    <aside className="hidden md:flex flex-col md:w-44 xl:w-64 h-screen bg-white shadow-xl p-6 fixed top-0 left-0 z-40 overflow-y-auto">
      <div className="flex items-center justify-center mb-10">
        <Image
          src={Logo}
          alt="Logo"
          width={60}
          height={60}
          className="w-12 h-10 xl:w-16 xl:h-14"
        />
        <div className="xl:ml-2 flex">
          <h1 className="xl:text-xl font-extrabold text-[#B7021C]">My</h1>
          <h1 className="xl:text-xl font-extrabold text-[#002256]">Alianca</h1>
        </div>
      </div>

      <ul className="space-y-4">
        {menuItems.map((menu, index) => (
          <li key={index}>
            <button
              onClick={menu.onClick || (() => handleMenuClick(""))}
              className="flex items-center w-full p-3 rounded-md hover:bg-[#B7021C] group transition-colors"
            >
              <span className="text-[#002256] group-hover:text-white text-lg xl:text-xl mr-4">
                <Image
                  src={menu.icon || "/default-icon.png"}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="w-5 h-5 xl:w-5 xl:h-5"
                />
              </span>
              <span className="text-[#002256] group-hover:text-white text-sm xl:text-lg font-medium">
                {menu.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="bg-[#002256] w-full h-40 sm:h-48 md:h-60 lg:h-60 xl:h-60 mt-8 sm:mt-16 md:mt-16 rounded-lg flex flex-col justify-end items-center pb-3 sm:pb-4 md:pb-5 lg:pb-6">
        <div className="flex flex-col items-center px-4 w-full max-w-xs">
          <span className="text-white text-xs sm:text-xs md:text-xs mb-2 sm:mb-3 text-center mt-16">
            Tens algumas dúvidas?
          </span>
          <button className="bg-white w-full max-w-[180px] flex items-center justify-center px-4 sm:px-6 md:px-8 py-1 sm:py-1 rounded-lg text-xs sm:text-xs md:text-xs text-gray-600 font-medium hover:bg-gray-100 transition duration-200 ease-in-out">
            Fale connosco!
          </button>
        </div>
      </div>
    </aside>
  );
}
