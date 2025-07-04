/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import CopiableNumber from "@/components/ui/copiableNumber";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import {
  formatCurrency,
  formatDate,
  getStatusReciverColors,
  getStatusReciverTexts,
  getTypesReciver,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaSpinner,
  FaUser,
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
} from "react-icons/fa";
import { useRecibos } from "@/hooks/useRecibos ";

type ReciboPageProps = {
  onSelectDetail?: (id: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

export default function ReciboPage({}: ReciboPageProps) {
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const { token } = useSessionCheckToken();

  const {
    filteredRecibos,
    isLoadingRecibos,
    recibos,
    errorRecibo,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    resetFilters,
  } = useRecibos();

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));

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
      console.error("Erro ao baixar PDF:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Recibos
        </h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            onClick={() => setViewMode("cards")}
            className="p-2"
            title="Visualização em cards"
          >
            <FaTh className="text-sm" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "secondary"}
            onClick={() => setViewMode("list")}
            className="p-2"
            title="Visualização em lista"
          >
            <FaList className="text-sm" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full sm:w-1/2 mb-6">
        {/* Campo de pesquisa */}
        <div className="relative bg-white rounded-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome, número ou referência..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro por status */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full border rounded-lg focus:ring-2 focus:ring-blue-500">
            <SelectValue placeholder="Selecionar um estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-gray-400">
              -- Selecionar um estado --
            </SelectItem>
            <SelectItem value="1">Em Cobrança</SelectItem>
            <SelectItem value="2">Em Cobrança</SelectItem>
            <SelectItem value="5">Cobrado</SelectItem>
            <SelectItem value="8">Regularizado</SelectItem>
            <SelectItem value="9">Anulado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingRecibos ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : errorRecibo ? (
        <p className="text-red-500">{errorRecibo}</p>
      ) : filteredRecibos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <div className="relative">
            <FaSearch className="text-4xl text-gray-400 animate-pulse" />
            <FaFilter
              className="absolute -top-2 -right-2 text-xl text-[#2d4e7f] animate-spin-slow"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <p className="text-gray-500 text-center">
            Nenhum recibo encontrado para esta pesquisa!
            <br />
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-5 gap-4">
          {filteredRecibos.map((recibo) => (
            <Card key={recibo.number}>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex text-sm xl:text-lg font-bold text-[#002256]">
                    Número:
                    <CopiableNumber number={recibo.number} />
                  </div>
                  <Button
                    onClick={() => handleDownload(recibo.number)}
                    disabled={loadingStates[recibo.number]}
                    className="flex items-center bg-[#002856] hover:bg-[#002856]/50 gap-2"
                  >
                    {loadingStates[recibo.number] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaDownload />
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  <div>Referencia: {recibo.mbref}</div>
                  <div className="flex flex-col gap-2">
                    <span>Valor: {formatCurrency(recibo.value)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>Tipo: {getTypesReciver(recibo.type)}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex items-center just gap-2">
                    <span className="bg-blue-100 rounded-full p-2">
                      <FaUser />
                    </span>
                    <span>{recibo.clientName}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>Estado:</span>
                    <span
                      className={`text-xs xl:text-[14px] border ${getStatusReciverColors(
                        recibo.status
                      )} bg-[#cdcecf] text-[#002256] px-2 py-1 rounded-sm`}
                    >
                      {getStatusReciverTexts(recibo.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex flex-col">
                  Data Faturacao:
                  <span className="text-xs xl:text-[14px] text-[#002256] ">
                    {formatDate(recibo.from)} - {formatDate(recibo.to)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecibos.map((recibo) => (
            <div
              key={recibo.number}
              className="p-4 border rounded-lg bg-white transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Número:</span>
                    <CopiableNumber number={recibo.number} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Cliente:</span>
                    <span>{recibo.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Valor:</span>
                    <span>{formatCurrency(recibo.value)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-sm ${getStatusReciverColors(
                      recibo.status
                    )}`}
                  >
                    {getStatusReciverTexts(recibo.status)}
                  </span>
                  <Button
                    onClick={() => handleDownload(recibo.number)}
                    disabled={loadingStates[recibo.number]}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {loadingStates[recibo.number] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaDownload />
                        <span>Baixar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Referência:</span>
                  <p>{recibo.mbref}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p>{getTypesReciver(recibo.type)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Período:</span>
                  <p>
                    {formatDate(recibo.from)} - {formatDate(recibo.to)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
