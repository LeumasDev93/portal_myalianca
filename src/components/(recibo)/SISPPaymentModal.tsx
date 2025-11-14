"use client";

import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaTimes } from "react-icons/fa";

type SISPPaymentModalProps = {
  html: string;
  isOpen: boolean;
  onClose: () => void;
};

export function SISPPaymentModal({
  html,
  isOpen,
  onClose,
}: SISPPaymentModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Log quando as props mudarem
  useEffect(() => {
    console.log("[SISP MODAL] Props atualizadas:", {
      isOpen,
      htmlLength: html?.length,
      htmlType: typeof html,
      htmlPreview: html?.substring(0, 100),
    });
  }, [isOpen, html]);

  useEffect(() => {
    if (isOpen && iframeRef.current && html) {
      console.log("[SISP MODAL] ========== INICIANDO CARREGAMENTO ==========");
      console.log("[SISP MODAL] Modal está aberto:", isOpen);
      console.log("[SISP MODAL] HTML recebido - length:", html.length);
      console.log("[SISP MODAL] HTML recebido - tipo:", typeof html);
      console.log("[SISP MODAL] HTML recebido - primeiros 300 chars:", html.substring(0, 300));
      console.log("[SISP MODAL] HTML recebido - últimos 100 chars:", html.substring(Math.max(0, html.length - 100)));
      
      const iframe = iframeRef.current;
      let blobUrl: string | null = null;
      
      // Limpa o src anterior se existir
      if (iframe.src && iframe.src.startsWith('blob:')) {
        URL.revokeObjectURL(iframe.src);
        iframe.src = 'about:blank'; // Limpa o iframe
      }
      
      // Processa o HTML (remove caracteres de escape se necessário)
      // Quando o HTML vem via JSON, o JavaScript já faz o parse automático,
      // mas pode haver casos onde os caracteres de escape ainda estão literais
      let processedHtml = html;
      
      // Verifica se há caracteres de escape literais (string JSON não parseada)
      // Exemplo: "\\r\\n" (4 caracteres) vs "\r\n" (2 caracteres já parseados)
      const hasEscapeChars = html.includes('\\r\\n') || (html.includes('\\n') && !html.includes('\n'));
      
      if (hasEscapeChars) {
        console.log("[SISP MODAL] ⚠️ Detectados caracteres de escape literais, processando...");
        processedHtml = html
          .replace(/\\r\\n/g, '\r\n')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'");
        console.log("[SISP MODAL] ✅ HTML processado (caracteres de escape removidos)");
      } else {
        console.log("[SISP MODAL] ✅ HTML já está processado corretamente");
      }
      
      // Verifica se o HTML parece válido (deve começar com <!DOCTYPE ou <html)
      const trimmedHtml = processedHtml.trim();
      if (!trimmedHtml.startsWith('<!DOCTYPE') && !trimmedHtml.startsWith('<html')) {
        console.error("[SISP MODAL] ❌ HTML mal formatado! Primeiros 200 caracteres:", trimmedHtml.substring(0, 200));
        console.error("[SISP MODAL] ❌ Primeiro char code:", trimmedHtml.charCodeAt(0));
        return;
      } else {
        console.log("[SISP MODAL] ✅ HTML válido detectado (começa com <!DOCTYPE ou <html)");
      }
      
      // Log do HTML processado (primeiros 500 caracteres)
      console.log("[SISP MODAL] HTML processado - length:", processedHtml.length);
      console.log("[SISP MODAL] HTML processado preview (primeiros 500 chars):", processedHtml.substring(0, 500));
      console.log("[SISP MODAL] HTML processado preview (últimos 200 chars):", processedHtml.substring(Math.max(0, processedHtml.length - 200)));
      
      // Adiciona listener para verificar quando o iframe carregar
      const handleLoad = () => {
        console.log("[SISP MODAL] ========== IFRAME LOAD EVENT ==========");
        console.log("[SISP MODAL] ✅ Iframe carregado com sucesso");
        console.log("[SISP MODAL] Iframe src:", iframe.src);
        console.log("[SISP MODAL] Iframe contentWindow:", iframe.contentWindow ? "disponível" : "não disponível");
        
        // Verifica se o formulário existe
        try {
          if (iframe.contentDocument) {
            console.log("[SISP MODAL] ✅ contentDocument acessível");
            const form = iframe.contentDocument.querySelector('form[name="formSubmit"]') as HTMLFormElement;
            if (form) {
              console.log("[SISP MODAL] ✅ Formulário encontrado no iframe");
              console.log("[SISP MODAL] Form action:", form.action);
              console.log("[SISP MODAL] Form method:", form.method);
              // O script window.onload no HTML já deve fazer o submit automaticamente
            } else {
              console.warn("[SISP MODAL] ⚠️ Formulário não encontrado no iframe");
              console.warn("[SISP MODAL] Tentando encontrar qualquer formulário...");
              const anyForm = iframe.contentDocument.querySelector('form');
              if (anyForm) {
                console.warn("[SISP MODAL] Formulário encontrado mas sem name='formSubmit':", anyForm);
              } else {
                console.warn("[SISP MODAL] Nenhum formulário encontrado no iframe");
              }
            }
          } else {
            console.warn("[SISP MODAL] ⚠️ contentDocument não disponível");
          }
        } catch (e) {
          console.warn("[SISP MODAL] Não foi possível acessar o conteúdo do iframe (CORS):", e);
          if (e instanceof Error) {
            console.warn("[SISP MODAL] Erro CORS message:", e.message);
          }
        }
      };
      
      const handleError = (event: ErrorEvent) => {
        console.error("[SISP MODAL] ========== IFRAME ERROR EVENT ==========");
        console.error("[SISP MODAL] ❌ Erro ao carregar iframe");
        console.error("[SISP MODAL] Erro event:", event);
        console.error("[SISP MODAL] Erro message:", event.message);
        console.error("[SISP MODAL] Iframe src:", iframe.src);
      };
      
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
      
      // Usa blob URL (mais confiável para formulários que fazem POST)
      try {
        console.log("[SISP MODAL] Criando Blob com HTML processado...");
        const blob = new Blob([processedHtml], { type: "text/html;charset=utf-8" });
        blobUrl = URL.createObjectURL(blob);
        
        console.log("[SISP MODAL] ✅ Blob criado com sucesso");
        console.log("[SISP MODAL] ✅ Blob URL criado:", blobUrl);
        console.log("[SISP MODAL] Tamanho do blob:", blob.size, "bytes");
        console.log("[SISP MODAL] Tipo do blob:", blob.type);
        
        // Carrega o HTML no iframe imediatamente
        if (iframe && blobUrl) {
          console.log("[SISP MODAL] Definindo src do iframe...");
          iframe.src = blobUrl;
          console.log("[SISP MODAL] ✅ HTML carregado no iframe (src definido)");
          console.log("[SISP MODAL] Iframe src atual:", iframe.src);
        } else {
          console.error("[SISP MODAL] ❌ Iframe ou blobUrl não disponível");
          console.error("[SISP MODAL] Iframe:", iframe);
          console.error("[SISP MODAL] BlobUrl:", blobUrl);
        }
      } catch (error) {
        console.error("[SISP MODAL] ❌ Erro ao criar blob:", error);
        if (error instanceof Error) {
          console.error("[SISP MODAL] Erro message:", error.message);
          console.error("[SISP MODAL] Erro stack:", error.stack);
        }
      }
      
      // Limpa o blob URL quando o componente for desmontado ou fechado
      return () => {
        if (iframe) {
          iframe.removeEventListener('load', handleLoad);
          iframe.removeEventListener('error', handleError);
          if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
          }
        }
      };
    } else if (isOpen && !html) {
      console.warn("[SISP MODAL] ⚠️ Modal aberto mas HTML não disponível");
    }
  }, [isOpen, html]);

  // Escuta mensagens do iframe (para comunicação com o SISP)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verifica se a mensagem é do SISP
      if (event.origin.includes("pay.dev.aliancaseguros.cv") || 
          event.origin.includes("aliancaseguros.cv")) {
        console.log("[SISP MODAL] Mensagem recebida:", event.data);
        
        // Se o pagamento foi concluído ou cancelado, pode fechar o modal
        if (event.data?.type === "payment_completed" || 
            event.data?.type === "payment_cancelled") {
          // Não fecha automaticamente, deixa o callback do SISP lidar com isso
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Pagamento SISP</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-100">
            <div className="text-[#002256] flex items-center">
              <h2 className="text-lg font-semibold">
                Pagamento SISP
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Fechar"
            >
              <FaTimes className="size-5" />
            </button>
          </div>

          {/* Corpo com iframe */}
          <div className="flex-1 relative overflow-hidden bg-gray-50">
            <iframe
              ref={iframeRef}
              title="Pagamento SISP"
              className="w-full h-full border-0"
              allow="payment"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

