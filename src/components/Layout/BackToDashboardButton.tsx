"use client";

interface BackToDashboardButtonProps {
  onClick: () => void;
  isMobile: boolean;
}

export function BackToDashboardButton({
  onClick,
  isMobile,
}: BackToDashboardButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed z-40 bg-[#002256] hover:bg-[#002256]/70 text-white px-4 py-1 rounded-full shadow-md transition-colors duration-200 flex items-center gap-2 text-xs font-medium ${
        isMobile ? "left-2 top-20 text-xs px-2 py-1" : "left-4 top-20"
      }`}
    >
      <svg
        className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span className={isMobile ? "hidden sm:inline" : ""}>
        Dashboard Empresarial
      </span>
      {isMobile && <span className="sm:hidden">Dashboard</span>}
    </button>
  );
}
