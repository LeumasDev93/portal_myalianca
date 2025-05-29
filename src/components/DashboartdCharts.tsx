/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import * as XLSX from "xlsx";

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

const exportData = {
  apolices: [
    { Tipo: "Automóvel", Quantidade: 4 },
    { Tipo: "Viagem", Quantidade: 3 },
    { Tipo: "Vida", Quantidade: 2 },
    { Tipo: "Casa", Quantidade: 1 },
  ],
  sinistros: [
    { Status: "Em análise", Quantidade: 1 },
    { Status: "Concluídos", Quantidade: 2 },
  ],
  pagamentos: [
    { Status: "Pagos", Quantidade: 4 },
    { Status: "Pendentes", Quantidade: 2 },
  ],
};

export function DashboardCharts() {
  const [isXlScreen, setIsXlScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsXlScreen(window.innerWidth >= 1280);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExport = () => {
    // Criar uma nova pasta de trabalho
    const wb = XLSX.utils.book_new();

    // Adicionar cada aba com seus respectivos dados
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(exportData.apolices),
      "Apólices"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(exportData.sinistros),
      "Sinistros"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(exportData.pagamentos),
      "Pagamentos"
    );

    XLSX.writeFile(wb, "Dashboard_Exportado.xlsx");
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          className="bg-[#002855] text-white py-2 cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
      <Card className=" w-full h-full bg-white rounded-lg shadow-md mt-2">
        <CardHeader>
          <CardTitle className="text-xl xl:text-2xl font-bold">
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 xl:p-6">
          <Tabs defaultValue="apolices" className="space-y-2 xl:space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-white xl:gap-2">
              <TabsTrigger
                value="apolices"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-4 rounded-lg"
              >
                Apólices
              </TabsTrigger>
              <TabsTrigger
                value="sinistros"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-4 rounded-lg"
              >
                Sinistros
              </TabsTrigger>
              <TabsTrigger
                value="pagamentos"
                className="text-[#002855] text-xs xl:text-sm font-bold data-[state=active]:bg-[#002855] data-[state=active]:text-white data-[state=active]:py-2 xl:data-[state=active]:py-4 rounded-lg"
              >
                Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="apolices" className="space-y-2 xl:space-y-4">
              <div className="flex items-center justify-center h-[200px] sm:h-[250px] xl:h-[300px]  xl:gap-4">
                <div className="w-full h-[180px] sm:h-[200px] xl:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Automóvel", value: 4, color: "#F4C7C3" },
                          { name: "Viagem", value: 3, color: "#B21830" },
                          { name: "Vida", value: 2, color: "#E28288" },
                          { name: "Casa", value: 1, color: "#F9D7D6" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth >= 1280 ? 70 : 50}
                        outerRadius={window.innerWidth >= 1280 ? 100 : 80}
                        dataKey="value"
                      >
                        {["#F4C7C3", "#B21830", "#E28288", "#F9D7D6"].map(
                          (color, index) => (
                            <Cell key={index} fill={color} />
                          )
                        )}
                      </Pie>
                      <Tooltip content={customTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 text-xs xl:text-sm">
                  {["#F4C7C3", "#B21830", "#E28288", "#F9D7D6"].map(
                    (color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className="w-2 h-4 sm:h-6 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {["Automóvel", "Viagem", "Vida", "Casa"][i]}
                      </div>
                    )
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sinistros" className="space-y-2 xl:space-y-4">
              <div className="flex  items-center h-[200px] sm:h-[250px] xl:h-[300px] gap-2 xl:gap-4">
                <div className="w-full h-[180px] sm:h-[200px] xl:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Em análise", value: 1, color: "#A78BFA" },
                          { name: "Concluídos", value: 2, color: "#8B5CF6" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth >= 1280 ? 70 : 50}
                        outerRadius={window.innerWidth >= 1280 ? 100 : 80}
                        dataKey="value"
                      >
                        {["#A78BFA", "#8B5CF6"].map((color, index) => (
                          <Cell key={index} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 text-xs xl:text-sm">
                  {["#A78BFA", "#8B5CF6"].map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-2 h-4 sm:h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {[" Em análise", "Concluídos"][i]}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="pagamentos" className="space-y-2 xl:space-y-4">
              <div className="flex items-center h-[200px] sm:h-[250px] xl:h-[300px] gap-2 xl:gap-4">
                <div className="w-full h-[180px] sm:h-[200px] xl:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Pagos", value: 4, color: "#6EE7B7" },
                          { name: "Pendentes", value: 2, color: "#A7F3D0" },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth >= 1280 ? 70 : 50}
                        outerRadius={window.innerWidth >= 1280 ? 100 : 80}
                        dataKey="value"
                      >
                        {["#6EE7B7", "#A7F3D0"].map((color, index) => (
                          <Cell key={index} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip content={customTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2 text-xs xl:text-sm">
                  {["#6EE7B7", "#A7F3D0"].map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-2 h-4 sm:h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {["Pagos", "Pendentes"][i]}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
