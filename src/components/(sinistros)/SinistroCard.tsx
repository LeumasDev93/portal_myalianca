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
import { DotLoading } from "./ui/dot-loading";
// import { useUserProfile } from "@/hooks/useUserProfile ";

type SinistroData = {
  claimNumber: number;
  contractNumber: number;
  occurenceDate: string;
  claimDate: string;
  clientName: string;
  status: string;
  manager: string;
  insuredObjectName: string;
  insuredObjectDescription: string;
  product: string;
};

const SinistroCard = () => {
  const [sinistros, setSinistros] = useState<SinistroData[]>([]);

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const { profile } = useUserProfile();

  const nif = 501417303;

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setToken(session?.user.accessToken || null);
    };
    checkSession();
  }, []);

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
        <Button className="bg-[#002256] hover:bg-[#002256]/80">
          <Link href="/sinistros/abrir-sinistro" className="flex items-center">
            <FaPlus className="mr-2 xl:h-4 xl:w-4" />
            Novo Sinistro
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center mt-16">
          <DotLoading />
          <span className="text-gray-700 font-extrabold text-2xl uppercase">
            Carregando Sinistros
          </span>
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
                  <Link
                    href={`/sinistros/${sinistro.claimNumber}`}
                    className="hidden sm:block"
                  >
                    <Button
                      className="bg-[#002256] hover:bg-[#002256]/80"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-2">
                    <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                      <MdManageAccounts className="size-10" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
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
                        <p className="text-sm font-medium text-company-blue-400">
                          Matricula
                        </p>
                        {sinistro.insuredObjectDescription ? (
                          <p className="font-medium text-company-blue-600">
                            {sinistro.insuredObjectDescription}
                          </p>
                        ) : (
                          <p className="flex items-center gap-2 text-sm text-gray-300">
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
                        <p className="text-sm font-medium text-company-blue-400">
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
                      <span className="text-sm font-medium text-gray-400">
                        Estado
                      </span>
                      <Badge
                        className={`flex items-center gap-1.5 rounded-sm py-1 ${
                          sinistro.status === "A"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : sinistro.status === "E"
                            ? "bg-white hover:bg-gray-100 border border-red-700 text-red-700"
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
                      <Info className="h-4 w-4 text-company-blue-500" />
                      <span className="text-sm text-company-blue-600"></span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-company-blue-400">
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
};

export default SinistroCard;
