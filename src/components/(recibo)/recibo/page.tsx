/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import CopiableNumber from "@/components/ui/copiableNumber";
import { LoadingContainer } from "@/components/ui/loading-container";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import {
  formatCurrency,
  formatDate,
  getStatusReciverColors,
  getStatusReciverTexts,
  STATUS_OPTIONS_RECIBOS,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaUser,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRecibos } from "@/hooks/useRecibos ";
import { Grid, List } from "lucide-react";
import { ReciboPDFModal } from "../ModalRecibo";
import ReactDOM from "react-dom/client";
import { MdPayment } from "react-icons/md";
import { toast } from "sonner";
import { useReciboActivity } from "@/lib/activityExamples";

type ViewMode = "grid" | "list";

type ReciboPageProps = {
  onSelectDetail?: (id: string) => void;
  filterParams?: Record<string, string>;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

type DownloadStatus = {
  [number: string]: "idle" | "downloading" | "success" | "error";
};

export default function ReciboPage({ filterParams }: ReciboPageProps) {
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [loadingView, setLoadingView] = useState<ReciboLoadingState>({});
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { token } = useSessionCheckToken();
  const { registerReciboDownloadActivity } = useReciboActivity();

  // Debug: verificar se os parâmetros estão chegando
  console.log("ReciboPage - filterParams:", filterParams);

  const {
    filteredRecibos,
    isLoadingRecibos,
    recibos,
    errorRecibo,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    resetFilters,
  } = useRecibos(filterParams);

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));
    setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "downloading" }));

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

      // Verificar se o conteúdo é realmente um PDF
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = new TextDecoder("utf-8").decode(uint8Array.slice(0, 5));

      if (!pdfHeader.startsWith("%PDF")) {
        throw new Error("O arquivo baixado não é um PDF válido");
      }

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "success" }));
      toast.success(`Recibo ${invoiceNumber} baixado com sucesso!`);

      // Registrar atividade de download
      try {
        const recibo = recibos.find((r) => r.number === invoiceNumber);
        const amount = recibo ? formatCurrency(recibo.value) : "N/A";
        await registerReciboDownloadActivity(invoiceNumber, amount);
      } catch (error) {
        console.error("Erro ao registrar atividade de download:", error);
        // Não interrompe o fluxo se falhar ao registrar atividade
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "idle" }));
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao baixar PDF:", error);
      setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "error" }));
      toast.error(`Erro ao baixar recibo ${invoiceNumber}: ${error.message}`);

      // Reset status after 5 seconds
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "idle" }));
      }, 5000);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  const visualizarPDF = async (
    invoiceNumber: string,
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

      // Criar modal para visualizar PDF
      const modalContainer = document.createElement("div");
      modalContainer.id = "pdf-modal-container";
      document.body.appendChild(modalContainer);

      const root = ReactDOM.createRoot(modalContainer);

      const closeModal = () => {
        root.unmount();
        document.body.removeChild(modalContainer);
        URL.revokeObjectURL(url);
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
    } catch (error: any) {
      console.error("Erro ao visualizar PDF:", error);
      toast.error(
        `Erro ao visualizar recibo ${invoiceNumber}: ${error.message}`
      );
    } finally {
      setLoadingView((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  const getDownloadButtonContent = (invoiceNumber: string) => {
    const status = downloadStatus[invoiceNumber];
    const isLoading = loadingStates[invoiceNumber];

    if (isLoading) {
      return (
        <>
          <LoadingSpinner size="sm" />
          <span>Baixando...</span>
        </>
      );
    }

    switch (status) {
      case "success":
        return (
          <>
            <FaCheck className="text-green-500" />
            <span>Baixado!</span>
          </>
        );
      case "error":
        return (
          <>
            <FaExclamationTriangle className="text-red-500" />
            <span>Erro</span>
          </>
        );
      default:
        return (
          <>
            <FaDownload />
            <span>Download</span>
          </>
        );
    }
  };

  const getDownloadButtonVariant = (invoiceNumber: string) => {
    const status = downloadStatus[invoiceNumber];

    switch (status) {
      case "success":
        return "outline";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  // Função para determinar se deve mostrar botão de pagamento
  const shouldShowPaymentButton = (status: number) => {
    return status === 1 || status === 2; // Em Cobrança
  };

  // Função para determinar se deve mostrar botão de download
  const shouldShowDownloadButton = (status: number) => {
    return status === 5; // Cobrado
  };

  if (isLoadingRecibos) {
    return (
      <LoadingContainer fullHeight={true} message="CARREGANDO RECIBOS..." />
    );
  }

  if (errorRecibo) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erro ao carregar recibos
            </h3>
            <p className="text-gray-500 mb-4">{errorRecibo}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 lg:p-8 mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Recibos
        </h1>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`p-2 md:p-2 ${
              viewMode === "grid"
                ? "bg-[#002256] text-white border-[#002256] hover:bg-[#002256]/90"
                : "text-[#002256] bg-gray-200 hover:bg-[#002256] hover:text-white"
            }`}
          >
            <Grid className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setViewMode("list")}
            className={`p-2 md:p-2 ${
              viewMode === "list"
                ? "bg-[#002256] text-white border-[#002256] hover:bg-[#002256]/90"
                : "text-[#002256] bg-gray-200 hover:bg-[#002256] hover:text-white"
            }`}
          >
            <List className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
          <input
            type="text"
            placeholder="Pesquisar recibos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002256] focus:border-transparent"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 text-sm md:text-base">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS_RECIBOS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={resetFilters}
          className="flex items-center gap-2 text-sm md:text-base py-2 md:py-2"
        >
          <FaFilter className="size-3 md:size-4" />
          <span className="md:hidden">Limpar</span>
          <span className="hidden md:inline">Limpar Filtros</span>
        </Button>
      </div>

      {filteredRecibos.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <FaUser className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
            Nenhum recibo encontrado
          </h3>
          <p className="text-sm md:text-base text-gray-500">
            {searchTerm || statusFilter
              ? "Tente ajustar os filtros de pesquisa"
              : "Você ainda não possui recibos"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredRecibos.map((recibo) => (
            <Card
              key={recibo.number}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="border-b p-3 md:p-6">
                <CardTitle className="flex items-center justify-between text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <CopiableNumber number={recibo.number} />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusReciverColors(
                      recibo.status
                    )}`}
                  >
                    {getStatusReciverTexts(recibo.status)}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                  <FaUser className="text-[#002256] size-3 md:size-4" />
                  <h3 className="text-sm font-medium text-[#002256]">
                    {recibo.clientName}
                  </h3>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 md:pt-4 p-3 md:p-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Valor:
                    </h3>

                    <h3 className="text-sm font-medium text-[#002256]">
                      {formatCurrency(recibo.value)}
                    </h3>
                  </div>
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Referência:
                    </h3>

                    <h3 className="text-sm font-medium text-[#002256]">
                      {recibo.mbref}
                    </h3>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 p-3 md:p-6">
                <div className="text-xs text-gray-500 text-center w-full">
                  {formatDate(recibo.from)} - {formatDate(recibo.to)}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => visualizarPDF(recibo.number, recibo.status)}
                    disabled={loadingView[recibo.number]}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs md:text-sm py-2"
                  >
                    {loadingView[recibo.number] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FaEye className="size-3 md:size-4" />
                    )}
                    <span className="ml-1">Ver</span>
                  </Button>
                  {shouldShowPaymentButton(recibo.status) && (
                    <Button
                      onClick={() => {
                        console.log("Pagar recibo:", recibo.number);
                      }}
                      size="sm"
                      className="flex-1 text-xs md:text-sm py-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MdPayment className="size-3 md:size-4" />
                      <span className="ml-1">Pagar</span>
                    </Button>
                  )}
                  {shouldShowDownloadButton(recibo.status) && (
                    <Button
                      onClick={() => handleDownload(recibo.number)}
                      disabled={loadingStates[recibo.number]}
                      variant={getDownloadButtonVariant(recibo.number)}
                      size="sm"
                      className="flex-1 text-xs md:text-sm py-2 bg-[#002256] hover:bg-[#002256]/90 text-white"
                    >
                      {getDownloadButtonContent(recibo.number)}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredRecibos.map((recibo) => (
            <div
              key={recibo.number}
              className="p-3 md:p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Número:
                    </h3>

                    <CopiableNumber number={recibo.number} />
                  </div>
                  <div className="flex items-start gap-2">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Cliente:
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {recibo.clientName}
                    </h3>
                  </div>
                  <div className="flex items-start gap-2">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Valor:
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {formatCurrency(recibo.value)}
                    </h3>
                  </div>
                  <div className="flex items-start gap-2">
                    <h3 className="text-sm font-medium text-[#002256]">
                      Referência:
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {recibo.mbref}
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {recibo.mbref}
                    </h3>
                  </div>
                </div>
                <div className="mt-2 md:mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs md:text-sm">
                  <div>
                    <h3 className="text-sm font-medium text-[#002256]">
                      Data Faturação:
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {formatDate(recibo.from)} - {formatDate(recibo.to)}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <span
                    className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusReciverColors(
                      recibo.status
                    )}`}
                  >
                    {getStatusReciverTexts(recibo.status)}
                  </span>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={() =>
                        visualizarPDF(recibo.number, recibo.status)
                      }
                      disabled={loadingView[recibo.number]}
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none text-xs md:text-sm py-2"
                    >
                      {loadingView[recibo.number] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FaEye className="size-3 md:size-4" />
                      )}
                      <span className="ml-1">Ver</span>
                    </Button>
                    {shouldShowPaymentButton(recibo.status) && (
                      <Button
                        onClick={() => {
                          // Implementar lógica de pagamento
                          console.log("Pagar recibo:", recibo.number);
                        }}
                        size="sm"
                        className="flex-1 md:flex-none text-xs md:text-sm py-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <MdPayment className="size-3 md:size-4" />
                        <span className="ml-1">Pagar</span>
                      </Button>
                    )}
                    {shouldShowDownloadButton(recibo.status) && (
                      <Button
                        onClick={() => handleDownload(recibo.number)}
                        disabled={loadingStates[recibo.number]}
                        variant={getDownloadButtonVariant(recibo.number)}
                        size="sm"
                        className="flex-1 md:flex-none text-xs md:text-sm py-2 bg-[#002256] hover:bg-[#002256]"
                      >
                        {getDownloadButtonContent(recibo.number)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
