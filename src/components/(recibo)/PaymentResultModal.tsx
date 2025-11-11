"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type PaymentResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "error";
  hmacMessage?: string;
  collectMessage?: string;
  merchantRef?: string;
  amount?: string;
  debugInfo?: {
    reference?: string;
    fingerprint?: string;
  };
  onDownloadRecibo?: () => void;
  isDownloading?: boolean;
};

export function PaymentResultModal({
  isOpen,
  onClose,
  status,
  hmacMessage,
  collectMessage,
  merchantRef,
  amount,
  debugInfo,
  onDownloadRecibo,
  isDownloading = false,
}: PaymentResultModalProps) {
  const isSuccess = status === "success";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-bold">
            {isSuccess ? (
              <>
                <FaCheckCircle className="text-green-500 text-2xl" />
                <span className="text-green-700">Pagamento Confirmado!</span>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="text-red-500 text-2xl" />
                <span className="text-red-700">Erro no Pagamento</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600 space-y-2 pt-4">
            {isSuccess ? (
              <>
                <p className="text-base">
                  Seu pagamento foi processado e confirmado com sucesso!
                </p>
                
                {merchantRef && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                    <p className="text-sm font-semibold text-green-800">
                      Referência: <span className="font-normal">{merchantRef}</span>
                    </p>
                    {amount && (
                      <p className="text-sm font-semibold text-green-800">
                        Valor: <span className="font-normal">{amount} CVE</span>
                      </p>
                    )}
                  </div>
                )}

                {hmacMessage && (
                  <p className="text-sm text-gray-600 mt-2">
                    ✓ {hmacMessage}
                  </p>
                )}
                {collectMessage && (
                  <p className="text-sm text-gray-600">
                    ✓ {collectMessage}
                  </p>
                )}
                
                <p className="text-sm text-gray-700 font-medium mt-4">
                  Você pode baixar o recibo agora ou acessá-lo mais tarde na lista de recibos.
                </p>
              </>
            ) : (
              <>
                <p className="text-base">
                  Não foi possível processar seu pagamento. Por favor, tente novamente.
                </p>

                {merchantRef && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                    <p className="text-sm font-semibold text-red-800">
                      Referência: <span className="font-normal">{merchantRef}</span>
                    </p>
                    {amount && (
                      <p className="text-sm font-semibold text-red-800">
                        Valor: <span className="font-normal">{amount} CVE</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-3">
                  {hmacMessage && (
                    <p className="text-sm text-red-600">
                      ✗ Validação: {hmacMessage}
                    </p>
                  )}
                  {collectMessage && (
                    <p className="text-sm text-red-600">
                      ✗ Cobrança: {collectMessage}
                    </p>
                  )}
                </div>

                {debugInfo && (debugInfo.reference || debugInfo.fingerprint) && (
                  <details className="mt-4 text-xs text-gray-500">
                    <summary className="cursor-pointer font-medium">
                      Informações técnicas (debug)
                    </summary>
                    <div className="mt-2 bg-gray-100 p-2 rounded">
                      {debugInfo.reference && (
                        <p className="break-all">Ref: {debugInfo.reference}</p>
                      )}
                      {debugInfo.fingerprint && (
                        <p className="break-all">FP: {debugInfo.fingerprint}</p>
                      )}
                    </div>
                  </details>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-3 sm:gap-3 mt-6">
          {isSuccess && onDownloadRecibo ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isDownloading}
              >
                Fechar
              </Button>
              <Button
                type="button"
                onClick={onDownloadRecibo}
                disabled={isDownloading}
                className="flex-1 bg-[#002256] hover:bg-[#002256]/90 text-white"
              >
                {isDownloading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Baixando...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Baixar Recibo
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className={`w-full ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {isSuccess ? "Entendido" : "Tentar Novamente"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

