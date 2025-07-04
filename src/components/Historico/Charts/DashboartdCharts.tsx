/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { IoSync } from "react-icons/io5";

import { useApolices } from "@/hooks/useApolices";
import { useSinistros } from "@/hooks/useSinistros";
import {
  getApolicesStatusColorsHex,
  getApolicesStatusText,
  getSinistrosStatusColorsHex,
  getSinistroStatusText,
  getStatusReciverColorHex,
  getStatusReciverTexts,
} from "@/lib/utils";
import { useRecibos } from "@/hooks/useRecibos ";

// Configuração de revalidação
const REVALIDATION_TIME = 60; // segundos

const customTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#002855] px-2 py-1 rounded shadow-sm">
        <p className="font-medium text-xs xl:text-sm text-white">{` ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  const [isXlScreen, setIsXlScreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [forceRefresh, setForceRefresh] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // Hooks de dados conforme sua estrutura atual
  const { recibos, isLoadingRecibos } = useRecibos();
  const { apolices, isLoadingApolices } = useApolices();
  const { sinistros, isLoadingSinistros } = useSinistros();

  // Estado local para os dados
  const [localRecibos, setLocalRecibos] = useState(recibos || []);
  const [localApolices, setLocalApolices] = useState(apolices || []);
  const [localSinistros, setLocalSinistros] = useState(sinistros || []);

  // Efeito para sincronizar os dados quando os hooks atualizarem
  useEffect(() => {
    if (recibos) setLocalRecibos(recibos);
    if (apolices) setLocalApolices(apolices);
    if (sinistros) setLocalSinistros(sinistros);
  }, [recibos, apolices, sinistros]);

  // Função para atualizar manualmente os dados
  const revalidateData = async () => {
    setIsLoadingLocal(true);
    try {
      setLastUpdated(new Date());
    } finally {
      setTimeout(() => {
        setIsLoadingLocal(false);
      }, 2000);
    }
  };

  const apoliceData = useMemo(() => {
    if (!localApolices) return [];
    const counts: Record<string, number> = {};
    localApolices.forEach((a: any) => {
      counts[a.contractStatus] = (counts[a.contractStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([Status, Quantidade]) => ({
      Status,
      Quantidade,
    }));
  }, [localApolices]);

  const sinistroData = useMemo(() => {
    if (!localSinistros) return [];
    const counts: Record<string, number> = {};
    localSinistros.forEach((s: any) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts).map(([Status, Quantidade]) => ({
      Status,
      Quantidade,
    }));
  }, [localSinistros]);

  const reciboData = useMemo(() => {
    if (!localRecibos) return [];
    const counts: Record<string, number> = {};
    localRecibos.forEach((r: any) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([Status, Quantidade]) => ({
      Status,
      Quantidade,
    }));
  }, [localRecibos]);

  // prepare export dataset
  const exportData = useMemo(
    () => ({
      apolices: apoliceData,
      sinistros: sinistroData,
      pagamentos: reciboData,
    }),
    [apoliceData, sinistroData, reciboData]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsXlScreen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // loading state
  const loading =
    isLoadingApolices || isLoadingSinistros || isLoadingRecibos || isValidating;

  return (
    <div className="flex flex-col">
      <Card className="w-full h-full bg-white rounded-lg shadow-md sm:mt-10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl xl:text-2xl font-bold">
              Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={revalidateData}
                disabled={isLoadingLocal}
                className="text-gray-500 cursor-pointer hover:text-gray-600 transition-colors"
              >
                <IoSync className={isLoadingLocal ? "animate-spin" : ""} />
              </button>
              <span className="text-xs text-gray-500">
                Atualizado: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 xl:px-6">
          <Tabs defaultValue="apolices" className="space-y-2 xl:space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-white xl:gap-2">
              <TabsTrigger
                value="apolices"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-2 rounded-lg"
              >
                Apólices
              </TabsTrigger>
              <TabsTrigger
                value="sinistros"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-2 rounded-lg"
              >
                Sinistros
              </TabsTrigger>
              <TabsTrigger
                value="pagamentos"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-2 rounded-lg"
              >
                Pagamentos
              </TabsTrigger>
            </TabsList>
            {loading ? (
              <div className="flex items-center justify-center h-[200px] sm:h-[250px] xl:h-[300px]">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#002855]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-[#002855]">A carregando dados...</span>
              </div>
            ) : (
              [
                {
                  key: "apolices",
                  data: apoliceData.map((d) => {
                    const colors = getApolicesStatusColorsHex(d.Status);

                    return {
                      label: getApolicesStatusText(d.Status),
                      value: d.Quantidade,
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    };
                  }),
                },
                {
                  key: "sinistros",
                  data: sinistroData.map((d) => {
                    const colors = getSinistrosStatusColorsHex(d.Status);
                    return {
                      label: getSinistroStatusText(d.Status),
                      value: d.Quantidade,
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    };
                  }),
                },
                {
                  key: "pagamentos",
                  data: reciboData.map((d) => {
                    const colors = getStatusReciverColorHex(Number(d.Status));
                    return {
                      label: getStatusReciverTexts(Number(d.Status)),
                      value: d.Quantidade,
                      backgroundColor: colors.backgroundColor,
                      color: colors.color,
                    };
                  }),
                },
              ].map(({ key, data }) => (
                <TabsContent
                  key={key}
                  value={key}
                  className="space-y-2 xl:space-y-4"
                >
                  <div className="flex items-center justify-center h-[200px] sm:h-[250px] xl:h-[300px] xl:gap-4">
                    <div className="w-full h-[180px] sm:h-[200px] xl:h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={isXlScreen ? 70 : 50}
                            outerRadius={isXlScreen ? 100 : 80}
                            dataKey="value"
                          >
                            {data.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={customTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 text-xs xl:text-sm">
                      {data.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className="w-2 h-4 sm:h-6 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.label || "Não Definido"}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
