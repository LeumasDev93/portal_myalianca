"use client";

import { useEffect, useState } from "react";
import EmptyState from "../Form/EmptyState";
import { LoadingScreen } from "../../ui/loading-screen";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import { formatDate } from "@/lib/utils";
import { FaRegEdit, FaRegEye, FaSearch } from "react-icons/fa";
import { fetchSimulations } from "@/service/listSimulationsService";
import { Simulation } from "@/types/typesData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { IoMdClose } from "react-icons/io";
import { ModalDetails } from "./ModalDetalhes";

export default function MySimulationsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSimulation, setSelectedSimulation] =
    useState<Simulation | null>(null);

  const [simulations, setSimulations] = useState<Simulation[] | null>(null);
  const [filteredSimulations, setFilteredSimulations] = useState<
    Simulation[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;

    const loadSimulations = async () => {
      setLoading(true);
      if (!profile?.user.nif) return;

      try {
        const data = await fetchSimulations(profile.user.nif);

        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.startDate ?? "").getTime();
          const dateB = new Date(b.startDate ?? "").getTime();
          return dateB - dateA;
        });

        if (isMounted) {
          setSimulations(sortedData);
          setFilteredSimulations(sortedData);
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
        if (isMounted) setLoading(false);
      }
    };

    loadSimulations();
    return () => {
      isMounted = false;
    };
  }, [profile?.user.nif]);

  useEffect(() => {
    if (!simulations) return;

    let result = [...simulations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (sim) =>
          sim.productName.toLowerCase().includes(term) ||
          sim.clientName.toLowerCase().includes(term) ||
          sim.simulationNumber.toString().includes(term) ||
          (sim.registration && sim.registration.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((sim) => sim.contractStatus === statusFilter);
    }

    if (productFilter !== "all") {
      result = result.filter((sim) => sim.productName === productFilter);
    }

    setFilteredSimulations(result);
    setCurrentPage(1); // resetar página ao filtrar
  }, [searchTerm, statusFilter, productFilter, simulations]);

  // Produtos únicos para filtro
  const uniqueProducts = simulations
    ? Array.from(new Set(simulations.map((sim) => sim.productName))).sort()
    : [];

  // Paginação
  const totalPages = filteredSimulations
    ? Math.ceil(filteredSimulations.length / itemsPerPage)
    : 1;

  const paginatedSimulations = filteredSimulations
    ? filteredSimulations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <EmptyState message={error} showFilter={false} />
      </div>
    );
  }

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

  const handleEdit = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setOpenModal(true);
  };

  return (
    <div className="">
      <div className="flex sm:flex-row flex-col gap-4 mb-6 p-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="relative sm:w-1/2">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nº simulação ou objeto seguro"
            className="pl-10 bg-white w-full rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="bg-white sm:w-1/3 rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
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
          className="flex items-center justify-center bg-white rounded-md border border-gray-300 hover:bg-gray-200 p-2 text-gray-700"
          onClick={() => {
            setSearchTerm("");
            setProductFilter("all");
            setStatusFilter("all");
          }}
        >
          <IoMdClose className="size-5" />
        </Button>
      </div>

      <div className="space-y-4 pb-4 px-4">
        {paginatedSimulations.length > 0 ? (
          paginatedSimulations.map((simulation) => (
            <Card key={simulation.simulationNumber} className="overflow-hidden">
              <CardHeader>
                <div className="flex sm:flex-row flex-col items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-company-blue-600 text-[#002256]">
                      {simulation.productName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Número Simulação: #{simulation.simulationNumber}
                    </p>
                    <span className="text-sm text-gray-400">
                      Objeto seguro: {simulation.registration}
                    </span>
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
                      {simulation.totalPremium.toLocaleString(undefined, {
                        style: "currency",
                        currency: "ECV",
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => handleEdit(simulation)}
                      className="flex items-center bg-[#002256] hover:bg-[#002256]/70 gap-2"
                    >
                      <FaRegEye />
                      Ver Detalhes
                    </Button>
                    <Button
                      onClick={() => console.log(simulation)}
                      className="flex items-center bg-[#002256] hover:bg-[#002256]/70 gap-2"
                    >
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 pb-6">
          <Button
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-[#E5E7EB] text-[#002256] opacity-50 cursor-not-allowed"
                : "bg-[#002256] text-white hover:bg-[#002256]/70"
            }`}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-[#002256] text-white"
                  : "bg-[#E5E7EB] text-[#002256] hover:bg-[#D1D5DB]"
              }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "bg-[#E5E7EB] text-[#002256] opacity-50 cursor-not-allowed"
                : "bg-[#002256] text-white hover:bg-[#002256]/70"
            }`}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Próximo
          </Button>
        </div>
      )}

      {openModal && selectedSimulation && (
        <ModalDetails
          selectedSimulation={selectedSimulation}
          setOpenModal={setOpenModal}
        />
      )}
    </div>
  );
}
