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
import { FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { FaCar, FaDollarSign, FaRegCalendar, FaUser } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { DotLoading } from "@/components/ui/dot-loading";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { TbPremiumRights } from "react-icons/tb";
import { RiShieldStarFill } from "react-icons/ri";
import {
  formatCurrency,
  formatDate,
  getApolicesStatusText,
  getStatusApolicesColors,
} from "@/lib/utils";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { useAuth } from "@/contexts/auth-context";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { LoadingScreen } from "@/components/ui/loading-screen";

type Invoice = {
  invoiceNumber: number;
  invoiceDate: string;
  invoiceValue: number;
};
interface ApoliceData {
  productName: string;
  contractNumber: number;
  clientName: string;
  birthdate: string | null;
  primaryMobileContact: string;
  primaryEmailContact: string;
  producerName: string;
  contractStatus: string;
  registration: string | null;
  premium: number;
  totalPremium: number;
  startDate: string;
  endDate: string | null;
  atm: string | null;
  contacts: string[];
  invoices: Invoice[];
}

type ApolicePageProps = {
  onSelectDetail: (id: string, contractNumber: string) => void;
};

export default function ApolicePage({ onSelectDetail }: ApolicePageProps) {
  const [apolices, setApolices] = useState<ApoliceData[]>([]);
  const { token } = useSessionCheckToken();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!token) return;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      const nif = profile?.nif;
      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/${nif}/policies`,
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
        setApolices(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
  }, [token, profile?.nif]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Minhas Apólices
        </h1>
        <Button
          size="sm"
          className="hidden md:flex bg-[#002256] hover:bg-[#002256]/80"
        >
          <FileText className="mr-2 h-4 w-4" />
          Relatório de Apólices
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : apolices.length === 0 ? (
        <LoadingScreen />
      ) : (
        <div className="grid gap-6">
          {apolices.map((apolice) => {
            return (
              <Card
                key={apolice.contractNumber}
                className={`overflow-hidden  `}
              >
                <CardHeader className="border-b border-b-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#002256] p-2 sm:p-3  rounded-full text-white">
                        <IoShieldCheckmarkSharp className="size-4 sm:size-5 xl:size-6" />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="flex items-center gap-2 text-company-blue-600">
                          {apolice.productName}
                        </CardTitle>
                        <CardDescription>
                          Apólice #{apolice.contractNumber}
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
                    <Button
                      onClick={() =>
                        onSelectDetail(
                          apolice.contractNumber.toString(),
                          apolice.contractNumber.toString()
                        )
                      }
                      className="bg-[#002256] hover:bg-[#002256]/80 flex items-center text-white sm:gap-2"
                    >
                      <Eye className=" h-4 w-4" />
                      <span className="hidden sm:inline">Ver detalhes</span>
                    </Button>
                  </div>
                  <div className="flex sm:hidden flex-col w-24 items-center">
                    <Badge
                      className={`${getStatusApolicesColors(
                        apolice.contractStatus
                      )} px-2 py-1 text-xs xl:text-sm font-medium `}
                    >
                      {getApolicesStatusText(apolice.contractStatus)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="">
                  <div className="flex flex-col gap-6">
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
                          valor
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                          {formatCurrency(apolice.totalPremium)}
                        </p>
                        <p className=" text-gray-900 text-[10px] xl:text-xs ">
                          12x de {formatCurrency(apolice.premium)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
