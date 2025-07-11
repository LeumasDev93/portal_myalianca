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
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  FaDollarSign,
  FaFilter,
  FaRegCalendar,
  FaSearch,
} from "react-icons/fa";
import {
  formatCurrency,
  formatDate,
  getApolicesStatusText,
  getStatusApolicesColors,
} from "@/lib/utils";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useApolices } from "@/hooks/useApolices";

type ApolicePageProps = {
  onSelectDetail: (id: string, contractNumber: string) => void;
};

export default function ApolicePage({ onSelectDetail }: ApolicePageProps) {
  const { apolices, errorApolices, isLoadingApolices } = useApolices();

  if (isLoadingApolices) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  if (errorApolices) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <div className="relative">
          <FaSearch className="text-4xl text-gray-400 animate-pulse" />
          <FaFilter
            className="absolute -top-2 -right-2 text-xl text-[#2d4e7f] animate-spin-slow"
            style={{ animationDuration: "3s" }}
          />
        </div>
        <p className="text-gray-500 text-center">
          Nenhum apolice encontrado!
          <br />
          Tente novamnete mas tarde.
        </p>
      </div>
    );
  }

  if (!apolices || apolices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Minhas Apólices
        </h1>
      </div>

      <div className="grid gap-6">
        {apolices.map((apolice) => {
          return (
            <Card key={apolice.contractNumber} className={`overflow-hidden  `}>
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
