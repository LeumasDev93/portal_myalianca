"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FaCheckCircle, FaExclamationTriangle, FaDownload, FaEnvelope, FaTimes, FaRedo } from "react-icons/fa";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

type PaymentResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "error" | "cancelled" | "pending";
  collectMessage?: string;
  onDownloadRecibo?: () => void;
  isDownloading?: boolean;
  reciboRef?: string;
  amount?: number;
  onRetryPayment?: () => void;
  isRetrying?: boolean;
};

export function PaymentResultModal({
  isOpen,
  onClose,
  status,
  collectMessage,
  onDownloadRecibo,
  isDownloading = false,
  reciboRef,
  amount,
  onRetryPayment,
  isRetrying = false,
}: PaymentResultModalProps) {
  const { profile } = useUserProfile();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [useSessionEmail, setUseSessionEmail] = useState(true);
  const [email, setEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const isSuccess = status === "success";
  const isPending = status === "pending";
  const isCancelled = status === "cancelled";

  // Atualiza email quando useSessionEmail muda
  useEffect(() => {
    if (useSessionEmail && profile?.user?.email) {
      setEmail(profile.user.email);
    } else if (useSessionEmail && !profile?.user?.email) {
      setEmail("");
    }
  }, [useSessionEmail, profile?.user?.email]);

  // Reseta o formulário quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setShowEmailForm(false);
      setUseSessionEmail(true);
      setEmail(profile?.user?.email || "");
      setIsSendingEmail(false);
    }
  }, [isOpen, profile?.user?.email]);

  const handleSendEmail = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    if (!reciboRef || !amount) {
      toast.error("Dados do recibo não encontrados");
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await fetch("/api/payment/send-receipt-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reciboRef,
          amount,
          email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Recibo enviado por email com sucesso!");
        setShowEmailForm(false);
      } else {
        toast.error(data.message || "Erro ao enviar recibo por email");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar recibo por email";
      toast.error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const handleClose = () => {
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
        // Se não há 'menu', manter apenas o path
        window.history.replaceState({}, '', url.pathname);
      } else {
        // Manter 'menu' se existir, remover os outros
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // Erro ao limpar URL - silencioso
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-2 sm:mx-4 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
            {isSuccess ? (
              <>
                <FaCheckCircle className="text-green-500 text-xl sm:text-2xl flex-shrink-0" />
                <span className="text-green-700 break-words">Pagamento Feito com Sucesso</span>
              </>
            ) : isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="text-blue-700 break-words">Processando Pagamento...</span>
              </>
            ) : isCancelled ? (
              <>
                <FaTimes className="text-orange-500 text-xl sm:text-2xl flex-shrink-0" />
                <span className="text-orange-700 break-words">Pagamento Cancelado pelo Cliente</span>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
                <span className="text-red-700 break-words">Erro no Pagamento</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-gray-600 space-y-2 pt-2 sm:pt-4 text-sm sm:text-base">
              {isSuccess ? (
                <>
                  <p className="text-base">
                    Seu pagamento foi processado e confirmado com sucesso!
                  </p>
                  
                  {collectMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                      <p className="text-sm text-green-800">
                        {collectMessage}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-700 font-medium mt-4">
                    Você pode baixar o recibo agora ou acessá-lo mais tarde na lista de recibos.
                  </p>

                  {!showEmailForm ? null : (
                    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="use-session-email" className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
                          Usar email da sessão
                        </Label>
                        <Switch
                          id="use-session-email"
                          checked={useSessionEmail}
                          onCheckedChange={(checked) => {
                            setUseSessionEmail(checked);
                            if (checked) {
                              setEmail(profile?.user?.email || "");
                            }
                          }}
                          className="flex-shrink-0"
                        />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="email-input" className="text-xs sm:text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <Input
                          id="email-input"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={useSessionEmail}
                          className="w-full text-sm sm:text-base"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowEmailForm(false)}
                          className="w-full sm:flex-1 text-sm sm:text-base"
                          disabled={isSendingEmail}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSendEmail}
                          disabled={isSendingEmail || !email || !email.includes("@")}
                          className="w-full sm:flex-1 bg-[#002256] hover:bg-[#002256]/90 text-white text-sm sm:text-base"
                        >
                          {isSendingEmail ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span className="ml-1 sm:ml-2">Enviando...</span>
                            </>
                          ) : (
                            <>
                              <FaEnvelope className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                              Enviar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : isPending ? (
                <>
                  <p className="text-base">
                    Aguardando confirmação do pagamento...
                  </p>
                  
                  <p className="text-sm text-gray-700 font-medium mt-4">
                    Você receberá uma notificação quando o pagamento for confirmado.
                  </p>
                </>
              ) : isCancelled ? (
                <>
                  <p className="text-base">
                    O pagamento foi cancelado pelo cliente.
                  </p>

                  {collectMessage && (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mt-3">
                      <p className="text-sm text-orange-800">
                        {collectMessage}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-base">
                    Não foi possível processar seu pagamento. Por favor, tente novamente.
                  </p>

                  {collectMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                      <p className="text-sm text-red-800">
                        {collectMessage}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
          {isSuccess && onDownloadRecibo ? (
            <>
              {!showEmailForm ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="w-full sm:flex-1 order-3 sm:order-1 text-sm sm:text-base"
                    disabled={isDownloading || isSendingEmail}
                  >
                    Fechar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEmailForm(true)}
                    disabled={isDownloading || isSendingEmail}
                    className="w-full sm:flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 order-1 sm:order-2 text-sm sm:text-base"
                  >
                    <FaEnvelope className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Enviar por Email</span>
                    <span className="sm:hidden">Email</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={onDownloadRecibo}
                    disabled={isDownloading || isSendingEmail}
                    className="w-full sm:flex-1 bg-[#002256] hover:bg-[#002256]/90 text-white order-2 sm:order-3 text-sm sm:text-base"
                  >
                    {isDownloading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-1 sm:ml-2">Baixando...</span>
                      </>
                    ) : (
                      <>
                        <FaDownload className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                        <span className="hidden sm:inline">Baixar Recibo</span>
                        <span className="sm:hidden">Baixar</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full text-sm sm:text-base"
                  disabled={isDownloading || isSendingEmail}
                >
                  Fechar
                </Button>
              )}
            </>
          ) : isCancelled && onRetryPayment ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="w-full sm:flex-1 text-sm sm:text-base"
                disabled={isRetrying}
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={onRetryPayment}
                disabled={isRetrying}
                className="w-full sm:flex-1 bg-[#002256] hover:bg-[#002256]/90 text-white text-sm sm:text-base"
              >
                {isRetrying ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-1 sm:ml-2">Processando...</span>
                  </>
                ) : (
                  <>
                    <FaRedo className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                    <span>Tentar Novamente</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleClose}
              className={`w-full text-sm sm:text-base ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : isPending
                  ? "bg-blue-600 hover:bg-blue-700"
                  : isCancelled
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {isSuccess ? "Entendido" : isPending ? "Entendido" : "Fechar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

