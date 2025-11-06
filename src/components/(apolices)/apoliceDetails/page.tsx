/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";
import { PiExportLight } from "react-icons/pi";
import {
  formatCurrency,
  formatDate,
  getStatusApolicesColors,
  getStatusReciverTexts,
  getApolicesStatusText,
} from "@/lib/utils";
import { IoReceiptSharp, IoShieldCheckmarkSharp } from "react-icons/io5";
import {
  FaAddressCard,
  FaCheck,
  FaDollarSign,
  FaEye,
  FaMobile,
  FaRegCalendar,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import {
  ApoliceDataDetails,
  InsurancePolicy,
  SinistroData,
} from "@/types/typesData";
import { FaTriangleExclamation } from "react-icons/fa6";
import { LoadingContainer } from "@/components/ui/loading-container";

type ApoliceDetailPageProps = {
  id: string;
  contractNumber: string;
  onBack: () => void;
  onSelectDetail: (claimNumber: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

export default function ApoliceDetailPage({
  id,
  contractNumber,
  onBack,
  onSelectDetail,
}: ApoliceDetailPageProps) {
  const { token } = useSessionCheckToken();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apoliceDetails, setApoliceDetails] = useState<ApoliceDataDetails[]>(
    []
  );
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [cobertura, setCobertura] = useState<InsurancePolicy[]>([]);
  const [sinistros, setSinistros] = useState<SinistroData[]>([]);
  const [expandedItems, setExpandedItems] = useState<boolean[]>([]);

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Atualizar expandedItems quando cobertura mudar
  useEffect(() => {
    if (cobertura.length > 0) {
      setExpandedItems(new Array(cobertura.length).fill(true));
    }
  }, [cobertura]);

  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Buscar detalhes da apólice
        const apoliceRes = await fetch(
          `/api/anywhere/api/v1/private/mobile/contract/${id}/info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!apoliceRes.ok) {
          throw new Error(`Erro ao buscar apólice: ${apoliceRes.status}`);
        }

        const apoliceData = await apoliceRes.json();
        const apoliceArray = Array.isArray(apoliceData)
          ? apoliceData
          : [apoliceData];
        setApoliceDetails(apoliceArray);

        // 2. Buscar cobertura
        try {
          const coberturaRes = await fetch(
            `/api/anywhere/api/v1/private/mobile/contract/${id}/insuredObjects`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (coberturaRes.ok) {
            const coberturaData = await coberturaRes.json();
            setCobertura(
              Array.isArray(coberturaData) ? coberturaData : [coberturaData]
            );
          } else {
            console.warn("Cobertura não carregada:", coberturaRes.statusText);
          }
        } catch (err) {
          console.warn("Erro ao buscar cobertura:", err);
        }

        // 3. Buscar sinistros (claims)
        try {
          const claimsRes = await fetch(
            `/api/anywhere/api/v1/private/mobile/contract/${id}/claims`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (claimsRes.ok) {
            const claimsData = await claimsRes.json();
            setSinistros(Array.isArray(claimsData) ? claimsData : [claimsData]);
          } else {
            console.warn("Sinistros não carregados:", claimsRes.statusText);
          }
        } catch (err) {
          console.warn("Erro ao buscar sinistros:", err);
        }
      } catch (mainErr) {
        console.error(mainErr);
        setError("Erro ao carregar detalhes da apólice.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id]);

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));
    setError(null);

    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${invoiceNumber}/print/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${invoiceNumber}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error: any) {
      // console.error("Erro ao baixar PDF:", error);
      setError(error.message || "Erro desconhecido ao baixar PDF.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  const handleSinistroDetalhes = (claimNumber: string) => {
    window.location.href = `/sinistro/${claimNumber}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingContainer
          fullHeight={true}
          message="CARREGANDO DETALHES DO APÓLICE..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!apoliceDetails || apoliceDetails.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingContainer
          fullHeight={true}
          message="CARREGANDO DETALHES DO APÓLICE..."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 md:p-6 lg:p-8 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onBack}
            className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 md:px-4 py-1 md:py-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-sm md:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
            Detalhes da Apólice
          </h1>
        </div>
        {/* {apoliceDetails.map((apolice, idx) => (
          <div key={idx} className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() =>
                console.log("baixar apolice", apolice.invoices[0].number)
              }
              className="bg-[#002256] hover:bg-[#002256]/80 text-sm text-white flex items-center rounded-md px-2 sm:px-4 py-1 sm:py-2"
            >
              <PiExportLight className="mr-2 h-4 w-4" />
              Exportar Apólice
            </button>
          </div>
        ))} */}
      </div>

      {apoliceDetails.map((apolice, idx) => (
        <div key={idx} className="space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                  <div className="bg-[#002256] p-2 md:p-3 rounded-full text-white">
                    <IoShieldCheckmarkSharp className="size-4 md:size-5 xl:size-6" />
                  </div>
                  <div className="flex flex-col flex-1 md:flex-none">
                    <CardTitle className="flex items-center gap-2 text-base md:text-xl text-[#002256]">
                      {apolice.productName}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Apólice #{apolice.contractNumber} • Veículo:{" "}
                      {apolice.registration}
                    </CardDescription>
                  </div>
                  <div className="hidden md:flex flex-col">
                    <Badge
                      className={`${getStatusApolicesColors(
                        apolice.contractStatus
                      )} px-2 py-1 text-xs xl:text-sm font-medium`}
                    >
                      {getApolicesStatusText(apolice.contractStatus)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="font-semibold text-sm md:text-base">
                      {formatCurrency(apolice.totalPremium)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 md:pt-6">
              <Tabs
                defaultValue="detalhes"
                className="space-y-4 md:space-y-6 bg-white"
              >
                <TabsList className="flex justify-start space-x-1 md:space-x-2 bg-white">
                  <TabsTrigger
                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-lg rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors whitespace-nowrap"
                    value="detalhes"
                  >
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger
                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-lg rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors whitespace-nowrap"
                    value="coberturas"
                  >
                    Coberturas
                  </TabsTrigger>
                  <TabsTrigger
                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-lg rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors whitespace-nowrap"
                    value="recibos"
                  >
                    Recibos
                  </TabsTrigger>
                  <TabsTrigger
                    className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-lg rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors whitespace-nowrap"
                    value="sinistros"
                  >
                    Sinistros
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="detalhes" className="">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-[#002256] uppercase">
                      Informações da Apólice
                    </h3>
                    <div className="flex flex-col gap-4 md:gap-6 py-3 md:py-4 xl:py-6">
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <FaRegCalendar className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Data Inicio
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {formatDate(apolice.startDate)}
                          </h3>
                        </div>
                      </div>
                      {apolice.invoices.find((inv) => inv.status === 2) && (
                        <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="bg-gray-200 p-2 rounded-full">
                              <FaRegCalendar className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                            </div>
                            <h3 className="text-sm font-medium text-[#002256]">
                              Data Vencimento
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 md:justify-end">
                            <h3 className="text-sm font-medium text-[#002256]">
                              {formatDate(apolice.invoices.find((inv) => inv.status === 2)?.to || null)}
                            </h3>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <FaDollarSign className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Prêmio
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {formatCurrency(apolice.premium)}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-red-600" />
                  <div className="mt-4">
                    <h3 className="text-base md:text-lg font-semibold text-[#002256] uppercase">
                      Informações do Segurado
                    </h3>
                    <div className="flex flex-col gap-4 md:gap-6 py-3 md:py-4 xl:py-6">
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <FaUser className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Nome Completo
                          </h3>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {apolice.clientName}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <FaAddressCard className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Nif
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {apolice.primaryMobileContact}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <FaMobile className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Telefone
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {apolice.contacts[1]}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="bg-gray-200 p-2 rounded-full">
                            <MdEmail className="size-3 md:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <h3 className="text-sm font-medium text-[#002256]">
                            Email
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <h3 className="text-sm font-medium text-[#002256]">
                            {apolice.contacts[0]}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* <Separator className="bg-red-600" />
                  <div className="py-3 md:py-4">
                    <div className="flex flex-col md:flex-row justify-center lg:justify-end gap-2 md:gap-2">
                      <Button className="bg-white px-3 md:px-4 py-2 text-xs md:text-sm border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                        Solicitar Contacto
                      </Button>
                      <Button className="bg-white px-3 md:px-4 py-2 text-xs md:text-sm border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                        Renovar Apolice
                      </Button>
                    </div>
                  </div> */}
                </TabsContent>

                <TabsContent value="coberturas">
                  <div className="grid grid-cols-1 gap-3">
                    {cobertura.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-gray-100 rounded-xl p-3 md:p-4 gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`flex items-center ${
                            expandedItems[index]
                              ? " border-b border-red-600"
                              : ""
                          } pb-2 cursor-pointer`}
                          onClick={() => toggleExpand(index)}
                        >
                          <span className="font-bold flex-grow text-sm md:text-base">
                            {item.name || "Cobertura sem nome"}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500">
                            {expandedItems[index] ? "▼" : "▶"}
                          </span>
                        </div>

                        {expandedItems[index] && (
                          <div className="flex flex-col font-semibold ml-2 md:ml-4 gap-2 md:gap-3">
                            {item.risks.map((risk, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col md:flex-row md:items-center md:justify-between py-1 gap-2 md:gap-0"
                              >
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className="flex items-center bg-green-200 p-1 rounded-full">
                                    <FaCheck className="w-3 h-3 text-green-700" />
                                  </div>
                                  <span className="font-medium text-xs md:text-sm">
                                    {risk.name}
                                  </span>
                                </div>
                                {risk.premium > 1 && (
                                  <div className="flex flex-col items-start md:items-end">
                                    <span className="text-xs md:text-sm">
                                      {formatCurrency(risk.capital)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      12x de {formatCurrency(risk.premium / 12)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recibos">
                  <div className="bg-gray-100 rounded-xl p-3 md:p-4 gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow">
                    {apolice.invoices.map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-3 md:gap-0">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-200 p-2 rounded-full">
                              <IoReceiptSharp className="size-4 md:size-6 xl:size-8 text-[#002256]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium underline text-[#002256] text-sm md:text-base">
                                Recibo Nº {item.number}
                              </span>
                              <span className="text-xs md:text-sm text-gray-400">
                                Valor do Prêmio: {formatCurrency(item.value)}
                              </span>
                              <span className="text-xs md:text-sm text-gray-400">
                                Estado: {getStatusReciverTexts(item.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end">
                            <Button
                              onClick={() => handleDownload(item.number)}
                              disabled={loadingStates[item.number]}
                              className="bg-[#002256] hover:bg-[#002256]/50 px-3 md:px-4 py-2 text-xs md:text-sm text-white"
                            >
                              {loadingStates[item.number] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <>
                                  <Download className="size-3 md:size-4 xl:size-5 text-white" />
                                  <span>Baixar</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="sinistros">
                  <div className="bg-gray-100 rounded-xl p-3 md:p-4 gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow">
                    {sinistros.length === 0 && (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-gray-200 p-2 rounded-full">
                            <FaTriangleExclamation className="size-3 md:size-4 xl:size-6 text-[#002256]" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-[#002256] text-sm md:text-base">
                              Nenhum sinistro associado
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {sinistros.map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 gap-3 md:gap-0">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-200 p-2 rounded-full">
                              <FaTriangleExclamation className="size-4 md:size-6 xl:size-8 text-[#002256]" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-col">
                                <span className="font-medium text-[#002256] text-sm md:text-base">
                                  {item.clientName}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs md:text-sm text-gray-400">
                                  Sinistro: {item.claimNumber}
                                </span>
                                <span className="text-xs md:text-sm text-gray-400">
                                  Estado: {getApolicesStatusText(item.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              onClick={() =>
                                onSelectDetail(item.claimNumber.toString())
                              }
                              className="bg-[#002256] hover:bg-[#002256]/50 px-3 md:px-4 py-2 text-xs md:text-sm text-white"
                            >
                              <FaEye /> Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
