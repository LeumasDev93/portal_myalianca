/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";
import { formatCurrency, getStatusText, getStatusVariant } from "@/lib/utils";

interface SinistroDataDetails {
  claimNumber: number;
  contractNumber: number;
  occurenceDate: string;
  claimDate: "2025-04-15";
  clientName: "Testes1";
  status: "E";
  manager: "Deizimara Aleixo";
  insuredObjectName: "Seat Ibiza";
  insuredObjectDescription: "ST-41-RB";
  product: "Automóvel Individual";
}

type SinistroDetailPageProps = {
  id: string;
  onBack: () => void;
};
export function SinistroDetailPage({ id, onBack }: SinistroDetailPageProps) {
  const { token } = useSessionCheckToken();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sinistroDetails, setSinistroDetails] = useState<SinistroDataDetails[]>(
    []
  );
  console.log("Sinistro id:", id);

  useEffect(() => {
    if (!token) return;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/claim/${id}/info`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setSinistroDetails(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
  }, [token, id]);

  // console.log("Sinistro detalhes: ", sinistroDetails);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onBack} asChild>
            <Link href="/apolices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
            Detalhes da Sinistro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#002256] hover:bg-[#002256]/80">
            <Phone className="mr-2 h-4 w-4" />
            Solicitar Contato
          </Button>
        </div>
      </div>
      {sinistroDetails.map((sinistro, idx) => (
        <Card key={idx}>
          <CardHeader className="border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-[#002256]">
                  {sinistro.product} - {sinistro.insuredObjectDescription}
                  <Badge
                    className={`text-sm font-medium text-gray-600 py-1 px-2 rounded-md ${
                      sinistro.status === "E"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-green-100 border border-green-200 text-green-800"
                    }`}
                  >
                    {getStatusText(sinistro.status)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Sinistro #{sinistro.claimNumber} • Apólice #
                  {sinistro.contractNumber} • {sinistro.occurenceDate}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-semibold">
                    {formatCurrency(sinistro.claimNumber)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="detalhes" className="space-y-6">
              <TabsList>
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="riscos">Recibo</TabsTrigger>
                <TabsTrigger value="documentos">Sinistrados</TabsTrigger>
                <TabsTrigger value="atualizacoes">Riscos</TabsTrigger>
              </TabsList>

              <TabsContent value="riscos" className="space-y-6"></TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <Button className="bg-[#002256] hover:bg-[#002256]/80">
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documentos
              </Button>
            </div>
            <Button className="bg-[#002256] hover:bg-[#002256]/80">
              Acompanhar Status
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
