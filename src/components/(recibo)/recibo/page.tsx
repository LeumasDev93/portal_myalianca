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
import { useState, useRef, useEffect, Suspense, useCallback } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { useReciboActivity } from "@/lib/activityExamples";
import { useUserProfile } from "@/hooks/useUserProfile";
import { processPaymentSISP } from "@/service/paymentService";
import { PaymentResultModal } from "../PaymentResultModal";

type ViewMode = "grid" | "list";

// Função para abrir HTML do SISP na mesma página
function openSISPInSamePage(html: string) {
  // Processa HTML (remove caracteres de escape se necessário)
  let processedHtml = html;
  const hasEscapeChars = html.includes('\\r\\n') || (html.includes('\\n') && !html.includes('\n'));
  
  if (hasEscapeChars) {
    processedHtml = html
      .replace(/\\r\\n/g, '\r\n')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
  }
  
  // Cria Blob URL
  try {
    const blob = new Blob([processedHtml], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    
    // Verifica se estamos em um iframe
    const isInIframe = window.self !== window.top;
    
    // Redireciona a página atual para o blob URL
    if (isInIframe && window.top) {
      window.top.location.href = blobUrl;
    } else {
      window.location.href = blobUrl;
    }
  } catch {
    // Erro ao criar blob - silencioso
  }
}


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
    type: 'view' | 'download' | 'payment' | null;
    reciboNumber: string;
    reciboData?: any;
  }>({ open: false, type: null, reciboNumber: '' });
  const paymentModalShownRef = useRef(false);
  const searchParams = useSearchParams();
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    status: "success" | "error" | "cancelled" | "pending";
    collectMessage?: string;
    merchantRef?: string;
    reciboRef?: string;
    amount?: number;
  }>({
    isOpen: false,
    status: "pending",
  });
  const [isDownloadingRecibo, setIsDownloadingRecibo] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  
  // Função helper para limpar localStorage e URL (não utilizada - cleanup feito no PaymentResultModal)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearPaymentData = useCallback(() => {
    // Limpar localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (
          key.includes('payment') || 
          key.includes('sisp') || 
          key.includes('transaction') ||
          key.includes('recibo_ref') ||
          key.includes('anywhere_token') ||
          key.includes('pay_token')
        ) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Erro ao limpar localStorage - silencioso
    }
    
    // Limpar parâmetros da URL (mantém apenas 'menu')
    try {
      const url = new URL(window.location.href);
      const paramsToRemove = [
        'server_status',
        'server_message',
        'collect_status',
        'collect_message',
        'merchantRef',
        'amount',
        'debug_ref',
        'debug_fp',
        'status_code',
        'message',
        'transaction_id',
        'channel_transaction_id',
        'finger_print',
        'reciboRef'
      ];
      paramsToRemove.forEach(param => url.searchParams.delete(param));
      
      // Se não houver mais parâmetros além de 'menu', manter apenas o path
      const remainingParams = Array.from(url.searchParams.keys()).filter(key => key !== 'menu');
      if (remainingParams.length === 0 && !url.searchParams.has('menu')) {
        window.history.replaceState({}, '', url.pathname);
      } else {
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Erro ao limpar URL - silencioso
    }
  }, []);
  
  const { token } = useSessionCheckToken();
  const { registerReciboDownloadActivity } = useReciboActivity();
  const { profile } = useUserProfile(); // Dados do usuário
  const { toast: showToast } = useToast();

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
    refetchSilent,
  } = useRecibos(filterParams);

  // Função para validar HMAC quando status_code = 1
  const validateHMAC = useCallback(async (transactionId: string, hmacFingerprint: string) => {
    try {
      const response = await fetch("/api/payment/validate-hmac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          hmacFingerprint,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Função para chamar API collect após HMAC validado (via API route do servidor)
  const callCollectAPI = useCallback(async (reciboRef: string, amount: number) => {
    try {
      console.log('[COLLECT API] Chamando API route /api/payment/collect:', {
        reciboRef,
        amount,
      });

      const response = await fetch('/api/payment/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reciboRef,
          amount,
        }),
        cache: 'no-store',
      });

      console.log('[COLLECT API] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const data = await response.json();
      console.log('[COLLECT API] Dados da resposta:', data);

      return {
        success: data.success || false,
        message: data.message || 'Erro ao processar cobrança',
      };
    } catch (error) {
      console.error('[COLLECT API] Erro:', error);
      return {
        success: false,
        message: 'Erro ao processar cobrança',
      };
    }
  }, []);



  // CRÍTICO: Lê parâmetros do SISP diretamente da URL e abre o modal
  useEffect(() => {
    // Verifica se há parâmetros do SISP na URL
    const statusCode = searchParams.get("status_code");
    const transactionId = searchParams.get("transaction_id");
    const fingerPrint = searchParams.get("finger_print");
    const message = searchParams.get("message");
    const channelTransactionId = searchParams.get("channel_transaction_id");

    if (statusCode && transactionId) {
      // Prepara os dados do pagamento
      const paymentData = {
        statusCode,
        transactionId,
        fingerPrint: fingerPrint || null,
        message: message || null,
        channelTransactionId: channelTransactionId || null,
      };

      // Salva no localStorage para persistência
      try {
        localStorage.setItem('sisp_payment_data', JSON.stringify(paymentData));
      } catch {
        // Erro ao salvar no localStorage - silencioso
      }

      // Abre o modal automaticamente com os dados da URL
      // Usa PaymentResultModal em vez do Dialog customizado
      // Verificar se a mensagem indica cancelamento (mesmo que status_code seja 2)
      const messageText = message?.toLowerCase() || "";
      const isCancelledMessage = messageText.includes('cancel') || 
                                  messageText.includes('cancelado') || 
                                  messageText.includes('cancelled');
      
      const modalStatus: "success" | "error" | "cancelled" | "pending" = 
        statusCode === "1" ? "success" : 
        statusCode === "3" || isCancelledMessage ? "cancelled" :
        statusCode === "2" ? "error" : 
        "pending";
      
      // Busca reciboRef e amount para passar ao modal
      let reciboRefForModal: string | undefined = searchParams.get("reciboRef") || undefined;
      let amountForModal: number | undefined = undefined;

      if (!reciboRefForModal) {
        try {
          const stored = localStorage.getItem('recibo_ref');
          if (stored) {
            reciboRefForModal = decodeURIComponent(stored);
          }
        } catch {
          // Erro ao ler reciboRef - silencioso
        }
      }

      const amountStr = searchParams.get("amount");
      if (amountStr) {
        amountForModal = Number(amountStr);
      } else {
        try {
          const storedAmount = localStorage.getItem('payment_amount');
          if (storedAmount) {
            amountForModal = Number(storedAmount);
          }
        } catch {
          // Erro ao ler amount - silencioso
        }
      }

      // Tenta usar merchantRef se reciboRef não for encontrado
      const merchantRef = searchParams.get("merchantRef") || searchParams.get("reciboRef");
      
      setPaymentResultModal({
        isOpen: true,
        status: modalStatus,
        collectMessage: message || undefined,
        merchantRef: merchantRef || undefined,
        reciboRef: reciboRefForModal || merchantRef || undefined,
        amount: amountForModal,
      });

      // Se status_code = "1" (sucesso), valida o HMAC e depois chama API collect
      if (statusCode === "1" && transactionId && fingerPrint) {
        console.log('[PAYMENT FLOW] Status code = 1, iniciando validação HMAC e collect...');
        
        // Primeiro mostra modal como pending
        setPaymentResultModal({
          isOpen: true,
          status: "pending",
          collectMessage: "Validando pagamento...",
        });

        validateHMAC(transactionId, fingerPrint)
          .then(async (hmacResult) => {
            console.log('[PAYMENT FLOW] Resultado HMAC:', hmacResult);
            
            if (hmacResult.success || hmacResult.validated) {
              console.log('[PAYMENT FLOW] HMAC válido, buscando dados para collect...');
              
              // HMAC válido - agora chama API collect
              // Busca reciboRef e amount de múltiplas fontes
              let reciboRef: string | null = searchParams.get("reciboRef");
              let amount: number | null = null;

              // Tenta reciboRef do localStorage se não estiver na URL
              if (!reciboRef) {
                try {
                  const stored = localStorage.getItem('recibo_ref');
                  if (stored) {
                    reciboRef = decodeURIComponent(stored);
                    console.log('[PAYMENT FLOW] reciboRef do localStorage:', reciboRef);
                  }
                } catch (e) {
                  console.error('[PAYMENT FLOW] Erro ao ler recibo_ref do localStorage:', e);
                }
              }

              // Tenta amount da URL
              const amountStr = searchParams.get("amount");
              if (amountStr) {
                amount = Number(amountStr);
                console.log('[PAYMENT FLOW] amount da URL:', amount);
              }

              // Se não tiver na URL, tenta localStorage
              if (!amount) {
                try {
                  const storedAmount = localStorage.getItem('payment_amount');
                  if (storedAmount) {
                    amount = Number(storedAmount);
                    console.log('[PAYMENT FLOW] amount do localStorage:', amount);
                  }
                } catch (e) {
                  console.error('[PAYMENT FLOW] Erro ao ler payment_amount do localStorage:', e);
                }
              }

              // Tenta cookies como último recurso
              if (!amount) {
                try {
                  const cookies = document.cookie.split(';');
                  const amountCookie = cookies.find(c => c.trim().startsWith('payment_amount='));
                  if (amountCookie) {
                    amount = Number(amountCookie.split('=')[1]);
                    console.log('[PAYMENT FLOW] amount dos cookies:', amount);
                  }
                } catch (e) {
                  console.error('[PAYMENT FLOW] Erro ao ler payment_amount dos cookies:', e);
                }
              }

              console.log('[PAYMENT FLOW] Dados finais para collect:', { reciboRef, amount });

              if (reciboRef && amount && amount > 0) {
                console.log('[PAYMENT FLOW] ✅ Dados encontrados, chamando API collect...');
                // Chama API collect
                const collectResult = await callCollectAPI(reciboRef, amount);
                
                console.log('[PAYMENT FLOW] Resultado collect:', collectResult);
                
                // Atualiza modal com resultado da collect
                setPaymentResultModal({
                  isOpen: true,
                  status: collectResult.success ? "success" : "error",
                  collectMessage: collectResult.message,
                  merchantRef: reciboRef || undefined,
                  reciboRef: reciboRef || undefined,
                  amount: amount || undefined,
                });
              } else {
                console.error('[PAYMENT FLOW] ❌ Dados não encontrados:', { reciboRef, amount });
                // Se não tiver reciboRef ou amount, mostra erro
                const merchantRef = searchParams.get("merchantRef");
                setPaymentResultModal({
                  isOpen: true,
                  status: "error",
                  collectMessage: `Dados do recibo não encontrados. ReciboRef: ${reciboRef || 'não encontrado'}, Amount: ${amount || 'não encontrado'}`,
                  merchantRef: merchantRef || reciboRef || undefined,
                  reciboRef: reciboRef || undefined,
                  amount: amount || undefined,
                });
              }
            } else {
              console.error('[PAYMENT FLOW] ❌ HMAC inválido:', hmacResult);
              // HMAC inválido
              const merchantRef = searchParams.get("merchantRef") || searchParams.get("reciboRef");
              setPaymentResultModal({
                isOpen: true,
                status: "error",
                collectMessage: "Falha na validação de segurança do pagamento",
                merchantRef: merchantRef || undefined,
                reciboRef: reciboRefForModal || merchantRef || undefined,
                amount: amountForModal,
              });
            }
          })
          .catch((error) => {
            console.error('[PAYMENT FLOW] ❌ Erro na validação HMAC:', error);
            // Erro na validação HMAC
            const merchantRef = searchParams.get("merchantRef") || searchParams.get("reciboRef");
            setPaymentResultModal({
              isOpen: true,
              status: "error",
              collectMessage: "Erro ao validar pagamento",
              merchantRef: merchantRef || undefined,
              reciboRef: reciboRefForModal || merchantRef || undefined,
              amount: amountForModal,
            });
          });
      }
    } else {
      // Se não há parâmetros na URL, tenta carregar do localStorage
      try {
        const storedPaymentData = localStorage.getItem('sisp_payment_data');
        if (storedPaymentData) {
          const parsedData = JSON.parse(storedPaymentData);
          
          // Abre o modal automaticamente se houver dados salvos
          // Usa PaymentResultModal em vez do Dialog customizado
          // Verificar se a mensagem indica cancelamento (mesmo que statusCode seja 2)
          const messageText = (parsedData.message || "").toLowerCase();
          const isCancelledMessage = messageText.includes('cancel') || 
                                      messageText.includes('cancelado') || 
                                      messageText.includes('cancelled');
          
          const modalStatus: "success" | "error" | "cancelled" | "pending" = 
            parsedData.statusCode === "1" ? "success" : 
            parsedData.statusCode === "3" || isCancelledMessage ? "cancelled" :
            parsedData.statusCode === "2" ? "error" : 
            "pending";
          
          // Busca reciboRef e amount do localStorage
          let reciboRefForModal: string | undefined = undefined;
          let amountForModal: number | undefined = undefined;

          try {
            const stored = localStorage.getItem('recibo_ref');
            if (stored) {
              reciboRefForModal = decodeURIComponent(stored);
            }
          } catch {
            // Erro ao ler reciboRef - silencioso
          }

          try {
            const storedAmount = localStorage.getItem('payment_amount');
            if (storedAmount) {
              amountForModal = Number(storedAmount);
            }
          } catch {
            // Erro ao ler amount - silencioso
          }
          
          setPaymentResultModal({
            isOpen: true,
            status: modalStatus,
            collectMessage: parsedData.message || undefined,
            reciboRef: reciboRefForModal,
            amount: amountForModal,
          });

          // Se status_code = "1" (sucesso) e ainda não validou, valida o HMAC e chama collect
          if (parsedData.statusCode === "1" && parsedData.transactionId && parsedData.fingerPrint) {
            console.log('[PAYMENT FLOW] Status code = 1 (localStorage), iniciando validação HMAC e collect...');
            
            // Primeiro mostra modal como pending
            setPaymentResultModal({
              isOpen: true,
              status: "pending",
              collectMessage: "Validando pagamento...",
            });

            validateHMAC(parsedData.transactionId, parsedData.fingerPrint)
              .then(async (hmacResult) => {
                console.log('[PAYMENT FLOW] Resultado HMAC (localStorage):', hmacResult);
                
                if (hmacResult.success || hmacResult.validated) {
                  console.log('[PAYMENT FLOW] HMAC válido (localStorage), buscando dados para collect...');
                  
                  // HMAC válido - agora chama API collect
                  // Busca reciboRef e amount do localStorage ou cookies
                  let reciboRef: string | null = null;
                  let amount: number | null = null;

                  try {
                    const storedRef = localStorage.getItem('recibo_ref');
                    if (storedRef) {
                      reciboRef = decodeURIComponent(storedRef);
                      console.log('[PAYMENT FLOW] reciboRef do localStorage:', reciboRef);
                    }
                    
                    // Tenta pegar amount dos cookies ou localStorage
                    try {
                      const storedAmount = localStorage.getItem('payment_amount');
                      if (storedAmount) {
                        amount = Number(storedAmount);
                        console.log('[PAYMENT FLOW] amount do localStorage:', amount);
                      } else {
                        const cookies = document.cookie.split(';');
                        const amountCookie = cookies.find(c => c.trim().startsWith('payment_amount='));
                        if (amountCookie) {
                          amount = Number(amountCookie.split('=')[1]);
                          console.log('[PAYMENT FLOW] amount dos cookies:', amount);
                        }
                      }
                    } catch (e) {
                      console.error('[PAYMENT FLOW] Erro ao ler amount:', e);
                    }
                  } catch (e) {
                    console.error('[PAYMENT FLOW] Erro ao ler reciboRef:', e);
                  }

                  console.log('[PAYMENT FLOW] Dados finais para collect (localStorage):', { reciboRef, amount });

                  if (reciboRef && amount && amount > 0) {
                    console.log('[PAYMENT FLOW] ✅ Dados encontrados (localStorage), chamando API collect...');
                    // Chama API collect
                    const collectResult = await callCollectAPI(reciboRef, amount);
                    
                    console.log('[PAYMENT FLOW] Resultado collect (localStorage):', collectResult);
                    
                    // Atualiza modal com resultado da collect
                    setPaymentResultModal({
                      isOpen: true,
                      status: collectResult.success ? "success" : "error",
                      collectMessage: collectResult.message,
                      merchantRef: reciboRef || undefined,
                      reciboRef: reciboRef || undefined,
                      amount: amount || undefined,
                    });
                  } else {
                    console.error('[PAYMENT FLOW] ❌ Dados não encontrados (localStorage):', { reciboRef, amount });
                    // Se não tiver reciboRef ou amount, mostra erro
                    setPaymentResultModal({
                      isOpen: true,
                      status: "error",
                      collectMessage: `Dados do recibo não encontrados. ReciboRef: ${reciboRef || 'não encontrado'}, Amount: ${amount || 'não encontrado'}`,
                      reciboRef: reciboRef || undefined,
                      amount: amount || undefined,
                    });
                  }
                } else {
                  console.error('[PAYMENT FLOW] ❌ HMAC inválido (localStorage):', hmacResult);
                  // HMAC inválido
                  setPaymentResultModal({
                    isOpen: true,
                    status: "error",
                    collectMessage: "Falha na validação de segurança do pagamento",
                    reciboRef: reciboRefForModal,
                    amount: amountForModal,
                  });
                }
              })
              .catch((error) => {
                console.error('[PAYMENT FLOW] ❌ Erro na validação HMAC (localStorage):', error);
                // Erro na validação HMAC
                setPaymentResultModal({
                  isOpen: true,
                  status: "error",
                  collectMessage: "Erro ao validar pagamento",
                  reciboRef: reciboRefForModal,
                  amount: amountForModal,
                });
              });
          }
        }
      } catch {
        // Erro ao carregar dados do localStorage - silencioso
      }
    }
  }, [searchParams, validateHMAC, callCollectAPI, showToast]); // Executa quando searchParams mudar

  // Carrega parâmetros da URL e exibe o modal de resultado do pagamento

  // Callback antigo (server_status, collect_status) - mantido para compatibilidade
  useEffect(() => {
    if (paymentModalShownRef.current) return;
    
    const serverStatus = searchParams.get("server_status");
    const serverMessage = searchParams.get("server_message");
    const collectStatus = searchParams.get("collect_status");
    const collectMessage = searchParams.get("collect_message");
    const merchantRef = searchParams.get("merchantRef");
    const statusCode = searchParams.get("status_code"); // Verificar status_code também
    
    if (!serverStatus && !collectStatus && !statusCode) return;
    
    paymentModalShownRef.current = true;
    
    // Determinar status do modal baseado no status_code (prioridade máxima), depois server_status, depois collect_status
    let modalStatus: "success" | "error" | "cancelled" | "pending" = "pending";
    let message = "";
    
    // Prioridade 1: Verificar status_code da URL (SISP) - mais confiável
    const messageFromParams = searchParams.get("message") || "";
    const messageText = (collectMessage || serverMessage || messageFromParams).toLowerCase();
    const isCancelledMessage = messageText.includes('cancel') || 
                                messageText.includes('cancelado') || 
                                messageText.includes('cancelled');
    
    if (statusCode === "1") {
      modalStatus = "success";
      message = collectMessage || serverMessage || messageFromParams || "Pagamento confirmado com sucesso";
    } else if (statusCode === "3" || (statusCode === "2" && isCancelledMessage)) {
      // status_code=3 sempre é cancelado, ou status_code=2 com mensagem de cancelamento
      modalStatus = "cancelled";
      message = collectMessage || serverMessage || messageFromParams || "Pagamento cancelado pelo cliente";
    } else if (statusCode === "2") {
      modalStatus = "error";
      message = collectMessage || serverMessage || messageFromParams || "Erro ao processar pagamento";
    } 
    // Prioridade 2: Verificar server_status (vem do /api/backoffice)
    else if (serverStatus === "cancelled") {
      modalStatus = "cancelled";
      message = serverMessage || collectMessage || searchParams.get("message") || "Pagamento cancelado pelo cliente";
    } else if (serverStatus === "ok") {
      modalStatus = "success";
      message = collectMessage || serverMessage || "Pagamento confirmado";
    } else if (serverStatus === "error") {
      modalStatus = "error";
      message = serverMessage || collectMessage || "Erro ao processar pagamento";
    }
    // Prioridade 3: Verificar collect_status
    else if (collectStatus === "ok") {
      modalStatus = "success";
      message = collectMessage || "Pagamento confirmado com sucesso";
    } else if (collectStatus === "error") {
      modalStatus = "error";
      message = collectMessage || serverMessage || "Erro ao processar pagamento";
    }
    
    // Busca reciboRef e amount para passar ao modal
    let reciboRefForModal: string | undefined = merchantRef || searchParams.get("reciboRef") || undefined;
    let amountForModal: number | undefined = undefined;

    if (!reciboRefForModal) {
      try {
        const stored = localStorage.getItem('recibo_ref');
        if (stored) {
          reciboRefForModal = decodeURIComponent(stored);
        }
        } catch {
          // Erro ao ler reciboRef - silencioso
        }
      }

      const amountStr = searchParams.get("amount");
    if (amountStr) {
      amountForModal = Number(amountStr);
    } else {
      try {
        const storedAmount = localStorage.getItem('payment_amount');
        if (storedAmount) {
          amountForModal = Number(storedAmount);
        }
      } catch {
        // Erro ao ler amount - silencioso
      }
    }

    // Abrir modal com a mensagem da API de collect
    setPaymentResultModal({
      isOpen: true,
      status: modalStatus,
      collectMessage: message,
      merchantRef: merchantRef || reciboRefForModal || undefined,
      reciboRef: reciboRefForModal || merchantRef || undefined,
      amount: amountForModal,
    });
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
            localStorage.setItem('recibo_ref', encodeURIComponent(String(reciboRef)));
          }
          if (token) {
            document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
          }
          // Salva o amount para usar na API collect
          if (reciboData.value) {
            document.cookie = `payment_amount=${reciboData.value}; Path=/; Max-Age=1200;`;
            localStorage.setItem('payment_amount', String(reciboData.value));
          }
        } catch {}
        const reciboRef = reciboData.mbref || reciboData.reference || reciboNumber;
        
        // Usa novo fluxo SISP
        const result = await processPaymentSISP(
          reciboData.value,
          profile.user.nome,
          profile.user.email || "",
          profile.user.telemovel || profile.user.telefone || "",
          profile.user.nif || "",
          reciboNumber,
          reciboRef
        );

        // Abre HTML do SISP na mesma página
        if (result.html) {
          openSISPInSamePage(result.html);
        } else {
          throw new Error("HTML do pagamento não foi recebido");
        }
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
          description: `Recibo: ${reciboNumber}`,
          duration: 8000,
        });
      } finally {
        setLoadingPayment((prev) => ({
          ...prev,
          [reciboNumber]: false,
        }));
      }
    }
  };

  // Função para tentar pagamento novamente quando cancelado
  const handleRetryPayment = useCallback(async () => {
    if (!paymentResultModal.reciboRef && !paymentResultModal.merchantRef) {
      toast.error("Não foi possível encontrar os dados do recibo para tentar novamente");
      return;
    }

    if (!profile?.user) {
      toast.error("Dados do usuário não encontrados");
      return;
    }

    setIsRetryingPayment(true);
    
    try {
      // Buscar o recibo pelo reciboRef ou merchantRef
      const reciboRefToFind = paymentResultModal.reciboRef || paymentResultModal.merchantRef;
      const recibo = recibos.find((r) => 
        r.mbref === reciboRefToFind || 
        r.number === reciboRefToFind
      );

      if (!recibo) {
        toast.error("Recibo não encontrado na lista. Por favor, tente novamente mais tarde.");
        return;
      }

      // Fechar o modal de resultado
      setPaymentResultModal({ ...paymentResultModal, isOpen: false });
      paymentModalShownRef.current = false;

      // Salvar dados necessários
      const reciboRef = recibo.mbref || recibo.number;
      if (reciboRef) {
        document.cookie = `recibo_ref=${encodeURIComponent(String(reciboRef))}; Path=/; Max-Age=1200;`;
        localStorage.setItem('recibo_ref', encodeURIComponent(String(reciboRef)));
      }
      if (token) {
        document.cookie = `anywhere_token=${encodeURIComponent(String(token))}; Path=/; Max-Age=1200;`;
      }
      if (recibo.value) {
        document.cookie = `payment_amount=${recibo.value}; Path=/; Max-Age=1200;`;
        localStorage.setItem('payment_amount', String(recibo.value));
      }

      // Iniciar novo pagamento
      const result = await processPaymentSISP(
        recibo.value,
        profile.user.nome,
        profile.user.email || "",
        profile.user.telemovel || profile.user.telefone || "",
        profile.user.nif || "",
        recibo.number,
        reciboRef
      );

      // Abre HTML do SISP na mesma página
      if (result.html) {
        openSISPInSamePage(result.html);
      } else {
        throw new Error("HTML do pagamento não foi recebido");
      }
    } catch (error: any) {
      // Extrai mensagem de erro de diferentes formatos
      let errorMessage = "Erro ao tentar pagamento novamente. Tente novamente.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage, {
        description: `Recibo: ${paymentResultModal.reciboRef || paymentResultModal.merchantRef || 'N/A'}`,
        duration: 8000,
      });
    } finally {
      setIsRetryingPayment(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResultModal, profile, recibos, token]);

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

      {/* Dialog de Confirmação */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              {confirmDialog.type === 'view' && 'Visualizar Recibo'}
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
              {confirmDialog.type === 'view' && (
                <>Tem certeza que deseja visualizar o recibo <span className="font-semibold text-gray-900">{confirmDialog.reciboNumber}</span>?</>
              )}
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

      {/* Modal de Resultado do Pagamento (API Collect e SISP) */}
      <PaymentResultModal
        isOpen={paymentResultModal.isOpen}
        onClose={async () => {
          const wasSuccess = paymentResultModal.status === "success";
          setPaymentResultModal({ ...paymentResultModal, isOpen: false });
          paymentModalShownRef.current = false;
          
          // Atualiza os recibos silenciosamente quando o modal fechar (apenas se foi sucesso)
          if (wasSuccess) {
            // Aguarda um pequeno delay para garantir que a API processou o pagamento
            setTimeout(async () => {
              await refetchSilent();
            }, 1000);
          }
        }}
        status={paymentResultModal.status}
        reciboRef={paymentResultModal.reciboRef || paymentResultModal.merchantRef}
        amount={paymentResultModal.amount}
        onRetryPayment={paymentResultModal.status === "cancelled" ? handleRetryPayment : undefined}
        isRetrying={isRetryingPayment}
        onDownloadRecibo={paymentResultModal.merchantRef ? async () => {
          if (!paymentResultModal.merchantRef) return;
          setIsDownloadingRecibo(true);
          try {
            // Tentar encontrar o recibo pela referência (mbref) ou pelo número
            const recibo = recibos.find((r) => 
              r.mbref === paymentResultModal.merchantRef || 
              r.number === paymentResultModal.merchantRef
            );
            
            if (recibo) {
              await handleDownload(recibo.number);
            } else {
              // Se não encontrar, tentar usar o merchantRef diretamente
              await handleDownload(paymentResultModal.merchantRef);
            }
          } catch {
            // Erro ao baixar recibo - silencioso
          } finally {
            setIsDownloadingRecibo(false);
          }
        } : undefined}
        isDownloading={isDownloadingRecibo}
      />

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

