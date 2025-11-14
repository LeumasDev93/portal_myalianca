"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingContainer } from "@/components/ui/loading-container";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const CLIENT_ID = "ju3Rt5EEDc2yQNxOsgJVBZrOszZx-aRB";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processando pagamento...");

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("[PAYMENT CALLBACK] ========== INICIANDO PROCESSAMENTO DO CALLBACK ==========");
        console.log("[PAYMENT CALLBACK] URL completa:", typeof window !== 'undefined' ? window.location.href : 'N/A');
        
        // Captura todos os parâmetros da URL
        const statusCode = searchParams.get("status_code");
        const transactionId = searchParams.get("transaction_id");
        const fingerPrint = searchParams.get("finger_print");
        const messageParam = searchParams.get("message");
        const channelTransactionId = searchParams.get("channel_transaction_id");
        
        console.log("[PAYMENT CALLBACK] Parâmetros recebidos:");
        console.log("[PAYMENT CALLBACK]   status_code:", statusCode);
        console.log("[PAYMENT CALLBACK]   transaction_id:", transactionId);
        console.log("[PAYMENT CALLBACK]   finger_print:", fingerPrint ? fingerPrint.substring(0, 30) + '...' : null);
        console.log("[PAYMENT CALLBACK]   message:", messageParam);
        console.log("[PAYMENT CALLBACK]   channel_transaction_id:", channelTransactionId);
        
        // Verifica se temos os parâmetros obrigatórios
        if (!statusCode || !transactionId || !fingerPrint) {
          console.error("[PAYMENT CALLBACK] ❌ Parâmetros obrigatórios faltando");
          setStatus("error");
          setMessage("Parâmetros de pagamento inválidos");
          
          // Redireciona mesmo assim, mas preserva os parâmetros se existirem
          setTimeout(() => {
            const params = new URLSearchParams();
            params.set("menu", "recibo");
            // Preserva parâmetros se existirem
            if (statusCode) params.set("status_code", statusCode);
            if (transactionId) params.set("transaction_id", transactionId);
            if (fingerPrint) params.set("finger_print", fingerPrint);
            if (messageParam) params.set("message", messageParam);
            if (channelTransactionId) params.set("channel_transaction_id", channelTransactionId);
            router.replace(`/backoffice?${params.toString()}`);
          }, 2000);
          return;
        }
        
        // Prepara os dados do pagamento
        const paymentData = {
          statusCode,
          transactionId,
          fingerPrint,
          message: messageParam,
          channelTransactionId,
        };
        
        console.log("[PAYMENT CALLBACK] Dados preparados:", paymentData);
        
        // Salva no localStorage
        try {
          localStorage.setItem('sisp_payment_data', JSON.stringify(paymentData));
          console.log("[PAYMENT CALLBACK] ✅ Dados salvos no localStorage");
        } catch (error) {
          console.error("[PAYMENT CALLBACK] ❌ Erro ao salvar no localStorage:", error);
        }
        
        // Se status_code = 1 (sucesso), valida o HMAC
        if (statusCode === "1") {
          console.log("[PAYMENT CALLBACK] ✅ Status code = 1, validando HMAC...");
          setMessage("Validando transação...");
          
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
              console.log("[PAYMENT CALLBACK] ✅ Validação HMAC bem-sucedida!", data);
              setMessage("Pagamento validado com sucesso!");
            } else {
              console.error("[PAYMENT CALLBACK] ⚠️ Validação HMAC falhou:", data);
              setMessage("Pagamento processado, mas validação falhou");
            }
          } catch (error) {
            console.error("[PAYMENT CALLBACK] ❌ Erro ao validar HMAC:", error);
            setMessage("Pagamento processado, mas erro na validação");
          }
        }
        
        setStatus("success");
        setMessage(messageParam || "Pagamento processado com sucesso!");
        
        // Redireciona para o backoffice após um pequeno delay, PRESERVANDO os parâmetros
        setTimeout(() => {
          const params = new URLSearchParams();
          params.set("menu", "recibo");
          // PRESERVA todos os parâmetros do SISP
          params.set("status_code", statusCode);
          params.set("transaction_id", transactionId);
          params.set("finger_print", fingerPrint);
          if (messageParam) params.set("message", messageParam);
          if (channelTransactionId) params.set("channel_transaction_id", channelTransactionId);
          
          const redirectUrl = `/backoffice?${params.toString()}`;
          console.log("[PAYMENT CALLBACK] 🔄 Redirecionando para:", redirectUrl);
          router.replace(redirectUrl);
        }, 1500);
        
      } catch (error) {
        console.error("[PAYMENT CALLBACK] ❌ Erro ao processar callback:", error);
        setStatus("error");
        setMessage("Erro ao processar pagamento");
        
        // Redireciona mesmo em caso de erro, mas preserva parâmetros se existirem
        setTimeout(() => {
          const params = new URLSearchParams();
          params.set("menu", "recibo");
          // Tenta preservar parâmetros se existirem
          const statusCode = searchParams.get("status_code");
          const transactionId = searchParams.get("transaction_id");
          const fingerPrint = searchParams.get("finger_print");
          const messageParam = searchParams.get("message");
          const channelTransactionId = searchParams.get("channel_transaction_id");
          if (statusCode) params.set("status_code", statusCode);
          if (transactionId) params.set("transaction_id", transactionId);
          if (fingerPrint) params.set("finger_print", fingerPrint);
          if (messageParam) params.set("message", messageParam);
          if (channelTransactionId) params.set("channel_transaction_id", channelTransactionId);
          router.replace(`/backoffice?${params.toString()}`);
        }, 2000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {status === "processing" && "Processando Pagamento..."}
            {status === "success" && "✅ Pagamento Processado!"}
            {status === "error" && "❌ Erro no Pagamento"}
          </h2>
          <p className="text-gray-600">{message}</p>
          {status === "processing" && (
            <p className="text-sm text-gray-500">Aguarde, redirecionando...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

