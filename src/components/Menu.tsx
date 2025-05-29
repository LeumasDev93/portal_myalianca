"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/assets/alianca.png";
import { IconType } from "react-icons";

export interface MenuItem {
  title: string;
  path: string;
  icon: string | IconType;
  hoverIcon?: string | React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

type MenuProps = {
  onMenuClick: (path: string) => void;
  menuItems: MenuItem[];
  activePath?: string;
};

export function Menu({ onMenuClick, menuItems, activePath }: MenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const mainItems = menuItems.filter((item) => item.title !== "Sair");
  const logoutItem = menuItems.find((item) => item.title === "Sair");

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 1280);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderIcon = (icon: string | IconType) => {
    if (typeof icon === "string") {
      return (
        <Image
          src={icon}
          alt="Icon"
          width={20}
          height={20}
          className="w-5 h-5"
        />
      );
    }
    const Icon = icon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="relative">
      <aside
        className={`hidden md:flex flex-col h-screen bg-white shadow-xl fixed top-0 left-0 z-40 transition-all duration-300
          ${isCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center px-4 py-[16px] xl:py-[15px] bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center">
            <Image
              src={Logo}
              alt="Logo"
              width={60}
              height={60}
              className={`transition-all duration-300 ${
                isCollapsed ? "w-10" : "w-12"
              }`}
            />
            {!isCollapsed && (
              <div className="flex ml-2">
                <h1 className="text-lg font-extrabold text-[#B7021C]">My</h1>
                <h1 className="text-lg font-extrabold text-[#002256]">
                  Alianca
                </h1>
              </div>
            )}
          </div>
        </div>

        {/* Itens do menu principal (scrolláveis) */}
        <div
          className="flex-1 overflow-y-auto py-2 px-1 mt-4 xl:mt-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <ul className="ml-2 space-y-4">
            {mainItems.map((menu, index) => {
              const isActive = menu.isActive || activePath === menu.path;
              return (
                <li key={index} className="relative">
                  <button
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={menu.onClick || (() => onMenuClick(menu.path))}
                    className={`flex items-center w-full p-2 xl:p-3 rounded-md transition-colors
                      ${isCollapsed ? "justify-center" : "justify-start"}
                      ${
                        isActive
                          ? "bg-[#002256] text-white"
                          : "text-[#002256] hover:bg-[#002256] hover:text-white"
                      }`}
                  >
                    <span>{renderIcon(menu.icon)}</span>
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{menu.title}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Item Sair (fixo no final) */}
        {logoutItem && (
          <div className="mt-auto p-4 border-t">
            <button
              onClick={logoutItem.onClick}
              className={`flex items-center w-full p-2 xl:p-3 rounded-md transition-colors
                ${isCollapsed ? "justify-center" : "justify-start"}
                text-[#002256] hover:bg-[#B7021C] hover:text-white`}
            >
              <span>{renderIcon(logoutItem.icon)}</span>
              {!isCollapsed && (
                <span className="ml-3 font-medium">{logoutItem.title}</span>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Tooltips para menu recolhido */}
      {isCollapsed &&
        [...mainItems, ...(logoutItem ? [logoutItem] : [])].map(
          (menu, index) => (
            <div
              key={index}
              className={`fixed left-16 top-0 h-full pointer-events-none z-50 transition-opacity duration-200 ${
                hoveredItem === index ? "opacity-100" : "opacity-0"
              }`}
              style={{
                top: `${80 + index * 56}px`,
              }}
            >
              <div className="ml-2 px-3 py-1 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap">
                {menu.title}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-gray-900 border-b-4 border-b-transparent"></div>
              </div>
            </div>
          )
        )}
    </div>
  );
}
