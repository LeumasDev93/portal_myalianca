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
import {
  formatCurrency,
  formatDate,
  getSinistroStatusText,
  getStatusSinistrosColors,
} from "@/lib/utils";
import {
  FaAddressCard,
  FaDollarSign,
  FaMobile,
  FaRegCalendar,
  FaTriangleExclamation,
  FaUser,
} from "react-icons/fa6";
import { Separator } from "@radix-ui/react-separator";
import { MdCarCrash } from "react-icons/md";
import { LoadingScreen } from "@/components/ui/loading-screen";

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

interface Coberturasdatas {
  code: string;
  name: string;
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
  const [sinistroCoberturas, setSinistroCoberturas] = useState<
    Coberturasdatas[]
  >([]);
  console.log("Sinistro id:", id);

  useEffect(() => {
    if (!token) return;

    const fetchSinistroDetails = async () => {
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

    fetchSinistroDetails();
  }, [token, id]);

  useEffect(() => {
    if (!token) return;

    const fetchSinistroCoberturas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/claim/${id}/risks`,
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
        setSinistroCoberturas(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSinistroCoberturas();
  }, [token, id]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
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
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : sinistroDetails.length === 0 ? (
        <LoadingScreen />
      ) : (
        <>
          {sinistroDetails.map((sinistro, idx) => (
            <Card key={idx}>
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <div className="bg-[#002256] p-2 sm:p-3  rounded-full text-white">
                    <FaTriangleExclamation className="size-4 sm:size-5 xl:size-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="flex items-center gap-2 text-company-blue-600">
                      {sinistro.insuredObjectName}
                    </CardTitle>
                    <CardDescription>
                      Apólice #{sinistro.contractNumber}
                    </CardDescription>
                  </div>
                  <div className="hidden sm:flex flex-col ">
                    <Badge
                      className={`${getStatusSinistrosColors(
                        sinistro.status
                      )} px-2 py-1 text-xs xl:text-sm font-medium `}
                    >
                      {getSinistroStatusText(sinistro.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="detalhes" className="space-y-6 bg-white">
                  <TabsList className="flex justify-start sm:space-x-2 space-x-0.5 bg-whit">
                    <TabsTrigger
                      className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                      value="detalhes"
                    >
                      Detalhes
                    </TabsTrigger>
                    <TabsTrigger
                      className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                      value="recibo"
                    >
                      Recibo
                    </TabsTrigger>
                    <TabsTrigger
                      className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                      value="sinistrados"
                    >
                      Sinistrados
                    </TabsTrigger>
                    <TabsTrigger
                      className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                      value="riscos"
                    >
                      Riscos
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="detalhes"
                    className="bg-white rounded-lg px-4 xl:p-6"
                  >
                    <div>
                      <div className="flex flex-col gap-6 py-4 xl:py-6">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                              Data da Ocorrência
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                              {formatDate(sinistro.occurenceDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaTriangleExclamation className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                              Tipo de Sinistro
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                              {sinistro.product}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaUser className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                              Tomador se Seguros
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                              {sinistro.clientName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="recibo"
                    className="bg-white rounded-lg px-4 xl:p-6"
                  >
                    <div>Sem dados no memento!!</div>
                  </TabsContent>
                  <TabsContent
                    value="sinistrados"
                    className="bg-white rounded-lg px-4 xl:p-6"
                  >
                    <div>
                      <div className="flex flex-col gap-6 py-4 xl:py-6">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaTriangleExclamation className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                              Nome
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                              {sinistro.insuredObjectName}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <MdCarCrash className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                              Identificação
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                              {sinistro.insuredObjectDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="riscos"
                    className="bg-white rounded-lg px-4 xl:p-6"
                  >
                    <div>
                      <h3 className="text-lg text-[#002855] font-semibold uppercase mb-2">
                        Coberturas
                      </h3>
                      {sinistroCoberturas.map((cobertura) => (
                        <div key={cobertura.code} className="flex flex-col ">
                          <div className="flex bg-gray-100 px-4 py-2 shadow-2xl border-b-2 border-gray-300">
                            <h2 className="text-xs sm:text-sm xl:text-[17px] text-[#3d4042] font-semibold">
                              {cobertura.name}
                            </h2>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
