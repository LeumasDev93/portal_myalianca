/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
// import { useToast } from "@/components/ui/use-toast";
import { useReciboActivity } from "@/lib/activityExamples";
import { useUserProfile } from "@/hooks/useUserProfile";
import { processPaymentSISP } from "@/service/paymentService";
// Removido: tratamento de SISP/callback (validação HMAC/collect/limpeza de URL). Agora o retorno do SISP é tratado no PaymentCallback.
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type ViewMode = "grid" | "list";

// Removido: todo tratamento de retorno SISP/callback e modal de resultado de pagamento. Tratado no PaymentCallback.

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

function ReciboPageContent({ filterParams }: ReciboPageProps) {
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [loadingView, setLoadingView] = useState<ReciboLoadingState>({});
  const [loadingPayment, setLoadingPayment] = useState<ReciboLoadingState>({}); // Loading para pagamento
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'download' | 'payment' | null;
    reciboNumber: string;
    reciboData?: any;
  }>({ open: false, type: null, reciboNumber: '' });
  const searchParams = useSearchParams();

  const { token } = useSessionCheckToken();
  const { registerReciboDownloadActivity } = useReciboActivity();
  const { profile } = useUserProfile(); // Dados do usuário
  // const { toast } = useToast();

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
    // refetchSilent,
  } = useRecibos(filterParams);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Removido: todo tratamento de retorno SISP/callback e modal de resultado de pagamento. Tratado no PaymentCallback.

  // Integração com callback: apenas ajustar o filtro por referência (sem auto-abrir/baixar)
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      try {
        setSearchTerm(reference);
      } catch {}
    }
  }, [searchParams, setSearchTerm]);

  // Helper para abrir HTML do SISP no mesmo separador (para iniciar pagamento)
  function openSISPInSamePage(html: string) {
    let processed = html;
    const hasEsc = html.includes('\\r\\n') || (html.includes('\\n') && !html.includes('\n'));
    if (hasEsc) {
      processed = html
        .replace(/\\r\\n/g, '\r\n')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
    }
    try {
      const blob = new Blob([processed], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const inFrame = ((): boolean => { try { return window.self !== window.top; } catch { return false; } })();
      if (inFrame && (window.top as Window)) {
        (window as any).top.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch {
      // noop
    }
  }

  const handleDownload = async (invoiceNumber: string) => {
    setConfirmDialog({ open: false, type: null, reciboNumber: '' });
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
      } catch {
        // Não interrompe o fluxo se falhar ao registrar atividade
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "idle" }));
      }, 3000);
    } catch (error: any) {
      setDownloadStatus((prev) => ({ ...prev, [invoiceNumber]: "error" }));
      const errorMessage = error?.message || "Erro desconhecido ao baixar recibo";
      toast.error(errorMessage, {
        description: `Recibo: ${invoiceNumber}`,
        duration: 5000,
      });

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
    setConfirmDialog({ open: false, type: null, reciboNumber: '' });
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

      const handlePaymentInModal = async () => {
        if (!profile?.user) {
          // Toast removido - apenas modal será mostrado
          return;
        }

        // Buscar dados do recibo pelo número
        const recibo = recibos.find((r) => r.number === invoiceNumber);
        if (!recibo) {
          // Toast removido - apenas modal será mostrado
          return;
        }

        setLoadingPayment((prev) => ({
          ...prev,
          [invoiceNumber]: true,
        }));

        try {
          try {
            const reciboRef = (recibos.find((r) => r.number === invoiceNumber) as any)?.mbref || invoiceNumber;
            if (reciboRef) {
              document.cookie = `recibo_ref=${encodeURIComponent(String(reciboRef))}; Path=/; Max-Age=1200;`;
              localStorage.setItem('recibo_ref', encodeURIComponent(String(reciboRef)));
            }
            if (token) {
              document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
            }
            // Salva o amount para usar na API collect
            if (recibo.value) {
              document.cookie = `payment_amount=${recibo.value}; Path=/; Max-Age=1200;`;
              localStorage.setItem('payment_amount', String(recibo.value));
            }
          } catch {}
          const reciboRef = recibo.mbref || invoiceNumber;
          
          // Usa novo fluxo SISP
          const result = await processPaymentSISP(
            recibo.value, // amount
            profile.user.nome, // userName
            profile.user.email || "", // userEmail
            profile.user.telemovel || profile.user.telefone || "", // userPhone
            profile.user.nif || "", // userNif
            invoiceNumber, // reciboNumber
            reciboRef // orderReference
          );

          // Abre HTML do SISP na mesma página
          if (result.html) {
            openSISPInSamePage(result.html);
          } else {
            throw new Error("HTML do pagamento não foi recebido");
          }
          closeModal();
        } catch (error: any) {
          // Extrai mensagem de erro de diferentes formatos
          let errorMessage = "Erro ao processar pagamento. Tente novamente.";
          
          if (error?.message) {
            errorMessage = error.message;
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.toString && error.toString() !== '[object Object]') {
            errorMessage = error.toString();
          }
          
          // Mostra erro em toast quando falha ao criar pagamento
          toast.error(errorMessage, {
            description: `Recibo: ${invoiceNumber}`,
            duration: 8000,
          });
        } finally {
          setLoadingPayment((prev) => ({
            ...prev,
            [invoiceNumber]: false,
          }));
        }
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
      const errorMessage = error?.message || "Erro desconhecido ao visualizar recibo";
      toast.error(errorMessage, {
        description: `Recibo: ${invoiceNumber}`,
        duration: 5000,
      });
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

  // Diálogo de confirmação para ações de Ver/Baixar/Pagar
  const openConfirmDialog = (
    type: 'download' | 'payment',
    reciboNumber: string,
    reciboData?: any
  ) => {
    setConfirmDialog({ open: true, type, reciboNumber, reciboData });
  };

  const handleConfirmedAction = async () => {
    const { type, reciboNumber, reciboData } = confirmDialog;
    if (!type || !reciboNumber) return;
    
    // Ativar loading baseado no tipo
    if (type === 'payment') {
      setLoadingPayment((prev) => ({ ...prev, [reciboNumber]: true }));
    } else if (type === 'download') {
      setLoadingStates((prev) => ({ ...prev, [reciboNumber]: true }));
    }
    
    try {
      if (type === 'download') {
        await handleDownload(reciboNumber);
      } else if (type === 'payment') {
        if (!profile?.user || !reciboData) {
          toast.error('Dados insuficientes para processar pagamento.');
          // Desativar loading antes de retornar
          setLoadingPayment((prev) => ({ ...prev, [reciboNumber]: false }));
          return;
        }
        // Persistir referência e valor para o retorno do SISP
        const rref = reciboData.mbref || reciboNumber;
        try {
          if (rref) localStorage.setItem('recibo_ref', encodeURIComponent(String(rref)));
          if (reciboData.value) localStorage.setItem('payment_amount', String(reciboData.value));
        } catch {}
        const res = await processPaymentSISP(
          reciboData.value,
          profile.user.username || profile.user.nome || '',
          profile.user.email || '',
          profile.user.telemovel || profile.user.telefone || '',
          profile.user.nif || '',
          reciboNumber,
          rref
        );
        openSISPInSamePage(res?.html);
        // Não fechar o dialog imediatamente após abrir o SISP, apenas desativar loading
        setLoadingPayment((prev) => ({ ...prev, [reciboNumber]: false }));
        setConfirmDialog({ open: false, type: null, reciboNumber: '' });
        return; // Retornar para não executar o finally que fecha o dialog
      }
    } catch (e: any) {
      const msg = e?.message || 'Operação falhou. Tente novamente.';
      toast.error(msg);
      // Desativar loading em caso de erro
      if (type === 'payment') {
        setLoadingPayment((prev) => ({ ...prev, [reciboNumber]: false }));
      } else if (type === 'download') {
        setLoadingStates((prev) => ({ ...prev, [reciboNumber]: false }));
      }
    } finally {
      // Desativar loading baseado no tipo (apenas se não for payment que já foi tratado)
      if (type !== 'payment') {
        if (type === 'download') {
          setLoadingStates((prev) => ({ ...prev, [reciboNumber]: false }));
        }
        setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      }
    }
  };

  // 1️⃣ LOADING
  if (isLoadingRecibos) {
    return (
      <div className="flex-1 w-full h-screen flex items-center justify-center">
        <LoadingContainer fullHeight={true} message="CARREGANDO RECIBOS..." />
      </div>
    );
  }

  // 2️⃣ ERRO
  if (errorRecibo) {
    return (
      <div className="flex-1 w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <FaExclamationTriangle className="text-4xl text-red-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Erro ao carregar recibos
          </h3>
          <p className="text-gray-500 text-center">{errorRecibo}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // 3️⃣ SEM RECIBOS
  if (recibos.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Recibos
        </h1>
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <FaUser className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium">Nenhum recibo encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Você ainda não possui recibos cadastrados no sistema.
          </p>
        </div>
      </div>
    );
  }

  // 4️⃣ TEM DADOS
  // Paginação (estilo History)
  const totalItems = filteredRecibos.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentRecibos = filteredRecibos.slice(indexOfFirstItem, indexOfLastItem);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

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
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
        }}>
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
          {currentRecibos.map((recibo) => (
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
                      onClick={() => openConfirmDialog('payment', recibo.number, recibo)}
                      disabled={loadingPayment[recibo.number]}
                      size="sm"
                      className="flex-1 text-xs md:text-sm py-2 bg-blue-500 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                      {loadingPayment[recibo.number] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <MdPayment className="size-3 md:size-4" />
                      )}
                      <span className="ml-1">Pagar</span>
                    </Button>
                  )}
                  {shouldShowDownloadButton(recibo.status) && (
                    <Button
                      onClick={() => openConfirmDialog('download', recibo.number, recibo)}
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
          {currentRecibos.map((recibo) => (
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
                      Data Faturação:
                    </h3>
                    <h3 className="text-sm font-medium text-[#002256]">
                      {formatDate(recibo.from)} - {formatDate(recibo.to)}
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
                      onClick={() => visualizarPDF(recibo.number, recibo.status)}
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
                        onClick={() => openConfirmDialog('payment', recibo.number, recibo)}
                        disabled={loadingPayment[recibo.number]}
                        size="sm"
                        className="flex-1 md:flex-none text-xs md:text-sm py-2 bg-blue-500 hover:bg-blue-700 text-white disabled:opacity-50"
                      >
                        {loadingPayment[recibo.number] ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <MdPayment className="size-3 md:size-4" />
                        )}
                        <span className="ml-1">Pagar</span>
                      </Button>
                    )}
                    {shouldShowDownloadButton(recibo.status) && (
                      <Button
                        onClick={() => openConfirmDialog('download', recibo.number, recibo)}
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

      {/* Paginação (estilo History) */}
      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 px-2 md:px-4 py-2">
          <div className="text-[10px] md:text-xs text-gray-600 text-center md:text-left">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, totalItems)} de {totalItems} itens
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 text-[10px] md:text-sm">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#002256] text-white hover:bg-[#002256]/90"
              }`}
              aria-label="Página anterior"
            >
              <FaChevronLeft className="h-2 w-2 2xl:h-3 2xl:w-3" />
            </button>
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 4) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                let startPage = 1;
                if (currentPage <= 2) startPage = 1;
                else if (currentPage >= totalPages - 1) startPage = totalPages - 3;
                else startPage = currentPage - 1;
                for (let i = 0; i < 4; i++) {
                  const pageNum = startPage + i;
                  if (pageNum <= totalPages) pages.push(pageNum);
                }
                if (startPage > 1) pages.unshift("...");
                if (startPage + 3 < totalPages) pages.push("...");
              }
              return pages.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-2 h-2 md:w-4 md:h-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={page as number}
                    onClick={() => goToPage(page as number)}
                    className={`w-2 h-2 md:w-6 md:h-6 2xl:w-8 2xl:h-8 rounded-md text-xs md:text-sm font-medium transition-colors ${
                      page === currentPage ? "bg-[#002256] text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#002256] text-white hover:bg-[#002256]/90"
              }`}
              aria-label="Próxima página"
            >
              <FaChevronRight className="h-2 w-2 2xl:h-3 2xl:w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {confirmDialog.type === 'download' && 'Baixar Recibo'}
              {confirmDialog.type === 'payment' && 'Confirmar Pagamento'}
            </DialogTitle>
            {confirmDialog.type === 'payment' && confirmDialog.reciboData ? (
              <div className="space-y-4 py-4">
                <DialogDescription className="text-sm text-gray-700 font-medium text-center">
                  Pagamento de Recibo
                </DialogDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Referência:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {confirmDialog.reciboData.mbref || confirmDialog.reciboData.reference || confirmDialog.reciboNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Valor:</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(confirmDialog.reciboData.value)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-blue-600 font-semibold text-sm">Informação Importante:</span>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                    <li>Será redirecionado para a página segura de pagamento</li>
                    <li>Aceita cartões de crédito e débito</li>
                    <li>Receberá confirmação por email após o pagamento</li>
                    <li>O pagamento é processado de forma segura pelo SISP</li>
                  </ul>
                </div>
              </div>
            ) : (
            <DialogDescription className="text-gray-600">
              {confirmDialog.type === 'download' && (
                <>Tem certeza que deseja baixar o recibo <span className="font-semibold text-gray-900">{confirmDialog.reciboNumber}</span>?</>
              )}
            </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: null, reciboNumber: '' })}
              disabled={loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmedAction}
              disabled={loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]}
              className={`flex-1 ${
                confirmDialog.type === 'payment' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-[#002256] hover:bg-[#002256]/90'
              } text-white`}
            >
              {(loadingStates[confirmDialog.reciboNumber] || loadingPayment[confirmDialog.reciboNumber]) ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {confirmDialog.type === 'download' && 'Baixando...'}
                    {confirmDialog.type === 'payment' && 'Processando...'}
                  </span>
                </>
              ) : (
                <>
                  {confirmDialog.type === 'download' && 'Baixar'}
                  {confirmDialog.type === 'payment' && 'Pagar'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removido: PaymentResultModal e lógica de SISP. Tratado no PaymentCallback. */}

    </div>
  );
}

export default function ReciboPage({ filterParams }: ReciboPageProps) {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <ReciboPageContent filterParams={filterParams} />
    </Suspense>
  );
}

