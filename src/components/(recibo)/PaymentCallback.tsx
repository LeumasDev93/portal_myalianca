/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoTime } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/components/ui/use-toast";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function getStatusBadge(statusCode?: string, message?: string) {
  const lower = (message || "").toLowerCase();
  const isCancelled = statusCode === "3" || (statusCode === "2" && (lower.includes("cancel") || lower.includes("cancelado") || lower.includes("cancelled")));
  if (statusCode === "1") {
    return (
      <Badge className="bg-green-100 text-green-700 border border-green-300 gap-1">
        <IoCheckmarkCircle className="text-green-600" />
        Sucesso
      </Badge>
    );
  }
  if (isCancelled) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 gap-1">
        <IoTime className="text-yellow-700" />
        Cancelado
      </Badge>
    );
  }
  if (statusCode) {
    return (
      <Badge className="bg-red-100 text-red-700 border border-red-300 gap-1">
        <IoCloseCircle className="text-red-600" />
        Erro
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <IoTime />
      Pendente
    </Badge>
  );
}

export default function PaymentCallback() {
  const router = useRouter();
  const sp = useSearchParams();
  const [serverStatus, setServerStatus] = useState<string | undefined>(sp.get("server_status") || undefined);
  const [serverMessage, setServerMessage] = useState<string | undefined>(sp.get("server_message") || undefined);
  const [collectStatus, setCollectStatus] = useState<string | undefined>(sp.get("collect_status") || undefined);
  const [collectMessage, setCollectMessage] = useState<string | undefined>(sp.get("collect_message") || undefined);
  const [processingPhase, setProcessingPhase] = useState<"idle" | "validating" | "collecting" | "done">("idle");
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>(profile?.user?.email || "");
  const { token } = useSessionCheckToken();
  const [downloading, setDownloading] = useState<boolean>(false);
  const [useSessionEmail, setUseSessionEmail] = useState<boolean>(!!profile?.user?.email);

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

  const statusBadge = getStatusBadge(data.status_code, data.message);
  const normalizedStatus: "success" | "cancelled" | "error" | "pending" = (() => {
    const lower = (data.message || "").toLowerCase();
    const isCancelled = data.status_code === "3" || (data.status_code === "2" && (lower.includes("cancel") || lower.includes("cancelado") || lower.includes("cancelled")));
    if (data.status_code === "1") return "success";
    if (isCancelled) return "cancelled";
    if (data.status_code) return "error";
    return "pending";
  })();

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
    const response = await fetch("/api/payment/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reciboRef, amount }),
      cache: "no-store",
    });
    return await response.json();
  }, []);

  useEffect(() => {
    // Se o servidor já processou (parâmetros presentes), não refazer
    if (serverStatus || collectStatus) return;

    const statusCode = sp.get("status_code");
    const transactionId = sp.get("transaction_id");
    const fingerPrint = sp.get("finger_print");

    if (!statusCode || !transactionId) return;

    // Se sucesso, validar HMAC e depois coletar
    if (statusCode === "1" && fingerPrint) {
      setProcessingPhase("validating");
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
              setProcessingPhase("collecting");
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
          setProcessingPhase("done");
        });
    } else if (statusCode === "3" || (statusCode === "2" && (sp.get("message") || "").toLowerCase().includes("cancel"))) {
      // Cancelado
      setServerStatus("cancelled");
      setServerMessage(sp.get("message") || "Pagamento cancelado pelo cliente");
      setProcessingPhase("done");
    } else if (statusCode === "2") {
      // Erro genérico
      setServerStatus("error");
      setServerMessage(sp.get("message") || "Pagamento rejeitado pelo gateway");
      setProcessingPhase("done");
    }
  }, [sp, serverStatus, collectStatus, validateHMAC, callCollectAPI]);

  const handleSendEmail = async () => {
    if (!data.reciboRef || typeof data.amount !== "number") {
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
        body: JSON.stringify({ reciboRef: data.reciboRef, amount: data.amount, email }),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.success) {
        toast({ title: "Enviado", description: payload?.message || "Recibo enviado por email com sucesso." });
      } else {
        toast({ title: "Falha ao enviar", description: payload?.message || "Não foi possível enviar o recibo.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro", description: "Erro ao enviar email.", variant: "destructive" });
    }
  };

  const goToRecibos = (action?: "view" | "download") => {
    const p = new URLSearchParams();
    p.set("menu", "recibo");
    if (data.reciboRef) p.set("reference", data.reciboRef);
    if (action) p.set("action", action);
    router.push(`/backoffice?${p.toString()}`);
  };

  const handleDirectDownload = async () => {
    const invoiceNumber = data.reciboRef || data.merchantRef;
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
      toast({ title: "Download iniciado", description: `Recibo ${invoiceNumber} baixado com sucesso!` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao baixar recibo";
      toast({ title: "Falha no download", description: message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const statusText =
    normalizedStatus === "success" ? "Pagamento confirmado com sucesso" :
    normalizedStatus === "cancelled" ? "Pagamento cancelado" :
    normalizedStatus === "error" ? "Pagamento rejeitado" : "Processando...";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusBadge}
          <h2 className="text-lg md:text-xl font-semibold">Resultado do Pagamento</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push("/backoffice?menu=recibo")} className="gap-2">
            <IoArrowBack />
            Ver Recibos
          </Button>
        </div>
      </div>

      {/* Cabeçalho de mensagem principal com ícone compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusBadge}
          <span className="text-base md:text-lg font-medium">{statusText}</span>
        </div>
      </div>

      {/* Layout especial quando cancelado: apenas ícone grande e ações */}
      {normalizedStatus === "cancelled" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <IoTime className="text-yellow-600 w-6 h-6" />
              Pagamento cancelado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center gap-2">
              <IoTime className="text-yellow-600 w-16 h-16" />
              <p className="text-sm text-muted-foreground">
                {data.message || "O pagamento foi cancelado pelo utilizador."}
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button variant="secondary" onClick={() => router.push("/backoffice?menu=recibo")}>
                Ir para Recibos
              </Button>
              <Button onClick={() => router.push("/backoffice?menu=recibo")}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="font-semibold">
              {typeof data.amount === "number" ? formatCurrency(data.amount) : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Referência do Recibo</span>
            <span className="font-medium">{data.reciboRef || "-"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="use-session-email" className="text-xs sm:text-sm font-medium text-gray-700">
                  Usar email da sessão
                </Label>
                <Switch
                  id="use-session-email"
                  checked={useSessionEmail}
                  className="data-[state=checked]:bg-[#002256] focus-visible:ring-[#002256]"
                  onCheckedChange={(checked) => {
                    setUseSessionEmail(checked);
                    if (checked) {
                      setEmail(profile?.user?.email || "");
                    } else {
                      setEmail("");
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={useSessionEmail}
                />
                <Button
                  className="bg-[#002256] hover:bg-[#002256]/90"
                  onClick={handleSendEmail}
                  disabled={!email || !email.includes("@")}
                >
                  Enviar por email
                </Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleDirectDownload} disabled={downloading}>
                Baixar recibo
              </Button>
              <Button onClick={() => goToRecibos("view")}>
                Ver recibo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}


