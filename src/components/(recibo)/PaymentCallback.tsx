/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/components/ui/use-toast";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { processPaymentSISP } from "@/service/paymentService";
import { CircleAlert, CircleCheckBig, CircleX } from "lucide-react";

export interface PaymentCallbackProps {
  onViewRecibo?: (reference: string) => void;
}

export default function PaymentCallback({ onViewRecibo }: PaymentCallbackProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [serverStatus, setServerStatus] = useState<string | undefined>(sp.get("server_status") || undefined);
  const [serverMessage, setServerMessage] = useState<string | undefined>(sp.get("server_message") || undefined);
  const [collectStatus, setCollectStatus] = useState<string | undefined>(sp.get("collect_status") || undefined);
  const [collectMessage, setCollectMessage] = useState<string | undefined>(sp.get("collect_message") || undefined);
  const { profile} = useUserProfile();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>(profile?.user?.email || "");
  const { token } = useSessionCheckToken();
  const [downloading, setDownloading] = useState<boolean>(false);
  const [useSessionEmail, setUseSessionEmail] = useState<boolean>(!!profile?.user?.email);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [capturedRef, setCapturedRef] = useState<string | undefined>(undefined);
  const [capturedAmount, setCapturedAmount] = useState<number | undefined>(undefined);
  const [captureDone, setCaptureDone] = useState(false);

  const data = useMemo(() => {
    const getNum = (key: string) => {
      const v = sp.get(key);
      if (!v) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const d = {
      status_code: sp.get("status_code") || undefined,
      message: sp.get("message") || undefined,
      transaction_id: sp.get("transaction_id") || undefined,
      channel_transaction_id: sp.get("channel_transaction_id") || undefined,
      finger_print: sp.get("finger_print") || undefined,
      server_status: serverStatus,
      server_message: serverMessage,
      collect_status: collectStatus,
      collect_message: collectMessage,
      reciboRef: sp.get("reciboRef") || sp.get("merchantRef") || undefined,
      merchantRef: sp.get("merchantRef") || undefined,
      amount: getNum("amount"),
    };
    return d;
  }, [sp, serverStatus, serverMessage, collectStatus, collectMessage]);

  const normalizedStatus: "success" | "error" | "cancelled" | "pending" = (() => {
    const code = (data.status_code || '').toString();
    const lower = (data.message || '').toLowerCase();
    if (code === '1') return 'success';
    if (lower.includes('cancel') || lower.includes('cancelado') || lower.includes('cancelled')) return 'cancelled';
    if (code) return 'error';
    return 'pending';
  })();

  // Snapshot SISP params once (do NOT clean URL here; we will clean on explicit actions)
  useEffect(() => {
    if (captureDone) return;
    const hasSisp = sp.has("status_code") || sp.has("transaction_id") || sp.has("finger_print") || sp.has("merchantRef") || sp.has("reciboRef") || sp.has("amount") || sp.has("server_status") || sp.has("collect_status") || sp.has("message") || sp.has("channel_transaction_id");
    if (!hasSisp) return;

    const ref = sp.get("reciboRef") || sp.get("merchantRef") || undefined;
    const amtStr = sp.get("amount");
    const amt = amtStr ? Number(amtStr) : undefined;
    if (ref) {
      setCapturedRef(ref);
      try { localStorage.setItem("recibo_ref", encodeURIComponent(ref)); } catch {}
    }
    if (typeof amt === 'number' && !Number.isNaN(amt)) {
      setCapturedAmount(amt);
      try { localStorage.setItem("payment_amount", String(amt)); } catch {}
    }
    setCaptureDone(true);
  }, [sp, captureDone]);

  // Clean SISP/callback params from URL (keep only ?menu=callback)
  const cleanCallbackParams = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      const menu = url.searchParams.get('menu') || 'callback';
      const next = new URL(window.location.origin + url.pathname);
      if (menu) next.searchParams.set('menu', menu);
      window.history.replaceState({}, '', next.toString());
    } catch {}
  }, []);

  const displayAmount = useMemo(() => {
    if (typeof data.amount === "number") return data.amount;
    if (typeof capturedAmount === 'number') return capturedAmount;
    try {
      const s = localStorage.getItem("payment_amount");
      const n = s != null ? Number(s) : NaN;
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  }, [data.amount, capturedAmount]);

  const displayRef = useMemo(() => {
    if (data.reciboRef) return data.reciboRef as string;
    // prefer capturedRef if set, else merchantRef, else localStorage
    const refFromSp = data.reciboRef || data.merchantRef;
    if (refFromSp) return refFromSp as string;
    if (capturedRef) return capturedRef;
    try {
      const s = localStorage.getItem("recibo_ref");
      return s ? decodeURIComponent(s) : undefined;
    } catch {
      return undefined;
    }
  }, [data.reciboRef, data.merchantRef, capturedRef]);

  const validateHMAC = useCallback(async (transactionId: string, hmacFingerprint: string) => {
    const response = await fetch("/api/payment/validate-hmac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, hmacFingerprint }),
      cache: "no-store",
    });
    return await response.json();
  }, []);

  const callCollectAPI = useCallback(async (reciboRef: string, amount: number) => {
    const userId = profile?.user?.id;
    const response = await fetch("/api/payment/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reciboRef, amount, userId }),
      cache: "no-store",
    });
    return await response.json();
  }, [profile]);

  useEffect(() => {
    // Se o servidor já processou (parâmetros presentes), não refazer
    if (serverStatus || collectStatus) return;

    const statusCode = sp.get("status_code");
    const transactionId = sp.get("transaction_id");
    const fingerPrint = sp.get("finger_print");

    if (!statusCode || !transactionId) return;

    // Se sucesso, validar HMAC e depois coletar
    if (statusCode === "1" && fingerPrint) {
      validateHMAC(transactionId, fingerPrint)
        .then(async (hmacResult) => {
          if (hmacResult?.success || hmacResult?.validated) {
            setServerStatus("ok");
            setServerMessage("HMAC válido");

            // Buscar reciboRef e amount de múltiplas fontes
            let reciboRef: string | undefined = sp.get("reciboRef") || sp.get("merchantRef") || undefined;
            if (!reciboRef) {
              try {
                const stored = localStorage.getItem("recibo_ref");
                if (stored) reciboRef = decodeURIComponent(stored);
              } catch {}
            }
            let amount: number | undefined = undefined;
            const amountStr = sp.get("amount");
            if (amountStr) {
              const n = Number(amountStr);
              if (Number.isFinite(n)) amount = n;
            } else {
              try {
                const storedAmount = localStorage.getItem("payment_amount");
                if (storedAmount) {
                  const n = Number(storedAmount);
                  if (Number.isFinite(n)) amount = n;
                }
              } catch {}
            }

            if (reciboRef && typeof amount === "number") {
              const collectRes = await callCollectAPI(reciboRef, amount);
              const success = !!collectRes?.success;
              const msg = collectRes?.message || (success ? "Cobrança confirmada com sucesso" : "Erro ao processar cobrança");
              setCollectStatus(success ? "ok" : "error");
              setCollectMessage(msg);
            } else {
              setCollectStatus("error");
              setCollectMessage("Referência ou valor ausentes para cobrança");
            }
          } else {
            setServerStatus("error");
            setServerMessage("Falha na validação de segurança do pagamento");
          }
        })
        .catch(() => {
          setServerStatus("error");
          setServerMessage("Erro ao validar pagamento");
        })
        .finally(() => {
        });
    } else if (statusCode === "3" || (statusCode === "2" && (sp.get("message") || "").toLowerCase().includes("cancel"))) {
      // Cancelado
      setServerStatus("cancelled");
      setServerMessage(sp.get("message") || "Pagamento cancelado pelo cliente");
      
    } else if (statusCode === "2") {
      // Erro genérico
      setServerStatus("error");
      setServerMessage(sp.get("message") || "Pagamento rejeitado pelo gateway");
      
    }
  }, [sp, serverStatus, collectStatus, validateHMAC, callCollectAPI]);

  const handleSendEmail = async () => {
    const ref = displayRef;
    const amt = typeof displayAmount === 'number' ? displayAmount : undefined;
    if (!ref || typeof amt !== 'number') {
      toast({ title: "Dados insuficientes", description: "Referência ou valor ausente.", variant: "destructive" });
      return;
    }
    if (!email || !email.includes("@")) {
      toast({ title: "Email inválido", description: "Informe um email válido.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/payment/send-receipt-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reciboRef: ref, amount: amt, email }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && !payload?.success) {
        toast({ title: "Enviado", description: payload?.message || "Recibo enviado por email com sucesso.", variant: 'success' });
      } else {
        toast({ title: "Falha ao enviar", description: payload?.message || "Não foi possível enviar o recibo.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Erro ao enviar email.", variant: "destructive" });
    }
  };

  const goToRecibos = (action?: "view" | "download") => {
    const ref = displayRef;
    if (onViewRecibo && ref) {
      // Limpa URL antes de delegar a navegação
      cleanCallbackParams();
      onViewRecibo(ref);
      return;
    }
    const p = new URLSearchParams();
    p.set("menu", "recibo");
    if (ref) p.set("reference", ref);
    if (action) p.set("action", action);
    // Limpa URL antes de trocar de página
    cleanCallbackParams();
    router.push(`/backoffice?${p.toString()}`);
  };

  const handleDirectDownload = async () => {
    const invoiceNumber = displayRef;
    if (!invoiceNumber) {
      toast({ title: "Sem referência", description: "Referência do recibo ausente.", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Sessão inválida", description: "Token de sessão ausente.", variant: "destructive" });
      return;
    }
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${encodeURIComponent(invoiceNumber)}/print/receipt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Erro ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = new TextDecoder("utf-8").decode(uint8Array.slice(0, 4));
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
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Download iniciado", description: `Recibo ${invoiceNumber} baixado com sucesso!`, variant: 'success' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao baixar recibo";
      toast({ title: "Falha ao baixar", description: message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  // Reabre o fluxo SISP no próprio separador
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

  const handleRetryPayment = async () => {
    const ref = displayRef;
    const amt = typeof displayAmount === 'number' ? Math.abs(displayAmount) : undefined;
    if (!ref || typeof amt !== 'number') {
      toast({ title: 'Dados insuficientes', description: 'Referência ou valor ausente.', variant: 'destructive' });
      return;
    }
    // Guardar para o fluxo de retorno
    try {
      localStorage.setItem('recibo_ref', encodeURIComponent(ref));
      localStorage.setItem('payment_amount', String(amt));
    } catch {}

    setRetrying(true);
    try {
      // Limpa URL ao acionar uma ação
      cleanCallbackParams();
      const name = (profile as any)?.user?.nome || '';
      const email = (profile as any)?.user?.email || '';
      const phone = (profile as any)?.user?.telemovel || (profile as any)?.user?.telefone || '';
      const nif = (profile as any)?.user?.nif || '';
      const res = await processPaymentSISP(amt, name, email, phone, nif, ref, ref);
      openSISPInSamePage(res.html);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao iniciar pagamento';
      toast({ title: 'Erro ao iniciar pagamento', description: msg, variant: 'destructive' });
    } finally {
      setRetrying(false);
    }
  };

  const isCancelled = normalizedStatus === "cancelled";
  const isSuccess = normalizedStatus === "success";
  const isError = normalizedStatus === "error";

  return (
    <div className="flex flex-col gap-6">
      

      {/* Layout especial para cancelado */}
      {isCancelled ? (
        <div className="w-full flex justify-center mt-10">
          <div className="w-full max-w-[560px]">
            <Card className="shadow-md border rounded-xl">
              <CardHeader className="flex items-center justify-center">
                <CardTitle className="flex items-center justify-center gap-3">
                  <CircleAlert color="orange" strokeWidth={2} size={60}/>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-sm xl:text-base text-orange-300">
                 Pagamento cancelado
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Referência:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{displayRef || '-'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded ">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Valor:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{typeof displayAmount === 'number' ? formatCurrency(displayAmount as number) : '-'}</span>
                </div>
                <div className="flex flex-col md:flex-row gap-3 justify-center">
                  <Button className="bg-gray-200 hover:bg-gray-200/70 text-gray-800 cursor-pointer border border-gray-300" onClick={() => goToRecibos()}>Ver Recibos</Button>
                  <Button onClick={handleRetryPayment} className="bg-blue-950 hover:bg-blue-950/70 text-white cursor-pointer" disabled={retrying}>
                    {retrying ? 'Processando...' : 'Tentar novamente'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
      <div className="w-full flex justify-center mt-10">
      <div className="w-full max-w-[560px]">
      <Card className="shadow-md border rounded-xl">
        <CardHeader className="flex items-center justify-center">
          <CardTitle className="flex items-center justify-center gap-3">
            {isSuccess ? (
              <CircleCheckBig color="green" strokeWidth={2} size={60}/>
            ) : isError ? (
              <CircleX color="red" strokeWidth={2} size={60}/>
            ) : (
              <CircleAlert color="orange" strokeWidth={2} size={60}/>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm xl:text-base text-orange-300">
          {isSuccess ? <span className="text-green-600">Pagamento confirmado com sucesso</span> : isError ? <span className="text-red-500">Pagamento rejeitado</span> : <span className="text-orange-300">Processando...</span>}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Referência:</span>
            </div>
            <span className="font-semibold text-gray-900">{displayRef || "-"}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Valor:</span>
            </div>
            <span className="font-semibold text-gray-900">{typeof displayAmount === 'number' ? formatCurrency(displayAmount as number) : '-'}</span>
          </div>
          {isSuccess ? (
            <>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <Button className="bg-gray-200 hover:bg-gray-200/70 text-gray-900 border border-gray-300 cursor-pointer" onClick={() => goToRecibos()}>
                  Ver Recibos
                </Button>
                <Button className="bg-blue-950 hover:bg-blue-950/70 text-white cursor-pointer" onClick={handleDirectDownload} disabled={downloading}>
                  Baixar Recibo
                </Button>
               
                <Button
                  className="bg-blue-950 hover:bg-blue-950/70 text-white cursor-pointer"
                  onClick={() => setShowEmailForm(true)}
                  disabled={showEmailForm}
                >
                  Enviar por email
                </Button>
              </div>
              {showEmailForm && (
                <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="use-session-email" className="text-sm font-medium text-gray-700"> 
                      Usar email da sessão
                    </Label>
                    <Switch
                      id="use-session-email"
                      checked={useSessionEmail}
                      className="data-[state=checked]:bg-[#002256]"
                      onCheckedChange={(checked) => {
                        setUseSessionEmail(checked);
                        if (checked) {
                          setEmail(profile?.user?.email || '');
                        } else {
                          setEmail('');
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      className="w-full text-sm xl:text-base text-gray-700"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={useSessionEmail}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button className="bg-gray-200 hover:bg-gray-300/70 text-gray-800 border border-gray-300 cursor-pointer" onClick={() => setShowEmailForm(false)}>Cancelar</Button>
                      <Button
                        className="bg-blue-950 hover:bg-blue-950/70 text-white"
                        onClick={handleSendEmail}
                        disabled={!email || !email.includes('@')}
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-3 justify-center pt-2">
              <Button className="bg-gray-200 hover:bg-gray-200/70 text-gray-800 cursor-pointer border border-gray-300" onClick={() => goToRecibos()}>Ver Recibos</Button>
              <Button onClick={handleRetryPayment} className="bg-blue-950 hover:bg-blue-950/70 text-white cursor-pointer" disabled={retrying}>
                  {retrying ? "Processando..." : "Tentar novamente"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
      )}
    </div>
  );
}
