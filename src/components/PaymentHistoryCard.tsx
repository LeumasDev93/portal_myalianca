/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  FaCar,
  FaHome,
  FaPlane,
  FaUserShield,
  FaFileInvoice,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { IoReceiptSharp, IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdHealthAndSafety } from "react-icons/md";

const ramoIcons = {
  Automóvel: <FaCar className="text-white text-sm xl:text-xl" />,
  Habitação: <FaHome className="text-white text-sm xl:text-xl" />,
  Viagem: <FaPlane className="text-white text-sm xl:text-xl" />,
  Vida: <FaUserShield className="text-white text-sm xl:text-xl" />,
  Saúde: <MdHealthAndSafety className="text-white text-sm xl:text-xl" />,
  Outros: <FaFileInvoice className="text-white text-sm xl:text-xl" />,
};

// Cabeçalhos configuráveis por tipo
const tableConfigs = {
  Apólices: {
    icon: <IoShieldCheckmarkSharp />,
    headers: [
      { key: "ramo", label: "RAMO" },
      { key: "numberapolice", label: "NÚMERO APÓLICE" },
      { key: "dateEnd", label: "DATA FIM" },
      { key: "value", label: "VALOR" },
      { key: "status", label: "ESTADO" },
      { key: "action", label: "AÇÃO" },
      { key: "options", label: "" },
    ],
    data: [
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Normal",
        action: "Pagar",
        statusClass: "bg-green-300 text-green-700",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Pendente",
        action: "Pagar",
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Anulado",
        action: "",
        statusClass: "bg-red-300 text-red-700",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Normal",
        action: "",
        statusClass: "bg-green-300 text-green-700",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Pendente",
        action: "Pagar",
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Anulado",
        action: "",
        statusClass: "bg-red-300 text-red-700",
      },
      {
        ramo: "Automóvel",
        numberapolice: "ST-28-ZS",
        value: "30.000 ECV",
        dateEnd: "15/06/2024",
        status: "Pendente",
        action: "Pagar",
        statusClass: "bg-yellow-100 text-yellow-600",
      },
    ],
  },

  Sinistros: {
    icon: <FaTriangleExclamation />,
    headers: [
      { key: "ramo", label: "RAMO" },
      { key: "clientName", label: "NOME DO CLIENTE" },
      { key: "reference", label: "# REFERÊNCIA" },
      { key: "numberapolice", label: "NÚMERO APÓLICE" },
      { key: "occurrenceDate", label: "DATA DA OCORRÊNCIA" },
      { key: "status", label: "ESTADO" },
      { key: "options", label: "" },
    ],
    data: [
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        reference: "REF-001",
        numberapolice: "ST-28-ZS",
        occurrenceDate: "10/05/2024",
        estimatedValue: "15.000 ECV",
        status: "Encerrado",
        statusValue: 2,
        statusClass: "bg-green-300 text-green-700",
      },
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        reference: "REF-002",
        numberapolice: "ST-28-ZS",
        occurrenceDate: "10/05/2024",
        estimatedValue: "15.000 ECV",
        status: "Pendente",
        statusValue: 2,
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        reference: "REF-003",
        numberapolice: "ST-28-ZS",
        occurrenceDate: "10/05/2024",
        estimatedValue: "15.000 ECV",
        status: "Recusado",
        statusValue: 2,
        statusClass: "bg-red-300 text-red-700",
      },
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        reference: "REF-004",
        numberapolice: "ST-28-ZS",
        occurrenceDate: "10/05/2024",
        estimatedValue: "15.000 ECV",
        status: "Pendente",
        statusValue: 2,
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        reference: "REF-003",
        numberapolice: "ST-28-ZS",
        occurrenceDate: "10/05/2024",
        estimatedValue: "15.000 ECV",
        status: "Recusado",
        statusValue: 2,
        statusClass: "bg-red-300 text-red-700",
      },
    ],
  },

  Recibos: {
    icon: <IoReceiptSharp />,
    headers: [
      { key: "ramo", label: "RAMO" },
      { key: "clientName", label: "NOME DO CLIENTE" },
      { key: "type", label: "TIPO" },
      { key: "date", label: "Data" },
      { key: "value", label: "VALOR" },
      { key: "status", label: "ESTADO" },
      { key: "options", label: "" },
    ],
    data: [
      {
        ramo: "Saúde",
        clientName: "João Silva",
        type: "Seguro novo",
        date: "10/05/2024",
        value: "10.000 ECV",
        emissionDate: "12/03/2024",
        paymentMethod: "Transferência",
        status: "Cobrado",
        statusValue: 1,
        statusClass: "bg-green-300 text-green-700",
      },
      {
        ramo: "Automóvel",
        clientName: "João Silva",
        type: "Seguro novo",
        date: "10/05/2024",
        value: "10.000 ECV",
        emissionDate: "12/03/2024",
        paymentMethod: "Transferência",
        status: "Em Cobrança",
        statusValue: 1,
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Viagem",
        clientName: "João Silva",
        type: "Seguro novo",
        date: "10/05/2024",
        value: "10.000 ECV",
        emissionDate: "12/03/2024",
        paymentMethod: "Transferência",
        status: "Anulado",
        statusValue: 1,
        statusClass: "bg-red-300 text-red-700",
      },
      {
        ramo: "Vida",
        clientName: "João Silva",
        type: "Seguro novo",
        date: "10/05/2024",
        value: "10.000 ECV",
        emissionDate: "12/03/2024",
        paymentMethod: "Transferência",
        status: "Em Cobrança",
        statusValue: 1,
        statusClass: "bg-yellow-100 text-yellow-600",
      },
      {
        ramo: "Habitação",
        clientName: "João Silva",
        type: "Seguro novo",
        date: "10/05/2024",
        value: "10.000 ECV",
        emissionDate: "12/03/2024",
        paymentMethod: "Transferência",
        status: "Anulado",
        statusValue: 1,
        statusClass: "bg-red-300 text-red-700",
      },
    ],
  },
};

const PaymentHistoryCard = () => {
  const [activeTab, setActiveTab] =
    useState<keyof typeof tableConfigs>("Apólices");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const config = tableConfigs[activeTab];
  const totalItems = config.data.length;

  const [itemsPerPage, setItemsPerPage] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1280 ? 6 : 5
  );

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = config.data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const isXL = window.innerWidth >= 1280;
      setItemsPerPage(isXL ? 6 : 5);
    };

    window.addEventListener("resize", updateItemsPerPage);
    updateItemsPerPage(); // chamada inicial

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handleOptionsClick = (event: React.MouseEvent, item: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
    setSelectedItem(item);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleViewDetails = () => {
    alert(
      `Visualizando detalhes do item: ${
        selectedItem?.numberapolice || selectedItem?.id
      }`
    );
    closePopup();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: keyof typeof tableConfigs) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  return (
    <div className="w-full">
      <div className="flex sm:gap-2">
        {Object.keys(tableConfigs).map((tab) => {
          const tabIcon = tableConfigs[tab as keyof typeof tableConfigs].icon;

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as keyof typeof tableConfigs)}
              className={`flex items-center gap-2 px-[10px] sm:px-4 xl:px-6 py-2 xl:py-3 font-bold cursor-pointer ${
                activeTab === tab
                  ? "bg-[#002855] text-white rounded-t-lg text-[10px] sm:text-xs xl:text-sm"
                  : "text-[#002855] hover:text-[#231c48] text-sm"
              }`}
            >
              {tabIcon && (
                <span className="text-[10px]sm:text-base xl:text-lg">
                  {tabIcon}
                </span>
              )}
              {tab}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-lg shadow-md p-3 xl:p-6 w-full overflow-x-auto">
        <div
          className="overflow-y-auto"
          style={{
            minHeight: "400px",
            maxHeight: "650px",
            overflowY: "auto",
          }}
        >
          <table className="divide-y divide-gray-200 w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b-2 border-[#B7021C]">
                {config.headers.map((header) => (
                  <th
                    key={header.key}
                    className={`px-3 py-3 text-center text-[10px] xl:text-xs font-semibold whitespace-nowrap ${
                      header.key === "options" ? "w-10" : ""
                    } ${
                      header.label ? "text-black uppercase tracking-wider" : ""
                    }`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {config.headers.map((header, colIndex) => {
                    if (header.key === "options") {
                      return (
                        <td
                          key={colIndex}
                          className="px-3 py-4 text-center relative"
                        >
                          <button
                            onClick={(e) => handleOptionsClick(e, item)}
                            className="text-[#002855] hover:text-[#001a3d] focus:outline-none"
                          >
                            <HiDotsVertical className="text-sm xl:text-xl" />
                          </button>
                        </td>
                      );
                    }

                    const value = (item as Record<string, string>)[header.key];

                    if (header.key === "ramo") {
                      return (
                        <td key={colIndex} className="px-3 py-4 text-center">
                          <span className="bg-[#002855] rounded-full w-6 h-6 xl:w-8 xl:h-8 flex items-center justify-center mx-auto">
                            {ramoIcons[value as keyof typeof ramoIcons] ||
                              ramoIcons.Outros}
                          </span>
                        </td>
                      );
                    }

                    if (header.key === "status") {
                      return (
                        <td key={colIndex} className="px-3 py-4 text-center">
                          <span
                            className={`inline-block text-[10px] xl:text-xs font-semibold py-1 xl:py-2 px-3 rounded-md xl:rounded-lg text-center whitespace-nowrap w-[6rem] xl:w-[7rem] ${
                              item.statusClass ||
                              "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      );
                    }

                    if (header.key === "action") {
                      return (
                        <td key={colIndex} className="px-3 py-4 text-center">
                          {value && (
                            <button
                              className={`px-4 py-1 xl:py-2 rounded-md xl:rounded-lg text-[10px] xl:text-xs bg-[#002855] text-white hover:bg-[#001a3d]`}
                            >
                              {value}
                            </button>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIndex}
                        className="px-3 xl:py-4 text-[10px] xl:text-sm text-center"
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalItems > itemsPerPage && (
          <div className="flex justify-between items-center mt-4 px-4 py-2">
            <div className="text-xs xl:text-sm text-gray-600">
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, totalItems)} de {totalItems} itens
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 rounded-sm xl:p-2 xl:rounded-md text-xs xl:text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#002855] text-white hover:bg-[#001a3d]"
                }`}
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-5 h-5 xl:w-8 xl:h-8 rounded-sm xl:rounded-md text-xs xl:text-sm ${
                      page === currentPage
                        ? "bg-[#002855] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1 rounded-sm xl:p-2 xl:rounded-md text-xs xl:text-sm  ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#002855] text-white hover:bg-[#001a3d]"
                }`}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div
          className="absolute z-50 bg-white shadow-lg rounded-md py-2 w-48 border border-gray-300"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleViewDetails}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
          >
            <FaEye className="mr-2" />
            Ver detalhes
          </button>
          {/* Adicione mais opções aqui se necessário */}
        </div>
      )}

      {/* Overlay para fechar o popup ao clicar fora */}
      {showPopup && <div className="fixed inset-0 z-40" onClick={closePopup} />}
    </div>
  );
};

export default PaymentHistoryCard;
