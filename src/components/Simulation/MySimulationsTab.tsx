"use client";

import { useEffect, useState } from "react";
import EmptyState from "./Form/EmptyState";
import { LoadingScreen } from "../ui/loading-screen";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { formatDate } from "@/lib/utils";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { fetchSimulations } from "@/service/listSimulationsService";
import { Simulation } from "@/types/typesData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { IoMdClose } from "react-icons/io";

export default function MySimulationsTab() {
  const [simulations, setSimulations] = useState<Simulation[] | null>(null);
  const [filteredSimulations, setFilteredSimulations] = useState<
    Simulation[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const loadSimulations = async () => {
      setLoading(true);
      if (!profile?.user.nif) {
        return;
      }

      try {
        const data = await fetchSimulations(profile.user.nif);

        if (isMounted) {
          setSimulations(data);
          setFilteredSimulations(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar simulações"
          );
          setSimulations(null);
          setFilteredSimulations(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSimulations();

    return () => {
      isMounted = false;
    };
  }, [profile?.user.nif]);

  // Aplicar filtros
  useEffect(() => {
    if (!simulations) return;

    let result = [...simulations];

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (sim) =>
          sim.productName.toLowerCase().includes(term) ||
          sim.clientName.toLowerCase().includes(term) ||
          sim.simulationNumber.toString().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== "all") {
      result = result.filter((sim) => sim.contractStatus === statusFilter);
    }

    // Filtro por produto
    if (productFilter !== "all") {
      result = result.filter((sim) => sim.productName === productFilter);
    }

    setFilteredSimulations(result);
  }, [searchTerm, statusFilter, productFilter, simulations]);

  // Obter produtos únicos para o filtro
  const uniqueProducts = simulations
    ? Array.from(new Set(simulations.map((sim) => sim.productName))).sort()
    : [];

  // Skeleton loading enquanto carrega
  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  // Tratamento de erros
  if (error) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <EmptyState message={error} showFilter={false} />
      </div>
    );
  }

  // Quando não há simulações
  if (!simulations || simulations.length === 0) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <EmptyState
          message="Nenhuma simulação encontrada!"
          showFilter={false}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      {/* Filtros */}
      <div className="flex sm:flex-row flex-col gap-4 mb-6 p-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, cliente ou número"
            className="pl-10 bg-white w-full sm:w-96 2xl:w-[500px] rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white sm:w-1/2 rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">--Selecionar um estado--</SelectItem>
            <SelectItem value="I">Simulação</SelectItem>
            <SelectItem value="A">Ativo</SelectItem>
            <SelectItem value="P">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="bg-white sm:w-1/2 rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
            <SelectValue placeholder="Filtrar por produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">--Selecionar um produto--</SelectItem>
            {uniqueProducts.map((product) => (
              <SelectItem key={product} value={product}>
                {product}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className=" flex items-center justify-cente bg-white rounded-md border border-gray-300 hover:bg-gray-200 p-2 text-gray-700"
          onClick={() => {
            setSearchTerm("");
            setProductFilter("all");
            setStatusFilter("all");
          }}
        >
          <IoMdClose className="size-5" />
        </Button>
      </div>

      {/* Lista de simulações */}
      <div className="space-y-4 pb-4 px-4">
        {filteredSimulations && filteredSimulations.length > 0 ? (
          filteredSimulations.map((simulation) => (
            <Card key={simulation.simulationNumber} className="overflow-hidden">
              <CardHeader className="">
                <div className="flex sm:flex-row flex-col items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-company-blue-600 text-[#002256]">
                      {simulation.productName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Número Simulação: #{simulation.simulationNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data Simulação</p>
                    <p className="font-medium text-[#002256]">
                      {formatDate(simulation.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Premio Total</p>
                    <p className="font-medium text-[#002256]">
                      {simulation.totalPremium}
                    </p>
                  </div>
                  <div className="flex ">
                    <Button className="flex items-center bg-[#002256] hover:bg-[#002256]/70 gap-2">
                      <FaRegEdit />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <FaSearch className="text-4xl text-gray-400" />
            <p className="text-gray-500 text-center">
              Nenhuma simulação encontrada com os filtros aplicados.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setProductFilter("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
