"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  // Captura os parâmetros da URL
  const statusCode = searchParams.get("status_code");
  const message = searchParams.get("message");
  const transactionId = searchParams.get("transaction_id");
  const channelTransactionId = searchParams.get("channel_transaction_id");
  const fingerPrint = searchParams.get("finger_print");

  useEffect(() => {
    console.log("[PAYMENT RESULT] ========== PÁGINA DE RESULTADO DO PAGAMENTO ==========");
    console.log("[PAYMENT RESULT] status_code:", statusCode);
    console.log("[PAYMENT RESULT] message:", message);
    console.log("[PAYMENT RESULT] transaction_id:", transactionId);
    console.log("[PAYMENT RESULT] channel_transaction_id:", channelTransactionId);
    console.log("[PAYMENT RESULT] finger_print:", fingerPrint);

    // Processa o resultado do pagamento
    if (statusCode && transactionId) {
      processPaymentResult();
    } else {
      setIsProcessing(false);
      toast({
        title: "Erro",
        description: "Parâmetros de pagamento não encontrados",
        variant: "destructive",
      });
    }
  }, [statusCode, transactionId]);

  const processPaymentResult = async () => {
    try {
      setIsProcessing(true);

      // Prepara os dados do pagamento
      const paymentData = {
        status_code: statusCode,
        message: message,
        transaction_id: transactionId,
        channel_transaction_id: channelTransactionId,
        finger_print: fingerPrint,
      };

      console.log("[PAYMENT RESULT] Dados do pagamento capturados:", paymentData);

      // Salva no localStorage (persiste até limpeza manual)
      try {
        localStorage.setItem('sisp_payment_data', JSON.stringify({
          statusCode,
          transactionId,
          fingerPrint,
          message,
          channelTransactionId,
        }));
        console.log("[PAYMENT RESULT] ✅ Dados salvos no localStorage");
      } catch (error) {
        console.error("[PAYMENT RESULT] ❌ Erro ao salvar no localStorage:", error);
      }

      // Se status_code = 1 (sucesso), valida o HMAC
      if (statusCode === "1" && transactionId && fingerPrint) {
        console.log("[PAYMENT RESULT] ✅ Status code = 1, validando HMAC...");
        try {
          const response = await fetch("/api/payment/validate-hmac", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactionId,
              hmacFingerprint: fingerPrint,
            }),
          });

          const data = await response.json();
          
          if (response.ok && data.success) {
            console.log("[PAYMENT RESULT] ✅ Validação HMAC bem-sucedida!", data);
          } else {
            console.error("[PAYMENT RESULT] ⚠️ Validação HMAC falhou:", data);
          }
        } catch (error) {
          console.error("[PAYMENT RESULT] ❌ Erro ao validar HMAC:", error);
        }
      }

      // Aqui você pode fazer uma chamada à API para salvar/processar o resultado
      // Por exemplo, chamar uma API route para processar o pagamento
      try {
        const response = await fetch("/api/payment/process-result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("[PAYMENT RESULT] Resultado processado pela API:", result);
        } else {
          console.warn("[PAYMENT RESULT] API retornou erro, mas continuando...");
        }
      } catch (apiError) {
        console.warn("[PAYMENT RESULT] Erro ao chamar API (continuando mesmo assim):", apiError);
        // Continua mesmo se a API falhar
      }

      setIsProcessing(false);

      // Mostra toast baseado no status
      // 1 - Sucesso, 2 - Cancelado, 3 - Erro
      if (statusCode === "1") {
        toast({
          title: "✅ Pagamento confirmado!",
          description: message || "Transação processada com sucesso",
          duration: 5000,
        });
      } else if (statusCode === "2") {
        toast({
          title: "⚠️ Pagamento cancelado",
          description: message || "A transação foi cancelada",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Pagamento falhou",
          description: message || "Erro ao processar pagamento",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("[PAYMENT RESULT] Erro ao processar resultado:", error);
      setIsProcessing(false);
      toast({
        title: "Erro",
        description: "Erro ao processar resultado do pagamento",
        variant: "destructive",
      });
    }
  };

  const handleBackToRecibos = () => {
    // Preserva todos os parâmetros do SISP ao redirecionar
    const params = new URLSearchParams();
    params.set("menu", "recibo");
    // PRESERVA todos os parâmetros do SISP
    if (statusCode) params.set("status_code", statusCode);
    if (transactionId) params.set("transaction_id", transactionId);
    if (fingerPrint) params.set("finger_print", fingerPrint);
    if (message) params.set("message", message);
    if (channelTransactionId) params.set("channel_transaction_id", channelTransactionId);
    
    router.push(`/backoffice?${params.toString()}`);
  };

  // 1 - Sucesso, 2 - Cancelado, 3 - Erro
  const isSuccess = statusCode === "1";
  const isCancelled = statusCode === "2";
  const isError = statusCode === "3";
  
  const getStatusInfo = () => {
    if (isSuccess) {
      return {
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        title: "Pagamento Confirmado",
        color: "text-green-500",
        bgColor: "bg-green-50",
      };
    } else if (isCancelled) {
      return {
        icon: <X className="h-6 w-6 text-yellow-500" />,
        title: "Pagamento Cancelado",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    } else {
      return {
        icon: <XCircle className="h-6 w-6 text-red-500" />,
        title: "Pagamento Falhou",
        color: "text-red-500",
        bgColor: "bg-red-50",
      };
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                Processando pagamento...
              </>
            ) : (
              <>
                {statusInfo.icon}
                {statusInfo.title}
              </>
            )}
          </CardTitle>
          <CardDescription>
            Resultado da transação de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aguarde enquanto processamos o resultado do pagamento...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={statusInfo.color + " font-semibold"}>
                    {message || (isSuccess ? "Sucesso" : isCancelled ? "Cancelado" : "Erro")}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Código de Status:</span>
                  <span className="text-gray-900">
                    {statusCode === "1" ? "1 - Sucesso" : statusCode === "2" ? "2 - Cancelado" : statusCode === "3" ? "3 - Erro" : statusCode}
                  </span>
                </div>

                {transactionId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Transaction ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{transactionId}</span>
                  </div>
                )}

                {channelTransactionId && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Channel Transaction ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{channelTransactionId}</span>
                  </div>
                )}


                {fingerPrint && (
                  <div className="flex justify-between items-start p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-700">Fingerprint:</span>
                    <span className="text-gray-900 font-mono text-xs break-all text-right max-w-[60%]">
                      {fingerPrint}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleBackToRecibos}
                  className="w-full"
                  variant={isSuccess ? "default" : "outline"}
                >
                  Voltar para Recibos
                </Button>
              </div>
              
              {isCancelled && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> O pagamento foi cancelado. Você pode tentar novamente quando desejar.
                  </p>
                </div>
              )}
              
              {isError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Atenção:</strong> Ocorreu um erro ao processar o pagamento. Por favor, tente novamente ou entre em contato com o suporte.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

