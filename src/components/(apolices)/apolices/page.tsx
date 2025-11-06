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
import { Eye, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  FaDollarSign,
  FaFilter,
  FaRegCalendar,
  FaRegClosedCaptioning,
  FaSearch,
} from "react-icons/fa";
import {
  formatCurrency,
  formatDate,
  getApolicesStatusText,
  getStatusApolicesColors,
  STATUS_OPTIONS,
} from "@/lib/utils";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { LoadingContainer } from "@/components/ui/loading-container";
import { useApolices } from "@/hooks/useApolices";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdClose } from "react-icons/io";

type ApolicePageProps = {
  onSelectDetail: (id: string, contractNumber: string) => void;
};

export default function ApolicePage({ onSelectDetail }: ApolicePageProps) {
  const { apolices, errorApolices, isLoadingApolices } = useApolices();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 1️⃣ LOADING
  if (isLoadingApolices) {
    return (
      <div className="flex-1 w-full h-screen flex items-center justify-center">
        <LoadingContainer fullHeight={true} message="CARREGANDO APÓLICES..." />
      </div>
    );
  }

  // 2️⃣ ERRO
  if (errorApolices) {
    return (
      <div className="flex-1 w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <div className="relative">
            <FaSearch className="text-4xl text-gray-400 animate-pulse" />
            <FaFilter
              className="absolute -top-2 -right-2 text-xl text-[#2d4e7f] animate-spin-slow"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <p className="text-gray-500 text-center">
            Não há dados no momento.
            <br />
            Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  // 3️⃣ SEM APÓLICES
  if (apolices.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Minhas Apólices
        </h1>
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <SearchX className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">Nenhuma apólice encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Você ainda não possui apólices cadastradas no sistema.
          </p>
        </div>
      </div>
    );
  }

  // 4️⃣ TEM DADOS - Processar filtros
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const filteredApolices = apolices.filter((apolice) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      apolice.contractNumber.toString().includes(term) ||
      apolice.productName.toLowerCase().includes(term) ||
      (apolice.registration &&
        apolice.registration.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === "all" || apolice.contractStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
        Minhas Apólices
      </h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número apólice ou objeto seguro "
            className="pl-10 bg-white rounded-md border w-full border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white rounded-md border w-1/2 border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="flex items-center justify-center bg-white rounded-md border border-gray-300 hover:bg-gray-200 p-2 text-gray-700"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            <IoMdClose className="size-5" />
          </Button>
        </div>
      </div>

      {/* Lista */}
      <div className="grid gap-6">
        {hasActiveFilters && filteredApolices.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Sua busca não retornou nenhuma apólice com os filtros aplicados.
            </p>
          </div>
        ) : (
          filteredApolices.map((apolice) => (
            <Card key={apolice.contractNumber} className="overflow-hidden">
              <CardHeader className="border-b border-b-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#002256] p-2 sm:p-3 rounded-full text-white">
                      <IoShieldCheckmarkSharp className="size-4 sm:size-5 xl:size-6" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="flex items-center gap-2 text-[#002256]">
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
                      <h3 className="text-sm font-medium text-[#002256]">
                        Data Inicio
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[#002256]">
                        {formatDate(apolice.startDate)}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {/* <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#002256]">
                        Data Vencimento
                      </h3>
                    </div> */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-[#002256]">
                        {formatDate(apolice.endDate)}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaDollarSign className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <h3 className="text-sm font-medium text-[#002256]">
                        Prêmio Anual
                      </h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-medium text-[#002256]">
                        {formatCurrency(apolice.totalPremium)}
                      </h3>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
