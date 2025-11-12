/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ReciboPDFModal } from "@/components/(recibo)/ModalRecibo";
import { useApolices } from "@/hooks/useApolices";
import { useRecibos } from "@/hooks/useRecibos ";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useSinistros } from "@/hooks/useSinistros";
import { useUserProfile } from "@/hooks/useUserProfile";
import { tableMappeData } from "@/lib/tableMappe";
import { getFirstAndLastName } from "@/lib/utils";
import { useReciboActivity } from "@/lib/activityExamples";
import { processPayment } from "@/service/paymentService";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { FaTriangleExclamation } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { IoReceiptSharp, IoShieldCheckmarkSharp } from "react-icons/io5";
import { MdHealthAndSafety, MdOutlinePayment } from "react-icons/md";
import ReactDOM from "react-dom/client";
import { TableSkeleton } from "@/components/ui/table-skeleton";

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
  const [loadingPayment, setLoadingPayment] = useState<ReciboLoadingState>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'view' | 'download' | 'payment' | null;
    reciboNumber: string;
    reciboData?: any;
  }>({ open: false, type: null, reciboNumber: '' });
  const { token } = useSessionCheckToken();
  const { profile } = useUserProfile();
  const { toast: showToast } = useToast();

  const { errorRecibo, filteredRecibos, isLoadingRecibos } = useRecibos();

  const { apolices, errorApolices, isLoadingApolices } = useApolices();

  const { errorSinistros, sinistros, isLoadingSinistros } = useSinistros();

  const { formatRecibos, formatSinistros, formatApolices } = tableMappeData();

  const loading = isLoadingApolices || isLoadingSinistros || isLoadingRecibos;

  const [loadingView, setLoadingView] = useState<ReciboLoadingState>({});
  const { registerReciboDownloadActivity } = useReciboActivity();

  const openConfirmDialog = (type: 'view' | 'download' | 'payment', reciboNumber: string, reciboData?: any) => {
    // Para "Ver", executa diretamente sem confirmação
    if (type === 'view' && token) {
      visualizarPDF(reciboNumber, token, reciboData?.status);
      setShowPopup(false);
      return;
    }
    // Para outros tipos, abre o dialog de confirmação
    setConfirmDialog({ open: true, type, reciboNumber, reciboData });
    setShowPopup(false);
  };

  const handleConfirmedAction = async () => {
    const { type, reciboNumber, reciboData } = confirmDialog;
    
    if (type === 'view') {
      visualizarPDF(reciboNumber, token!, reciboData?.status);
    } else if (type === 'download') {
      handleDownload(reciboNumber);
    } else if (type === 'payment' && reciboData) {
      handlePayment(reciboNumber);
    }
  };

  const visualizarPDF = async (
    invoiceNumber: string,
    token: string,
    reciboStatus?: number
  ) => {
    setLoadingView((prev) => ({ ...prev, [invoiceNumber]: true }));
    
    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${invoiceNumber}/print/receipt`,
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

      // Cria um container temporário
      const container = document.createElement("div");
      document.body.appendChild(container);

      const root = ReactDOM.createRoot(container);

      const closeModal = () => {
        root.unmount(); // desmonta o componente
        document.body.removeChild(container); // remove o DOM
        URL.revokeObjectURL(url); // limpa a URL blob
      };

      const handlePaymentInModal = () => {
        // Implementação para pagamento
        console.log("Pagar recibo:", invoiceNumber);
        closeModal();
      };

      const handleDownloadInModal = () => {
        handleDownload(invoiceNumber);
        closeModal();
      };

      // Renderiza o modal
      root.render(
        <ReciboPDFModal
          pdfUrl={url}
          onClose={closeModal}
          reciboStatus={reciboStatus}
          reciboNumber={invoiceNumber}
          onPayment={handlePaymentInModal}
          onDownload={handleDownloadInModal}
        />
      );
      
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
    } catch (error: any) {
      const errorMessage = error?.message || "Erro desconhecido ao visualizar recibo";
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      showToast({
        title: errorMessage,
        description: `Recibo: ${invoiceNumber}`,
        variant: "destructive",
      });
    } finally {
      setLoadingView((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

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

  const itemsPerPage = 5;
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = config.data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleOptionsClick = (event: React.MouseEvent, item: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 224; // w-56 = 14rem = 224px
    const popupHeight = 200; // estimativa da altura do popup

    // Calcular posição inicial - posicionar próximo ao botão
    let left = rect.left;
    let top = rect.bottom + 5; // 5px de espaçamento

    // Ajustar se o popup sair da tela pela direita
    if (left + popupWidth > viewportWidth) {
      left = rect.right - popupWidth;
    }

    // Ajustar se o popup sair da tela pela esquerda
    if (left < 0) {
      left = 10;
    }

    // Ajustar se o popup sair da tela por baixo
    if (top + popupHeight > viewportHeight) {
      top = rect.top - popupHeight - 5; // 5px de espaçamento acima
    }

    // Ajustar se o popup sair da tela por cima
    if (top < 0) {
      top = 10;
    }

    setPopupPosition({ top, left });
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
  const handlePayment = async (invoiceNumber: string) => {
    if (!profile?.user) {
      showToast({
        title: "Dados do usuário não disponíveis",
        variant: "destructive",
      });
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      return;
    }

    // Buscar dados do recibo pelo número
    const recibo = filteredRecibos.find((r) => r.number === invoiceNumber);
    if (!recibo) {
      showToast({
        title: "Recibo não encontrado",
        variant: "destructive",
      });
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      return;
    }

    setLoadingPayment((prev) => ({
      ...prev,
      [invoiceNumber]: true,
    }));

    try {
      await processPayment(
        recibo.value,
        profile.user.nome,
        profile.user.email || "",
        profile.user.nif || "",
        invoiceNumber,
        recibo.mbref // Referência do recibo (ex: P2025.458)
      );
      
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      showToast({
        title: "Checkout aberto! Conclua o pagamento na nova aba.",
        variant: "default",
      });
    } catch (error: any) {
      
      const errorMessage = error?.message || error?.response?.data?.message || "Erro ao processar pagamento. Tente novamente.";
      
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      showToast({
        title: errorMessage,
        description: `Recibo: ${invoiceNumber}`,
        variant: "destructive",
      });
    } finally {
      setLoadingPayment((prev) => ({
        ...prev,
        [invoiceNumber]: false,
      }));
    }
  };

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));

    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${invoiceNumber}/print/receipt`,
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

      // Registrar atividade de download
      try {
        const recibo = filteredRecibos.find((r) => r.number === invoiceNumber);
        const amount = recibo
          ? `${recibo.mbref} ${recibo.value.toFixed(2)}`
          : "N/A";
        await registerReciboDownloadActivity(invoiceNumber, amount);
      } catch (error) {
        console.error("Erro ao registrar atividade de download:", error);
        // Não interrompe o fluxo se falhar ao registrar atividade
      }
      
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      showToast({
        title: `Recibo ${invoiceNumber} baixado com sucesso!`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Erro ao baixar PDF:", error);
      const errorMessage = error?.message || "Erro desconhecido ao baixar recibo";
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      showToast({
        title: errorMessage,
        description: `Recibo: ${invoiceNumber}`,
        variant: "destructive",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-1 md:gap-2 overflow-x-auto">
        {Object.keys(tableConfigs).map((tab) => {
          const tabIcon = tableConfigs[tab as keyof typeof tableConfigs].icon;

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as keyof typeof tableConfigs)}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 xl:px-6 py-2 xl:py-3 font-bold cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#002256] text-white rounded-t-lg text-xs md:text-sm xl:text-base"
                  : "text-[#002256] hover:text-[#002256]/70 text-xs md:text-sm"
              }`}
            >
              {tabIcon && (
                <span className="text-xs md:text-base xl:text-lg">
                  {tabIcon}
                </span>
              )}
              <span className="hidden sm:inline">{tab}</span>
              <span className="sm:hidden">
                {tab === "Apólices"
                  ? "Apól."
                  : tab === "Sinistros"
                  ? "Sinist."
                  : tab === "Recibos"
                  ? "Recib."
                  : tab}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-lg rounded-tl-lg shadow-md p-2 md:p-3 xl:p-6 w-full overflow-x-auto">
        <div
          className="overflow-y-auto"
          style={{
            minHeight: "300px",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <table className="divide-y divide-gray-200 w-full min-w-[600px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b-2 border-[#B7021C]">
                {config.headers.map((header) => (
                  <th
                    key={header.key}
                    className={`px-2 md:px-3 py-2 md:py-3 text-center text-[10px] md:text-xs 2xl:text-sm font-semibold whitespace-nowrap ${
                      header.key === "options" ? "w-8 md:w-10" : ""
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
                <TableSkeleton rows={5} columns={config.headers.length} />
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={config.headers.length}
                    className="text-center py-6 md:py-8 text-gray-500"
                  >
                    <div className="flex justify-center items-center space-x-2">
                      <div className="relative">
                        <FaSearch className="text-2xl md:text-4xl text-gray-400 animate-pulse" />
                        <FaFilter
                          className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-lg md:text-xl text-[#2d4e7f] animate-spin-slow"
                          style={{ animationDuration: "3s" }}
                        />
                      </div>
                      <span className="text-sm md:text-base">
                        Nenhum dado encontrado.
                      </span>
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
                            className="px-2 md:px-3 py-3 md:py-4 text-center relative z-10"
                          >
                            <button
                              onClick={(e) => handleOptionsClick(e, item)}
                              className="text-[#002855] hover:text-[#001a3d] focus:outline-none p-1 relative z-10"
                            >
                              <HiDotsVertical className="text-base md:text-lg xl:text-xl" />
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
                          <td
                            key={colIndex}
                            className="px-2 md:px-3 py-3 md:py-4 text-center"
                          >
                            <span className="bg-[#002256] rounded-full w-5 h-5 md:w-6 md:h-6 xl:w-8 xl:h-8 flex items-center justify-center mx-auto">
                              {ramoIcons[value as keyof typeof ramoIcons] ||
                                ramoIcons.Outros}
                            </span>
                          </td>
                        );
                      }
                      if (header.key === "clientName") {
                        return (
                          <td
                            key={colIndex}
                            className="px-2 md:px-3 py-3 md:py-4 text-center"
                          >
                            <span className="text-xs md:text-sm">
                              {getFirstAndLastName(item.rawData.clientName)}
                            </span>
                          </td>
                        );
                      }

                      if (header.key === "status") {
                        return (
                          <td
                            key={colIndex}
                            className="px-2 md:px-3 py-3 md:py-4 text-center"
                          >
                            <span
                              className={`inline-block text-xs md:text-sm font-semibold py-1 md:py-2 px-2 md:px-3 rounded-md text-center whitespace-nowrap  ${item.statusClass}`}
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
                            className="px-2 md:px-3 py-3 md:py-4 text-xs md:text-sm text-center"
                          >
                            <span>#{value}</span>
                          </td>
                        );
                      }

                      if (header.key === "action") {
                        return (
                          <td
                            key={colIndex}
                            className="px-2 md:px-3 py-3 md:py-4 text-center"
                          >
                            {value && (
                              <button
                                className={`px-2 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm bg-[#002256] text-white hover:bg-[#002256]/90`}
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
                          className="px-2 md:px-3 py-3 md:py-4 text-xs md:text-sm text-center"
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 px-2 md:px-4 py-2">
            <div className="text-[10px] md:text-xs text-gray-600 text-center md:text-left">
              Mostrando {indexOfFirstItem + 1} a{" "}
              {Math.min(indexOfLastItem, totalItems)} de {totalItems} itens
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 text-[10px] md:text-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#002256] text-white hover:bg-[#002256]/90"
                }`}
              >
                <FaChevronLeft className="h-2 w-2 2xl:h-3 2xl:w-3" />
              </button>

              {(() => {
                const pages: (number | string)[] = [];
                
                if (totalPages <= 4) {
                  // Se tiver até 4 páginas, mostra todas
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  let startPage = 1;
                  
                  // Determina onde começar o grupo de 4 páginas
                  if (currentPage <= 2) {
                    // Início: mostra 1 2 3 4
                    startPage = 1;
                  } else if (currentPage >= totalPages - 1) {
                    // Final: mostra as últimas 4
                    startPage = totalPages - 3;
                  } else {
                    // Meio: centraliza na página atual
                    startPage = currentPage - 1;
                  }
                  
                  // Adiciona as 4 páginas
                  for (let i = 0; i < 4; i++) {
                    const pageNum = startPage + i;
                    if (pageNum <= totalPages) {
                      pages.push(pageNum);
                    }
                  }
                  
                  // Adiciona reticências no início se necessário
                  if (startPage > 1) {
                    pages.unshift('...');
                  }
                  
                  // Adiciona reticências no final se necessário
                  if (startPage + 3 < totalPages) {
                    pages.push('...');
                  }
                }
                
                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="w-2 h-2 md:w-4 md:h-4 flex items-center justify-center text-gray-500 text-xs md:text-sm"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`w-2 h-2 md:w-6 md:h-6 2xl:w-8 2xl:h-8 rounded-md text-xs md:text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-[#002256] text-white shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#002256] text-white hover:bg-[#002256]/90"
                }`}
              >
                <FaChevronRight className="h-2 w-2 2xl:h-3 2xl:w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showPopup && selectedItem && (
        <div
          className="fixed z-[9999] bg-white shadow-lg rounded-md py-1 w-56 md:w-48 min-w-[200px] max-w-[280px] border border-gray-300"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
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
                className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-2 rounded-md mx-1"
              >
                <FaEye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="flex-1">Ver detalhes</span>
              </button>

              <button
                onClick={() => {
                  handleRenewPolicy(selectedItem.rawData.contractNumber);
                  setShowPopup(false);
                }}
                className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 rounded-md mx-1"
              >
                <FaSync className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="flex-1">Renovar</span>
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
              className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 rounded-md mx-1"
            >
              <FaEye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="flex-1">Ver detalhes</span>
            </button>
          )}

          {activeTab === "Recibos" && (
            <>
              {/* Botão Pagar - apenas para status 1 e 2 (Em Cobrança) */}
              {selectedItem?.rawData?.status &&
                (selectedItem.rawData.status === 1 ||
                  selectedItem.rawData.status === 2) && (
              <button
                onClick={() => {
                  try {
                    const reciboRef = selectedItem?.rawData?.reference || selectedItem?.rawData?.mbref || selectedItem?.rawData?.number;
                    if (reciboRef) {
                      document.cookie = `recibo_ref=${encodeURIComponent(String(reciboRef))}; Path=/; Max-Age=1200;`;
                    }
                    if (token) {
                      document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
                    }
                  } catch {}
                  openConfirmDialog('payment', selectedItem.rawData.number, selectedItem.rawData);
                }}
                className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 rounded-md mx-1"
              >
                <MdOutlinePayment className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="flex-1">Pagar Agora</span>
              </button>
                )}

              <button
                onClick={() => {
                  openConfirmDialog('view', selectedItem.rawData.number, selectedItem.rawData);
                }}
                className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 rounded-md mx-1"
              >
                <FaEye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="flex-1">Ver detalhes</span>
              </button>
              {/* Botão Download - apenas para status 5 (Cobrado) */}
              {selectedItem?.rawData?.status &&
                selectedItem.rawData.status === 5 && (
                  <button
                    onClick={() => {
                      openConfirmDialog('download', selectedItem.rawData.number, selectedItem.rawData);
                    }}
                    className="w-full cursor-pointer text-left px-3 py-3 text-xs sm:text-sm md:text-base text-gray-700 hover:text-gray-800 hover:bg-gray-100 flex items-center gap-3 rounded-md mx-1"
                  >
                    <FaFileDownload className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="flex-1">Baixar Recibo</span>
                  </button>
                )}
            </>
          )}
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-[9998]" onClick={closePopup} />
      )}

      {/* Dialog de Confirmação */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {confirmDialog.type === 'view' && 'Visualizar Recibo'}
              {confirmDialog.type === 'download' && 'Baixar Recibo'}
              {confirmDialog.type === 'payment' && 'Confirmar Pagamento'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {confirmDialog.type === 'view' && (
                <>Tem certeza que deseja visualizar o recibo <span className="font-semibold text-gray-900">{confirmDialog.reciboNumber}</span>?</>
              )}
              {confirmDialog.type === 'download' && (
                <>Tem certeza que deseja baixar o recibo <span className="font-semibold text-gray-900">{confirmDialog.reciboNumber}</span>?</>
              )}
              {confirmDialog.type === 'payment' && (
                <>Tem certeza que deseja pagar o recibo <span className="font-semibold text-gray-900">{confirmDialog.reciboNumber}</span> no valor de <span className="font-semibold text-green-600">{confirmDialog.reciboData ? formatCurrency(confirmDialog.reciboData.value) : ''}</span>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: null, reciboNumber: '' })}
              disabled={loadingView[confirmDialog.reciboNumber] || loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmedAction}
              disabled={loadingView[confirmDialog.reciboNumber] || loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]}
              className={`flex-1 ${
                confirmDialog.type === 'payment' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : confirmDialog.type === 'download'
                  ? 'bg-[#002256] hover:bg-[#002256]/90'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {(loadingView[confirmDialog.reciboNumber] || loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]) ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {confirmDialog.type === 'view' && 'Visualizando...'}
                    {confirmDialog.type === 'download' && 'Baixando...'}
                    {confirmDialog.type === 'payment' && 'Processando...'}
                  </span>
                </>
              ) : (
                <>
                  {confirmDialog.type === 'view' && 'Visualizar'}
                  {confirmDialog.type === 'download' && 'Baixar'}
                  {confirmDialog.type === 'payment' && 'Pagar'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryTable;
