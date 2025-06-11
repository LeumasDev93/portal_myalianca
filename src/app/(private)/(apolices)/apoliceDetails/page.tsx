/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Card,
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
import { LoadingScreen } from "@/components/ui/loading-screen";

type ApoliceDetailPageProps = {
  id: string;
  contractNumber: string;
  onBack: () => void;
  onSelectDetail: (claimNumber: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};
export function ApoliceDetailPage({
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
  const [expandedItems, setExpandedItems] = useState<boolean[]>(
    new Array(cobertura.length).fill(true)
  );

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  useEffect(() => {
    if (!token) return;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/contract/${id}/info`,
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
        setApoliceDetails(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
  }, [token, id]);

  useEffect(() => {
    if (!token) return;

    const fetchCoberturaApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/contract/${id}/insuredObjects`,
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
          throw {
            message: `Erro ao buscar objetos segurados`,
            status: response.status,
          };
        }

        const data: InsurancePolicy[] = await response.json();
        setCobertura(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar objetos segurados:", error);
        setError(
          "Erro ao carregar objetos segurados. Tente novamente mais tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoberturaApolices();
  }, [token, id]);

  useEffect(() => {
    if (!token || !contractNumber) return;

    const fetchCoberturas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/contract/${contractNumber}/claims`,
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
          throw new Error("Erro ao buscar coberturas do sinistro");
        }

        const data = await response.json();

        // Normaliza os dados para sempre trabalhar com array
        setSinistros(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar coberturas:", error);
        setError("Erro ao carregar coberturas. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoberturas();
  }, [token, contractNumber]);

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
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onBack}
            className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
          >
            <ArrowLeft className="h-4 w-4 " />
          </Button>
          <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
            Detalhes da Apólice
          </h1>
        </div>
        {apoliceDetails.map((apolice, idx) => (
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
        ))}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : sinistros.length === 0 ? (
        <LoadingScreen />
      ) : (
        <>
          {apoliceDetails.map((apolice, idx) => (
            <div key={idx} className="space-y-4">
              <Card>
                <CardHeader className="">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#002256] p-2 sm:p-3  rounded-full text-white">
                        <IoShieldCheckmarkSharp className="size-4 sm:size-5 xl:size-6" />
                      </div>
                      <div className="flex flex-col ">
                        <CardTitle className="flex items-center gap-2 text-xl text-[#002256]">
                          {apolice.productName}
                        </CardTitle>
                        <CardDescription>
                          Apólice #{apolice.contractNumber} • Veículo:{" "}
                          {apolice.registration}
                        </CardDescription>
                      </div>
                      <div className="hidden sm:flex flex-col ">
                        <Badge
                          className={`${getStatusApolicesColors(
                            apolice.contractStatus
                          )} px-2 py-1 text-xs xl:text-sm font-medium `}
                        >
                          {getApolicesStatusText(apolice.contractStatus)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {formatCurrency(apolice.totalPremium)}
                        </div>
                        <div className="text-xs text-gray-400">
                          <span>12x de {formatCurrency(apolice.premium)} </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
              <Tabs defaultValue="detalhes" className="">
                <TabsList className="flex justify-start sm:space-x-2 space-x-0.5">
                  <TabsTrigger
                    className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                    value="detalhes"
                  >
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger
                    className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                    value="coberturas"
                  >
                    Coberturas
                  </TabsTrigger>
                  <TabsTrigger
                    className="sm:px-4 xl:text-lg sm:py-2 ps-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                    value="recibos"
                  >
                    Recibos
                  </TabsTrigger>
                  <TabsTrigger
                    className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                    value="sinistros"
                  >
                    Sinistros
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="detalhes"
                  className="bg-white rounded-lg px-4 xl:p-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold uppercase">
                      Informações da Apólice
                    </h3>
                    <div className="flex flex-col gap-6 py-4 xl:py-6">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Data Inicio
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {formatDate(apolice.startDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Data Vencimento
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {formatDate(apolice.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaDollarSign className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Prêmio
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {formatCurrency(apolice.premium)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-red-600" />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold uppercase">
                      Informações do Segurado
                    </h3>
                    <div className="flex flex-col gap-6 py-4 xl:py-6">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaUser className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Nome Completo
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.clientName}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaAddressCard className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Nif
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.primaryMobileContact}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaMobile className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Telefone
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.contacts[1]}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <MdEmail className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Email
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.contacts[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-red-600" />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold uppercase">
                      Assistência 24h
                    </h3>
                    <div className="flex flex-col gap-6 py-4 xl:py-6">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <FaMobile className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Telefone de Emergência
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.primaryMobileContact}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-200  p-2 rounded-full ">
                            <MdEmail className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                            Whatsapp
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                            {apolice.primaryEmailContact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-red-600" />
                  <div className="py-4">
                    <div className="flex justify-center lg:justify-end gap-1 sm:gap-2">
                      <Button className="bg-white sm:px-4 sm:py-2 px-1 py-0.5 text-[10px] sm:text-sm  border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                        Abrir Sinistro
                      </Button>
                      <Button className="bg-white sm:px-4 sm:py-2 px-1 py-0.5 text-[10px] sm:text-sm  border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                        Solicitar Contacto
                      </Button>
                      <Button className="bg-white sm:px-4 sm:py-2 px-1 py-0.5 text-[10px] sm:text-sm border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                        Renovar Apolice
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="coberturas">
                  <div className="grid grid-cols-1 gap-3">
                    {cobertura.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col bg-white rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`flex items-center ${
                            expandedItems[index]
                              ? " border-b border-red-600"
                              : ""
                          } pb-2 cursor-pointer`}
                          onClick={() => toggleExpand(index)}
                        >
                          <span className="font-bold flex-grow">
                            {item.name || "Cobertura sem nome"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {expandedItems[index] ? "▼" : "▶"}
                          </span>
                        </div>

                        {expandedItems[index] && (
                          <div className="flex flex-col font-semibold ml-4 gap-3">
                            {item.risks.map((risk, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between py-1"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center bg-green-200 p-1 rounded-full">
                                    <FaCheck className="w-3 h-3 text-green-700" />
                                  </div>
                                  <span className="font-medium">
                                    {risk.name}
                                  </span>
                                </div>
                                {risk.premium > 1 && (
                                  <div className="flex flex-col items-end">
                                    <span>{formatCurrency(risk.capital)}</span>
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
                  <div className=" bg-white rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                    {apolice.invoices.map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-200 p-2 rounded-full">
                              <IoReceiptSharp className="size-4 sm:size-6 xl:size-8 text-[#002256]" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium underline text-[#002256]">
                                Recibo Nº {item.number}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-400">
                                Valor do Prêmio: {formatCurrency(item.value)}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-400">
                                Estado: {getStatusReciverTexts(item.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Button
                              onClick={() => handleDownload(item.number)}
                              disabled={loadingStates[item.number]}
                              className="bg-[#002256] hover:bg-[#002256]/50 sm:px-4 sm:py-2 px-1 py-0.5 text-[10px] sm:text-sm text-white"
                            >
                              {loadingStates[item.number] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <>
                                  <Download className="size-2 sm:size-4 xl:size-5 text-white" />
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
                  <div className=" bg-white rounded-xl p-4 gap-4 shadow-sm hover:shadow-md transition-shadow">
                    {sinistros.map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-200 p-2 rounded-full">
                              <FaTriangleExclamation className="size-4 sm:size-6 xl:size-8 text-[#002256]" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-col">
                                <span className="font-medium text-[#002256]">
                                  {item.clientName}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-xs text-gray-400">
                                  Sinistro: {item.claimNumber}
                                </span>
                                <span className="text-xs sm:text-xs text-gray-400">
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
                              className="bg-[#002256] hover:bg-[#002256]/50 sm:px-4 sm:py-2 px-1 py-0.5 text-[10px] sm:text-sm text-white"
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
            </div>
          ))}
        </>
      )}
    </div>
  );
}
