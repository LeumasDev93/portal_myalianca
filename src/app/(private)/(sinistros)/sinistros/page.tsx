/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CiCalendar } from "react-icons/ci";
import {
  AlertTriangle,
  Eye,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
  MdAppRegistration,
  MdDashboard,
  MdManageAccounts,
  MdOutlineDashboardCustomize,
} from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { DotLoading } from "@/components/ui/dot-loading";
import { SinistroData } from "@/types/typesData";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useUserProfile } from "@/hooks/useUserProfile ";
// import { useUserProfile } from "@/hooks/useUserProfile ";

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
        <div className="flex flex-col items-center justify-center h-screen">
          <span className="text-gray-700 font-semibold text-xl uppercase">
            Carregando Sinistros
          </span>
          <DotLoading />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sinistros.map((sinistro) => (
            <Card
              key={sinistro.claimDate}
              className={`overflow-hidden border-b-4 sm:border-b-0 sm:border-l-4 rounded-xl ${
                sinistro.status == "A"
                  ? "border-b-[#002256] sm:border-l-[#002256]"
                  : sinistro.status == "E"
                  ? "border-b-[#B7021C] sm:border-l-[#B7021C]"
                  : "border-b-[#908688] sm:border-l-[#908688]"
              } `}
            >
              <CardHeader className="border-b ">
                <div className="flex items-center justify-between px-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[#002256]">
                      {sinistro.product} - {sinistro.insuredObjectName}
                    </CardTitle>
                    <CardDescription>
                      Sinistro #{sinistro.claimNumber} • Apólice #
                      {sinistro.contractNumber}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() =>
                      onSelectDetail(sinistro.claimNumber.toString())
                    }
                    className="bg-[#002256] hover:bg-[#002256]/80"
                    size="sm"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalhes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 p-2 rounded-full text-[#002256]">
                      <MdManageAccounts className="size-10" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#002256]">
                        Gestor
                      </p>
                      <p className="font-bold text-gray-600 text-xl">
                        {sinistro.manager}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                        <MdOutlineDashboardCustomize className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#002256]">
                          Matricula
                        </p>
                        {sinistro.insuredObjectDescription ? (
                          <p className="font-medium text-company-blue-600">
                            {sinistro.insuredObjectDescription}
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-xs xl:text-sm text-gray-300">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Nenhuma matrícula disponível
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                        <CiCalendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#002256]">
                          Data
                        </p>
                        <p className="font-medium text-company-blue-600">
                          {sinistro.occurenceDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#002256]">
                        Estado
                      </span>
                      <Badge
                        className={`flex items-center gap-1.5 rounded-sm py-2 ${
                          sinistro.status === "A"
                            ? "bg-green-100 border border-green-200 text-green-800"
                            : sinistro.status === "E"
                            ? "bg-red-100 border border-red-200 text-red-800"
                            : ""
                        } capitalize`}
                      >
                        {sinistro.status === "A" && (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        {sinistro.status === "E" && (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {sinistro.status === "A"
                          ? "Aprovado"
                          : sinistro.status === "E"
                          ? "Em Análise"
                          : sinistro.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sinistro.status === "A" ? (
                        <CheckCircle className="h-4 w-4 text-blue-900" />
                      ) : (
                        <Clock className="h-4 w-4 text-red-700" />
                      )}
                      <span className="text-sm text-company-blue-600"></span>
                    </div>
                    <div className="flex items-center gap-1 text-xs xl:text-sm text-[#002256]">
                      <span>Última atualização: {sinistro.claimDate}</span>
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
