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
import { LoadingScreen } from "@/components/ui/loading-screen";
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

type ViewMode = "grid" | "list";

type ReciboPageProps = {
  onSelectDetail?: (id: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

type DownloadStatus = {
  [number: string]: "idle" | "downloading" | "success" | "error";
};

export default function ReciboPage({}: ReciboPageProps) {
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [loadingView, setLoadingView] = useState<ReciboLoadingState>({});
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { token } = useSessionCheckToken();

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
  } = useRecibos();

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

  const visualizarPDF = async (invoiceNumber: string) => {
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
      root.render(
        <ReciboPDFModal
          pdfUrl={url}
          onClose={() => {
            root.unmount();
            document.body.removeChild(modalContainer);
            URL.revokeObjectURL(url);
          }}
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

  if (isLoadingRecibos) {
    return <LoadingScreen />;
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
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Recibos
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar recibos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002256] focus:border-transparent"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
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
          className="flex items-center gap-2"
        >
          <FaFilter />
          Limpar
        </Button>
      </div>

      {filteredRecibos.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum recibo encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter
              ? "Tente ajustar os filtros de pesquisa"
              : "Você ainda não possui recibos"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecibos.map((recibo) => (
            <Card
              key={recibo.number}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdPayment className="text-[#002256]" />
                    <span>#{recibo.number}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusReciverColors(
                      recibo.status
                    )}`}
                  >
                    {getStatusReciverTexts(recibo.status)}
                  </span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  {recibo.clientName}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Valor:</span>
                    <span className="font-semibold text-[#002256]">
                      {formatCurrency(recibo.value)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Referência:</span>
                    <span className="text-sm">{recibo.mbref}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="text-xs text-gray-500 text-center w-full">
                  {formatDate(recibo.from)} - {formatDate(recibo.to)}
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => visualizarPDF(recibo.number)}
                    disabled={loadingView[recibo.number]}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {loadingView[recibo.number] ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <FaEye />
                    )}
                    <span className="ml-1">Ver</span>
                  </Button>
                  <Button
                    onClick={() => handleDownload(recibo.number)}
                    disabled={loadingStates[recibo.number]}
                    variant={getDownloadButtonVariant(recibo.number)}
                    size="sm"
                    className="flex-1"
                  >
                    {getDownloadButtonContent(recibo.number)}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecibos.map((recibo) => (
            <div
              key={recibo.number}
              className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Número:</span>
                    <CopiableNumber number={recibo.number} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Cliente:</span>
                    <span>{recibo.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Valor:</span>
                    <span className="text-[#002256] font-semibold">
                      {formatCurrency(recibo.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Referência:</span>
                    <span>{recibo.mbref}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Data Faturação:</span>
                    <p>
                      {formatDate(recibo.from)} - {formatDate(recibo.to)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusReciverColors(
                      recibo.status
                    )}`}
                  >
                    {getStatusReciverTexts(recibo.status)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => visualizarPDF(recibo.number)}
                      disabled={loadingView[recibo.number]}
                      variant="outline"
                      size="sm"
                    >
                      {loadingView[recibo.number] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <FaEye />
                      )}
                      <span className="ml-1">Ver</span>
                    </Button>
                    <Button
                      onClick={() => handleDownload(recibo.number)}
                      disabled={loadingStates[recibo.number]}
                      variant={getDownloadButtonVariant(recibo.number)}
                      size="sm"
                    >
                      {getDownloadButtonContent(recibo.number)}
                    </Button>
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
