"use client";

import React from "react";
import { IconType } from "react-icons";
import { IoGrid, IoBusinessSharp } from "react-icons/io5";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { FaTriangleExclamation } from "react-icons/fa6";
import { TbTopologyStar3 } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import { useUserProfile } from "@/hooks/useUserProfile";

interface BottomNavItem {
  title: string;
  key: string;
  icon: IconType;
  onClick: () => void;
}

interface BottomNavigationProps {
  activePage: string;
  onNavigate: (page: string, params?: Record<string, string>, options?: { clearSisp?: boolean }) => void;
}

export const BottomNavigation = ({
  activePage,
  onNavigate,
}: BottomNavigationProps) => {
  const { profile } = useUserProfile();
  const isCompany = profile?.user?.tipo_cliente === "Company";

  const baseItems: BottomNavItem[] = [
    {
      title: isCompany ? "Empresarial" : "Início",
      key: isCompany ? "empresarial" : "Historico",
      icon: isCompany ? IoBusinessSharp : IoGrid,
      onClick: () => {
        try {
          const url = new URL(window.location.href);
          const next = new URL(window.location.origin + url.pathname);
          window.history.replaceState({}, '', next.toString());
        } catch {}
        onNavigate(isCompany ? "empresarial" : "Historico", undefined, { clearSisp: true });
      },
    },
    {
      title: "Apólice",
      key: "apolice",
      icon: IoShieldCheckmarkSharp,
      onClick: () => {
        try {
          const url = new URL(window.location.href);
          const next = new URL(window.location.origin + url.pathname);
          window.history.replaceState({}, '', next.toString());
        } catch {}
        onNavigate("apolice", undefined, { clearSisp: true });
      },
    },
    {
      title: "Sinistros",
      key: "sinistro",
      icon: FaTriangleExclamation,
      onClick: () => {
        try {
          const url = new URL(window.location.href);
          const next = new URL(window.location.origin + url.pathname);
          window.history.replaceState({}, '', next.toString());
        } catch {}
        onNavigate("sinistro", undefined, { clearSisp: true });
      },
    },
    {
      title: "Simular",
      key: "Simulation",
      icon: TbTopologyStar3,
      onClick: () => {
        try {
          const url = new URL(window.location.href);
          const next = new URL(window.location.origin + url.pathname);
          window.history.replaceState({}, '', next.toString());
        } catch {}
        onNavigate("Simulation", undefined, { clearSisp: true });
      },
    },
  ];

  // Adiciona Dashboard apenas para Company
  const navItems: BottomNavItem[] = isCompany
    ? [
        baseItems[0],
        {
          title: "Dashboard",
          key: "dashboard",
          icon: MdDashboard,
          onClick: () => {
            try {
              const url = new URL(window.location.href);
              const next = new URL(window.location.origin + url.pathname);
              window.history.replaceState({}, '', next.toString());
            } catch {}
            onNavigate("dashboard", undefined, { clearSisp: true });
          },
        },
        ...baseItems.slice(1),
      ]
    : baseItems;

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
