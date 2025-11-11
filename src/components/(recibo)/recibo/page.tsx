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
import { useEffect, useState, useRef } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { useReciboActivity } from "@/lib/activityExamples";
import { useUserProfile } from "@/hooks/useUserProfile";
import { processPayment } from "@/service/paymentService";
import { PaymentResultModal } from "../PaymentResultModal";
import { useSearchParams } from "next/navigation";

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
  const [loadingPayment, setLoadingPayment] = useState<ReciboLoadingState>({}); // Loading para pagamento
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'view' | 'download' | 'payment' | null;
    reciboNumber: string;
    reciboData?: any;
  }>({ open: false, type: null, reciboNumber: '' });
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    status: "success" | "error" | "pending";
    hmacMessage?: string;
    collectMessage?: string;
    merchantRef?: string;
    amount?: string;
    debugInfo?: { reference?: string; fingerprint?: string };
  }>({
    isOpen: false,
    status: "success",
  });
  const [isDownloadingRecibo, setIsDownloadingRecibo] = useState(false);
  const paymentModalShownRef = useRef(false);
  
  const { token } = useSessionCheckToken();
  const { registerReciboDownloadActivity } = useReciboActivity();
  const { profile } = useUserProfile(); // Dados do usuário
  const { toast: showToast } = useToast();
  const searchParams = useSearchParams();

  // Debug: verificar se os parâmetros estão chegando
  console.log("🔍 ReciboPage - filterParams recebidos:", filterParams);

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

  console.log('📊 ReciboPage - statusFilter atual:', statusFilter);
  console.log('📊 ReciboPage - searchTerm atual:', searchTerm);

  // Debug: mostrar resultados da busca
  useEffect(() => {
    if (filterParams?.reference) {
      console.log('🔍 ReciboPage - Buscando por referência:', filterParams.reference);
      console.log('📊 Total de recibos:', recibos.length);
      console.log('📊 Recibos filtrados:', filteredRecibos.length);
      console.log('📋 Recibos encontrados:', filteredRecibos.map(r => ({ number: r.number, mbref: r.mbref })));
    }
    if (filterParams?.estado) {
      console.log('🔍 ReciboPage - Filtrando por estado:', filterParams.estado);
      console.log('📊 Status atual do filtro:', statusFilter);
      console.log('📊 Total de recibos:', recibos.length);
      console.log('📊 Recibos filtrados:', filteredRecibos.length);
      console.log('📋 Status dos recibos filtrados:', filteredRecibos.map(r => ({ number: r.number, status: r.status })));
      console.log('📋 TODOS os recibos:', recibos.map(r => ({ number: r.number, status: r.status })));
    }
  }, [filterParams?.reference, filterParams?.estado, filteredRecibos, recibos, statusFilter]);

  // Detect payment callback results and show modal
  useEffect(() => {
    console.log('🔍 [PAYMENT MODAL] useEffect executado');
    console.log('🔍 [PAYMENT MODAL] window.location.search:', window?.location?.search);
    console.log('🔍 [PAYMENT MODAL] searchParams:', searchParams);
    
    if (!searchParams) {
      console.log('🔍 [PAYMENT MODAL] searchParams não disponível');
      return;
    }
    
    if (paymentModalShownRef.current) {
      console.log('🔍 [PAYMENT MODAL] Modal já foi mostrado, ignorando');
      return;
    }
    
    // Ler diretamente da URL também
    const urlParams = new URLSearchParams(window.location.search);
    console.log('🔍 [PAYMENT MODAL] URL params direto:', {
      server_status: urlParams.get("server_status"),
      server_message: urlParams.get("server_message"),
      collect_status: urlParams.get("collect_status")
    });
    
    const serverStatus = searchParams.get("server_status");
    const serverMessage = searchParams.get("server_message");
    const collectStatus = searchParams.get("collect_status");
    const collectMessage = searchParams.get("collect_message");
    const merchantRef = searchParams.get("merchantRef");
    const amount = searchParams.get("amount");
    const debugRef = searchParams.get("debug_ref");
    const debugFp = searchParams.get("debug_fp");

    console.log('🔍 [PAYMENT MODAL] Parâmetros detectados via searchParams:', {
      serverStatus,
      serverMessage,
      collectStatus,
      collectMessage,
      merchantRef,
      amount
    });

    // Only show modal if we have payment callback parameters
    if (serverStatus || collectStatus) {
      let modalStatus: "success" | "error" | "pending" = "error";
      
      if (serverStatus === "pending") {
        modalStatus = "pending";
      } else if (serverStatus === "ok" && (!collectStatus || collectStatus === "ok")) {
        modalStatus = "success";
      } else {
        modalStatus = "error";
      }
      
      console.log('✅ [PAYMENT MODAL] Abrindo modal com status:', modalStatus);
      
      setPaymentResultModal({
        isOpen: true,
        status: modalStatus,
        hmacMessage: serverMessage || (serverStatus === "ok" ? "Validação HMAC confirmada" : serverStatus === "pending" ? "Aguardando confirmação..." : "Falha na validação"),
        collectMessage: collectMessage || (collectStatus === "ok" ? "Cobrança confirmada com sucesso" : collectStatus === "error" ? "Erro ao processar cobrança" : undefined),
        merchantRef: merchantRef || undefined,
        amount: amount || undefined,
        debugInfo: debugRef || debugFp ? { reference: debugRef || undefined, fingerprint: debugFp || undefined } : undefined,
      });
      
      paymentModalShownRef.current = true;
    } else {
      console.log('ℹ️ [PAYMENT MODAL] Nenhum parâmetro de pagamento detectado');
    }
  }, [searchParams]);

  const openConfirmDialog = (type: 'view' | 'download' | 'payment', reciboNumber: string, reciboData?: any) => {
    // Para "Ver", executa diretamente sem confirmação
    if (type === 'view') {
      visualizarPDF(reciboNumber, reciboData?.status);
      return;
    }
    // Para outros tipos, abre o dialog de confirmação
    setConfirmDialog({ open: true, type, reciboNumber, reciboData });
  };

  const handleConfirmedAction = async () => {
    const { type, reciboNumber, reciboData } = confirmDialog;
    
    if (type === 'view') {
      visualizarPDF(reciboNumber, reciboData?.status);
    } else if (type === 'download') {
      handleDownload(reciboNumber);
    } else if (type === 'payment' && reciboData && profile?.user) {
      setConfirmDialog({ open: false, type: null, reciboNumber: '' });
      setLoadingPayment((prev) => ({
        ...prev,
        [reciboNumber]: true,
      }));

      try {
        try {
          const reciboRef = reciboData.mbref || reciboData.reference || reciboNumber;
          if (reciboRef) {
            document.cookie = `recibo_ref=${encodeURIComponent(String(reciboRef))}; Path=/; Max-Age=1200;`;
          }
          if (token) {
            document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
          }
        } catch {}
        const reciboRef = reciboData.mbref || reciboData.reference || reciboNumber;
        await processPayment(
          reciboData.value,
          profile.user.nome,
          profile.user.email || "",
          profile.user.nif || "",
          reciboNumber,
          reciboRef
        );

        toast.success("Checkout aberto! Conclua o pagamento na nova aba.");
      } catch (error: any) {
        console.error("❌ [COMPONENTE] Erro capturado:", error);
        console.error("❌ [COMPONENTE] error.message:", error?.message);
        console.error("❌ [COMPONENTE] error.response:", error?.response);
        console.error("❌ [COMPONENTE] typeof error:", typeof error);
        console.error("❌ [COMPONENTE] Object.keys(error):", Object.keys(error || {}));
        
        const errorMessage = error?.message || error?.response?.data?.message || "Erro ao processar pagamento. Tente novamente.";
        console.error("❌ [COMPONENTE] Mensagem final para toast:", errorMessage);
        
        showToast({
          title: errorMessage,
          description: `Recibo: ${reciboNumber}`,
          variant: "destructive",
        });
      } finally {
        setLoadingPayment((prev) => ({
          ...prev,
          [reciboNumber]: false,
        }));
      }
    }
  };

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

  const handleClosePaymentModal = () => {
    console.log('🔍 [PAYMENT MODAL] Fechando modal');
    setPaymentResultModal((prev) => ({ ...prev, isOpen: false }));
    // Resetar a ref após fechar permite que o modal seja mostrado novamente se houver novo callback
    // paymentModalShownRef.current = false; // Descomente se quiser permitir múltiplas exibições
  };

  const handleDownloadReciboFromModal = async () => {
    if (!paymentResultModal.merchantRef) return;
    
    setIsDownloadingRecibo(true);
    try {
      await handleDownload(paymentResultModal.merchantRef);
      showToast({
        title: "Recibo baixado com sucesso!",
        description: `Recibo: ${paymentResultModal.merchantRef}`,
      });
    } catch (error: any) {
      showToast({
        title: "Erro ao baixar recibo",
        description: error?.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingRecibo(false);
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
          toast.error("Dados do usuário não disponíveis");
          return;
        }

        // Buscar dados do recibo pelo número
        const recibo = recibos.find((r) => r.number === invoiceNumber);
        if (!recibo) {
          toast.error("Recibo não encontrado");
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
            }
            if (token) {
              document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
            }
          } catch {}
          const reciboRef = recibo.mbref || invoiceNumber;
          await processPayment(
            recibo.value, // amount
            profile.user.nome, // userName
            profile.user.email || "", // userEmail
            profile.user.nif || "", // userPhone
            invoiceNumber, // merchantRef
            reciboRef // orderReference
          );

          toast.success("Checkout aberto! Conclua o pagamento na nova aba.");
          closeModal();
        } catch (error: any) {
          console.error("❌ [MODAL] Erro capturado:", error);
          console.error("❌ [MODAL] error.message:", error?.message);
          console.error("❌ [MODAL] typeof error:", typeof error);
          
          const errorMessage = error?.message || error?.response?.data?.message || "Erro ao processar pagamento. Tente novamente.";
          console.error("❌ [MODAL] Mensagem final para toast:", errorMessage);
          
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
          console.log('📊 Mudando filtro de status para:', value);
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
                    onClick={() => openConfirmDialog('view', recibo.number, recibo)}
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
                      onClick={() => openConfirmDialog('view', recibo.number, recibo)}
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

      {/* Payment Result Modal */}
      <PaymentResultModal
        isOpen={paymentResultModal.isOpen}
        onClose={handleClosePaymentModal}
        status={paymentResultModal.status}
        hmacMessage={paymentResultModal.hmacMessage}
        collectMessage={paymentResultModal.collectMessage}
        merchantRef={paymentResultModal.merchantRef}
        amount={paymentResultModal.amount}
        debugInfo={paymentResultModal.debugInfo}
        onDownloadRecibo={paymentResultModal.status === "success" ? handleDownloadReciboFromModal : undefined}
        isDownloading={isDownloadingRecibo}
      />

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
}
