/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ArrowLeft, Phone, Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";
import { getSinistroStatusText, getStatusSinistrosColors } from "@/lib/utils";
import {
  FaAddressCard,
  FaDollarSign,
  FaMobile,
  FaRegCalendar,
  FaTriangleExclamation,
  FaUser,
} from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import { Separator } from "@radix-ui/react-separator";
import { MdCarCrash } from "react-icons/md";
import { LoadingContainer } from "@/components/ui/loading-container";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  formatCurrency,
  formatDate,
  getStatusReciverTexts,
  getStatusReciverColors,
} from "@/lib/utils";
import { IoReceiptSharp } from "react-icons/io5";

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

interface CompensationData {
  id?: string | number;
  number?: string | number;
  description?: string;
  value?: number;
  status?: string | number;
  date?: string;
  reference?: string;
  entityName?: string;
  type?: string;
  issueDate?: string;
}

type SinistroDetailPageProps = {
  id: string;
  onBack: () => void;
};
export default function SinistroDetailPage({
  id,
  onBack,
}: SinistroDetailPageProps) {
  const { token } = useSessionCheckToken();
  const { profile } = useUserProfile();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sinistroDetails, setSinistroDetails] = useState<SinistroDataDetails[]>(
    []
  );
  const [sinistroCoberturas, setSinistroCoberturas] = useState<
    Coberturasdatas[]
  >([]);
  const [isLoadingRecibos, setIsLoadingRecibos] = useState<boolean>(false);
  const [errorRecibos, setErrorRecibos] = useState<string | null>(null);
  const [compensations, setCompensations] = useState<CompensationData[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  console.log("Sinistro id:", id);

  const handleDownload = async (refOrNumber: string) => {
    if (!token || !refOrNumber) return;
    setLoadingStates((prev) => ({ ...prev, [refOrNumber]: true }));
    try {
      const res = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${refOrNumber}/print/receipt`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!res.ok) {
        throw new Error(
          `Erro ao baixar recibo: ${res.status} ${res.statusText}`
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${refOrNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [refOrNumber]: false }));
    }
  };

  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Buscar detalhes do sinistro
        const detailsRes = await fetch(
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

        if (!detailsRes.ok) {
          throw new Error(
            `Erro ao buscar detalhes: ${detailsRes.status} ${detailsRes.statusText}`
          );
        }

        const detailsData = await detailsRes.json();
        setSinistroDetails(
          Array.isArray(detailsData) ? detailsData : [detailsData]
        );

        // 2. Coberturas
        try {
          const coberturasRes = await fetch(
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

          if (coberturasRes.ok) {
            const coberturasData = await coberturasRes.json();
            if (coberturasData && coberturasData.length !== 0) {
              setSinistroCoberturas(
                Array.isArray(coberturasData)
                  ? coberturasData
                  : [coberturasData]
              );
            }
          }
        } catch (cobError) {
          console.error("Erro ao buscar coberturas:", cobError);
        }

        // 3. Compensações (usadas no TAB Recibo)
        try {
          setIsLoadingRecibos(true);
          setErrorRecibos(null);
          const compRes = await fetch(
            `/api/anywhere/api/v1/private/mobile/claim/${id}/compensations`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (compRes.ok) {
            const compData = await compRes.json();
            setCompensations(Array.isArray(compData) ? compData : [compData]);
          }
        } catch (compError) {
          console.error("Erro ao buscar compensações:", compError);
          setErrorRecibos("Erro ao carregar recibos.");
        } finally {
          setIsLoadingRecibos(false);
        }
      } catch (detailsError) {
        console.error("Erro ao buscar detalhes do sinistro:", detailsError);
        setError(
          "Erro ao carregar detalhes do sinistro. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id, profile?.user?.nif]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
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
        {/* <div className="flex items-center gap-2">
          <Button className="bg-[#002256] hover:bg-[#002256]/80">
            <Phone className="mr-2 h-4 w-4" />
            Solicitar Contato
          </Button>
        </div> */}
      </div>
      {isLoading ? (
        <LoadingContainer
          fullHeight={true}
          message="CARREGANDO DETALHES DO SINISTRO..."
        />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : sinistroDetails.length === 0 ? (
        <LoadingContainer message="CARREGANDO DETALHES..." />
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
                            <h3 className="text-sm font-medium text-[#002256]">
                              Data da Ocorrência
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-[#002256]">
                              {formatDate(sinistro.occurenceDate)}
                            </h3>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaTriangleExclamation className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <h3 className="text-sm font-medium text-[#002256]">
                              Tipo de Sinistro
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-[#002256]">
                              {sinistro.product}
                            </h3>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-gray-200  p-2 rounded-full ">
                              <FaUser className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <h3 className="text-sm font-medium text-[#002256]">
                              Tomador se Seguros
                            </h3>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <h3 className="text-sm font-medium text-[#002256]">
                              {sinistro.clientName}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="recibo">
                    <div className="bg-gray-100 rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                      {isLoadingRecibos ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002256]"></div>
                          <span className="mt-2 text-sm text-[#002256]">
                            Carregando Recibos...
                          </span>
                        </div>
                      ) : errorRecibos ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-red-100 p-2 rounded-full">
                              <FaTriangleExclamation className="size-2 sm:size-4 xl:size-6 text-red-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-red-600">
                                Erro ao carregar Recibos
                              </span>
                              <span className="text-sm text-red-500">
                                {errorRecibos}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : compensations.length === 0 ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-200 p-2 rounded-full">
                              <FaTriangleExclamation className="size-2 sm:size-4 xl:size-6 text-[#002256]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-[#002256]">
                                Nenhuma recibo encontrada
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-100 rounded-xl p-3 md:p-4 gap-3 md:gap-4">
                          {compensations.map((comp, idx) => {
                            const reference = (comp.reference ||
                              (comp as any).reference ||
                              comp.number ||
                              String(idx)) as string;
                            const loading = !!loadingStates[reference];
                            return (
                              <div key={reference} className="flex flex-col">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-3 md:gap-0">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-gray-200 p-2 rounded-full">
                                      <IoReceiptSharp className="size-4 md:size-6 xl:size-8 text-[#002256]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium underline text-[#002256] text-sm md:text-base">
                                        Recibo Nº {reference}
                                      </span>
                                      {typeof comp.value === "number" && (
                                        <span className="text-xs md:text-sm text-gray-400">
                                          Valor do Prêmio:{" "}
                                          {formatCurrency(comp.value)}
                                        </span>
                                      )}
                                      <span className="text-xs md:text-sm text-gray-400">
                                        Tipo:{" "}
                                        {(() => {
                                          const t = comp.type ?? comp.status;
                                          const map: Record<string, string> = {
                                            I: "Indemnização",
                                            R: "Reembolso",
                                            P: "Pensão",
                                          };
                                          return (
                                            map[String(t)] || String(t || "-")
                                          );
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="sinistrados">
                    <div className=" bg-gray-100 rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex flex-col gap-6 py-4 xl:py-6">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gray-200  p-2 rounded-full ">
                                <FaTriangleExclamation className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                              </div>
                              <h3 className="text-sm font-medium text-[#002256]">
                                Nome
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-[#002256]">
                                {sinistro.insuredObjectName}
                              </h3>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-gray-200  p-2 rounded-full ">
                                <MdCarCrash className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                              </div>
                              <h3 className="text-sm font-medium text-[#002256]">
                                Identificação
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-[#002256]">
                                {sinistro.insuredObjectDescription}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="riscos">
                    <div className=" bg-gray-100 rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="text-lg text-[#002855] font-semibold uppercase mb-2">
                          Coberturas
                        </h3>
                        {sinistroCoberturas.map((cobertura) => (
                          <div key={cobertura.code} className="flex flex-col ">
                            <div className="flex  px-4 py-2">
                              <h3 className="text-sm font-medium text-[#002256]">
                                {cobertura.name}
                              </h3>
                            </div>
                          </div>
                        ))}
                      </div>
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
