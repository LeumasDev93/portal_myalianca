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
import { Eye, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FaFilter, FaRegCalendar, FaSearch } from "react-icons/fa";
import {
  formatDate,
  getBorderCardSinistrosColors,
  getApolicesStatusText,
  getStatusSinistrosColors,
  getSinistroStatusText,
  STATUS_OPTIONS_RECIBOS,
} from "@/lib/utils";
import { LoadingContainer } from "@/components/ui/loading-container";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { useSinistros } from "@/hooks/useSinistros";
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

type SinistroPageProps = {
  onNewSinistro: () => void;
  onSelectDetail: (id: string) => void;
};

export default function SinistrosPage({
  onSelectDetail,
  onNewSinistro,
}: SinistroPageProps) {
  const { sinistros, isLoadingSinistros, errorSinistros } = useSinistros();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoadingSinistros) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingContainer message="CARREGANDO SINISTROS..." />
      </div>
    );
  }

  if (errorSinistros) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-center">{errorSinistros}</p>
      </div>
    );
  }

  const filteredSinistros = sinistros.filter((sinistro) => {
    // Converte o termo de busca para minúsculas uma única vez
    const searchTermLower = searchTerm.toLowerCase();

    // Filtro unificado por termo de busca
    const matchesSearch =
      sinistro.contractNumber
        .toString()
        .toLowerCase()
        .includes(searchTermLower) || // Número do sinistro
      (sinistro.insuredObjectDescription &&
        sinistro.insuredObjectDescription
          .toLowerCase()
          .includes(searchTermLower)); // Descrição do objeto segurado

    // Filtro por status
    const matchesStatus =
      statusFilter === "all" || sinistro.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  // Se não estiver carregando e não há dados originais
  if (!isLoadingSinistros && sinistros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 h-screen">
        <div className="relative">
          <FaSearch className="text-4xl text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">
          Nenhum sinistro encontrado!
          <br />
          Não há sinistros para exibir no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Sinistros
        </h1>
      </div>

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
              {STATUS_OPTIONS_RECIBOS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className=" flex items-center justify-cente bg-white rounded-md border border-gray-300 hover:bg-gray-200 p-2 text-gray-700"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          >
            <IoMdClose className="size-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredSinistros.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
            <SearchX className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Sua busca não retornou nenhum sinistro com os filtros aplicados.
            </p>
          </div>
        ) : (
          filteredSinistros.map((sinistro) => (
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
                      <CardTitle className="flex items-center gap-2 text-[#002256]">
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
                      <h3 className="text-sm font-medium text-[#002256]">
                        Tipo
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
