/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApolices } from "@/hooks/useApolices";
import { useRecibos } from "@/hooks/useRecibos ";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useSinistros } from "@/hooks/useSinistros";
import { tableMappeData } from "@/lib/tableMappe";
import { getFirstAndLastName } from "@/lib/utils";
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
  FaFileDownload,
  FaSync,
  FaFileAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { IoReceiptSharp, IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdHealthAndSafety, MdOutlinePayment } from "react-icons/md";

const ramoIcons = {
  Automóvel: <FaCar className="text-white text-sm xl:text-xl" />,
  Habitação: <FaHome className="text-white text-sm xl:text-xl" />,
  Viagem: <FaPlane className="text-white text-sm xl:text-xl" />,
  Vida: <FaUserShield className="text-white text-sm xl:text-xl" />,
  Saúde: <MdHealthAndSafety className="text-white text-sm xl:text-xl" />,
  Outros: <FaFileInvoice className="text-white text-sm xl:text-xl" />,
};

type PageProps = {
  onSelectDetailApolice: (id: string, contractNumber: string) => void;
  onSelectDetailSinistro: (id: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

const HistoryTable = ({
  onSelectDetailApolice,
  onSelectDetailSinistro,
}: PageProps) => {
  const [activeTab, setActiveTab] =
    useState<keyof typeof tableConfigs>("Apólices");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const { token } = useSessionCheckToken();

  const { errorRecibo, filteredRecibos, isLoadingRecibos } = useRecibos();

  const { apolices, errorApolices, isLoadingApolices } = useApolices();

  const { errorSinistros, sinistros, isLoadingSinistros } = useSinistros();

  const { formatRecibos, formatSinistros, formatApolices } = tableMappeData();

  const loading = isLoadingApolices || isLoadingSinistros || isLoadingRecibos;

  const tableConfigs = {
    Apólices: {
      icon: <IoShieldCheckmarkSharp />,
      headers: [
        { key: "numberapolice", label: "NÚMERO APÓLICE" },
        { key: "dateStart", label: "DATA INICIO" },
        { key: "dateEnd", label: "DATA FIM" },
        { key: "value", label: "VALOR" },
        { key: "status", label: "ESTADO" },
        { key: "options", label: "" },
      ],
      data: formatApolices(apolices),
      isLoading: isLoadingApolices,
      error: errorApolices,
    },
    Sinistros: {
      icon: <FaTriangleExclamation />,
      headers: [
        { key: "reference", label: "# REFERÊNCIA" },
        { key: "numberapolice", label: "NÚMERO APÓLICE" },
        { key: "occurrenceDate", label: "DATA DA OCORRÊNCIA" },
        { key: "status", label: "ESTADO" },
        { key: "options", label: "" },
      ],
      data: formatSinistros(sinistros),
      isLoading: isLoadingSinistros,
      error: errorSinistros,
    },
    Recibos: {
      icon: <IoReceiptSharp />,
      headers: [
        { key: "number", label: "NÚMERO RECIBO" },
        { key: "date", label: "Data" },
        { key: "value", label: "VALOR" },
        { key: "status", label: "ESTADO" },
        { key: "options", label: "" },
      ],
      data: formatRecibos(filteredRecibos),
      isLoading: isLoadingRecibos,
      error: errorRecibo,
    },
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: keyof typeof tableConfigs) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handleRenewPolicy = (contractNumber: number) => {
    // Implementação para renovar apólice
  };
  const handlePayment = (contractNumber: number) => {
    // Implementação para renovar apólice
  };

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));

    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${invoiceNumber}/print/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${invoiceNumber}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Erro ao baixar PDF:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
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

      <div className="bg-white rounded-b-lg rounded-tl-lg shadow-md p-3 xl:p-6 w-full overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td
                    colSpan={config.headers.length}
                    className="text-center py-8"
                  >
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#002855]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-[#002855]">
                        A carregar dados...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.headers.length}
                    className="text-center py-8 text-gray-500"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      <div className="relative">
                        <FaSearch className="text-4xl text-gray-400 animate-pulse" />
                        <FaFilter
                          className="absolute -top-2 -right-2 text-xl text-[#2d4e7f] animate-spin-slow"
                          style={{ animationDuration: "3s" }}
                        />
                      </div>
                      <span>Nenhum dado encontrado.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data rows */
                currentItems.map((item, rowIndex) => (
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

                      const value =
                        header.key in item &&
                        typeof (item as any)[header.key] !== "object"
                          ? String((item as any)[header.key])
                          : "";

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
                      if (header.key === "clientName") {
                        return (
                          <td key={colIndex} className="px-3 py-4 text-center">
                            <span>
                              {getFirstAndLastName(item.rawData.clientName)}
                            </span>
                          </td>
                        );
                      }

                      if (header.key === "status") {
                        return (
                          <td key={colIndex} className="px-3 py-4 text-center">
                            <span
                              className={`inline-block text-[10px] xl:text-xs font-semibold py-1 xl:py-2 px-3 rounded-md xl:rounded-lg text-center whitespace-nowrap w-[6rem] xl:w-[8rem] ${item.statusClass}`}
                            >
                              {item.status}
                            </span>
                          </td>
                        );
                      }
                      if (
                        header.key === "numberapolice" ||
                        header.key === "reference" ||
                        header.key === "number"
                      ) {
                        return (
                          <td
                            key={colIndex}
                            className="px-3 xl:py-4 text-[10px] xl:text-sm text-center"
                          >
                            <span>#{value}</span>
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
                ))
              )}
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

      {showPopup && selectedItem && (
        <div
          className="absolute z-50 bg-white shadow-lg rounded-md py-2 w-48 border border-gray-300"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opção comum a todas as abas */}

          {/* Opções específicas para Apólices */}
          {activeTab === "Apólices" && (
            <>
              <button
                onClick={() => {
                  try {
                    if (selectedItem.rawData.contractNumber === null) {
                      throw new Error("Número de contrato não disponível");
                    }
                    const contractId =
                      selectedItem.rawData.contractNumber.toString();
                    onSelectDetailApolice(contractId, contractId);
                  } catch (error) {}
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
              >
                <FaEye className="mr-2" />
                Ver detalhes
              </button>

              <button
                onClick={() => {
                  handleRenewPolicy(selectedItem.rawData.contractNumber);
                  setShowPopup(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
              >
                <FaSync className="mr-2" />
                Renovar
              </button>
            </>
          )}

          {/* Opções específicas para Sinistros */}
          {activeTab === "Sinistros" && (
            <button
              onClick={() => {
                try {
                  if (selectedItem.rawData.claimNumber === null) {
                    throw new Error("Número de contrato não disponível");
                  }
                  const contractId =
                    selectedItem.rawData.claimNumber.toString();
                  onSelectDetailSinistro(contractId);
                } catch (error) {}
              }}
              className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
            >
              <FaEye className="mr-2" />
              Ver detalhes
            </button>
          )}

          {/* Opções específicas para Recibos */}
          {activeTab === "Recibos" && (
            <>
              <button
                onClick={() => {
                  handleDownload(
                    selectedItem.rawData.number || selectedItem.rawData.number
                  );
                  setShowPopup(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
              >
                <FaFileDownload className="mr-2" />
                Baixar Recibo
              </button>
              {selectedItem?.rawData?.status &&
                (selectedItem.rawData.status === 1 ||
                  selectedItem.rawData.status === 2) && (
                  <button
                    onClick={() => {
                      handlePayment(selectedItem.rawData.contractNumber);
                      setShowPopup(false);
                    }}
                    className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:text-gray-800 flex items-center"
                  >
                    <MdOutlinePayment className="mr-2" />
                    Pagar Agora
                  </button>
                )}
            </>
          )}
        </div>
      )}

      {/* Overlay para fechar o popup ao clicar fora */}
      {showPopup && <div className="fixed inset-0 z-40" onClick={closePopup} />}
    </div>
  );
};

export default HistoryTable;
