"use client";

import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

export function BackToTopButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calcula se chegou a 50% do scroll da página
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;

      const scrollableHeight = scrollHeight - clientHeight;
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;

      setShowButton(scrollPercentage >= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      <button
        onClick={scrollToTop}
        className="bg-white/95 backdrop-blur-sm border-2 border-[#002256]/20 hover:border-[#002256] text-[#002256] hover:bg-gradient-to-br hover:from-[#002256] hover:to-[#003875] hover:text-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-110 relative overflow-hidden"
        aria-label="Voltar ao topo"
      >
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/20 group-hover:to-blue-600/20 transition-all duration-300"></div>

        {/* Ícone com animações */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-[#002256] rounded-full opacity-0 group-hover:opacity-10 animate-ping"></div>
          <FaArrowUp className="w-5 h-5 relative z-10 group-hover:animate-bounce transform group-hover:-translate-y-1 transition-transform duration-300" />
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-[20] transition-transform duration-500 ease-out"></div>
        </div>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          Voltar ao topo
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
