"use client";

import React from "react";
import { IconType } from "react-icons";
import { IoGrid, IoBusinessSharp } from "react-icons/io5";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaTriangleExclamation } from "react-icons/fa6";
import { TbTopologyStar3 } from "react-icons/tb";
import { useUserProfile } from "@/hooks/useUserProfile";

interface BottomNavItem {
  title: string;
  key: string;
  icon: IconType;
  onClick: () => void;
}

interface BottomNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const BottomNavigation = ({
  activePage,
  onNavigate,
}: BottomNavigationProps) => {
  const { profile } = useUserProfile();
  const isCompany = profile?.user?.tipo_cliente === "Company";

  const navItems: BottomNavItem[] = [
    {
      title: isCompany ? "Dashboard" : "Início",
      key: isCompany ? "dashboardEmpresarial" : "Historico",
      icon: isCompany ? IoBusinessSharp : IoGrid,
      onClick: () =>
        onNavigate(isCompany ? "dashboardEmpresarial" : "Historico"),
    },
    {
      title: "Apólice",
      key: "apolice",
      icon: IoShieldCheckmarkSharp,
      onClick: () => onNavigate("apolice"),
    },
    {
      title: "Sinistros",
      key: "sinistro",
      icon: FaTriangleExclamation,
      onClick: () => onNavigate("sinistro"),
    },
    {
      title: "Simular",
      key: "Simulation",
      icon: TbTopologyStar3,
      onClick: () => onNavigate("Simulation"),
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;

          return (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-[#002256] bg-blue-50"
                  : "text-gray-500 hover:text-[#002256]"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? "text-[#002256]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-[#002256]" : "text-gray-500"
                }`}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
