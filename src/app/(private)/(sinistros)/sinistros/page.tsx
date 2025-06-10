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
import { CiCalendar } from "react-icons/ci";
import { Eye, AlertCircle, Info, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { MdManageAccounts, MdOutlineDashboardCustomize } from "react-icons/md";
import { FaDollarSign, FaPlus, FaRegCalendar } from "react-icons/fa";
import { DotLoading } from "@/components/ui/dot-loading";
import { SinistroData } from "@/types/typesData";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useUserProfile } from "@/hooks/useUserProfile ";
import {
  formatCurrency,
  formatDate,
  getBorderCardSinistrosColors,
  getApolicesStatusText,
  getStatusSinistrosColors,
  getSinistroStatusText,
} from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoShieldCheckmarkSharp } from "react-icons/io5";

type SinistroPageProps = {
  onNewSinistro: () => void;
  onSelectDetail: (id: string) => void;
};

export function SinistrosPage({
  onSelectDetail,
  onNewSinistro,
}: SinistroPageProps) {
  const [sinistros, setSinistros] = useState<SinistroData[]>([]);
  const { token } = useSessionCheckToken();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { profile } = useUserProfile();

  const nif = profile?.nif;

  useEffect(() => {
    if (!token) return;

    const fetchCoberturas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/${nif}/claims`,
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
  }, [token, nif]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Sinistros
        </h1>
        <Button
          onClick={onNewSinistro}
          className="bg-[#002256] hover:bg-[#002256]/80 flex items-center"
        >
          <FaPlus className="mr-2 xl:h-4 xl:w-4" />
          Novo Sinistro
        </Button>
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
        <div className="flex flex-col gap-6">
          {sinistros.map((sinistro) => (
            <Card
              key={sinistro.claimNumber}
              className={`overflow-hidden border-b-4 sm:border-b-0 sm:border-l-4 rounded-xl ${getBorderCardSinistrosColors(
                sinistro.status
              )} `}
            >
              <CardHeader className="border-b border-b-red-500">
                <div className="flex items-center justify-between">
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
                  <Button
                    onClick={() =>
                      onSelectDetail(sinistro.claimNumber.toString())
                    }
                    className="bg-[#002256] hover:bg-[#002256]/80 flex items-center text-white sm:gap-2"
                  >
                    <Eye className=" h-4 w-4" />
                    <span className="hidden sm:inline">Ver detalhes</span>
                  </Button>
                </div>
                <div className="flex sm:hidden flex-col w-24 items-center">
                  <Badge
                    className={`${getStatusSinistrosColors(
                      sinistro.status
                    )} px-2 py-1 text-xs xl:text-sm font-medium `}
                  >
                    {getApolicesStatusText(sinistro.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <IoShieldCheckmarkSharp className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Tipo
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
