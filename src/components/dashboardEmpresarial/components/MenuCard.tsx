"use client";

import { IconType } from "react-icons";

interface MenuData {
  title: string;
  description: string;
  icon: IconType;
  path: string;
}

interface MenuCardProps {
  menus: MenuData[];
  onNavigate?: (path: string) => void;
}

export function MenuCard({ menus, onNavigate }: MenuCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {menus.map((menu, index) => {
        const IconComponent = menu.icon;

        return (
          <div
            key={index}
            onClick={() => onNavigate && onNavigate(menu.path)}
            className="group bg-white border border-gray-200 hover:bg-blue-50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 hover:border-blue-300"
          >
            {/* Ícone */}
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#002256] to-[#003875] shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <IconComponent className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-bold text-[#002256] group-hover:text-[#001a3d] transition-colors duration-300">
                {menu.title}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed transition-colors duration-300">
                {menu.description}
              </p>
            </div>

            {/* Indicador de hover */}
            <div className="mt-4 flex justify-center">
              <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-[#002256] to-blue-400 rounded-full transition-all duration-300"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { MenuData };
