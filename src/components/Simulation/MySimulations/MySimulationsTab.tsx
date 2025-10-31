/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import EmptyState from "../Form/EmptyState";
import { LoadingContainer } from "../../ui/loading-container";
import { Card, CardHeader, CardTitle } from "../../ui/card";
import { formatDate } from "@/lib/utils";
import { FaRegEdit, FaRegEye, FaSearch } from "react-icons/fa";
import { fetchSimulations } from "@/service/listSimulationsService";
import { Simulation, SimulationResponse } from "@/types/typesData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { IoMdClose } from "react-icons/io";
import { ModalDetails } from "./ModalDetalhes";
import { getSimulationDetails } from "@/service/getSimulationDetails";
import SimulationForm from "../Form/SimulationForm";
import { useProductsList } from "@/hooks/useProductsList";

// Tipos melhorados para os dados da simulação
export interface SimulationDetails {
  idSimulationTel: number;
  idContract: number;
  reference: string;
  totalPremium: number;
  premium: number;
  renewalDate: string;
  continuedDate: string | null;
  clientReference: string | null;
  producerReference: string | null;
  product: null;
  propertyGroup: null;
  installmentValues: {
    name: string;
    value: number;
    annualValue: number;
    taxes: Record<string, number>;
  }[];
  simulationObjects: {
    idSimulationObject: number | null; // Alterado de null para number | null
    reference: string;
    capital: number;
    premium: number;
    premiumTotal: number | null;
    startDate: string;
    endDate: string | null; // Alterado de null para string | null
    code: string | null;
    status: string;
    description: string | null;
    type: string | null; // Alterado de null para string | null
    discount: number;
    franchise: number | null;
    propertyGroup: {
      name: string;
      values: {
        name: string;
        type: string;
        value: string;
        rank: number;
        translationCode: string;
      }[];
    } | null;
    risks: {
      name: string;
      order: number;
      code: string;
      active: boolean;
      capital: number;
      capitalOption: string | null;
      premium: number;
      taxes: Record<string, number>;
      bonusMalus: number | null; // Alterado de null para number | null
      deductibleValue: number;
    }[];
    children: any[];
    dependents: any | null; // Alterado de null para any | null
  }[];
  currency: string;
  currencySymbol: string;
  hasError: boolean;
  errors: any[];
  hasWarnings: boolean;
  warnings: any[];
}

export default function MySimulationsTab() {
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);
  const [simulations, setSimulations] = useState<Simulation[] | null>(null);
  const [filteredSimulations, setFilteredSimulations] = useState<
    Simulation[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const [showSimulationResults, setShowSimulationResults] = useState(false);
  const [simulationDetails, setSimulationDetails] =
    useState<SimulationResponse | null>(null);

  // Estado para o modal do formulário
  const [showSimulationForm, setShowSimulationForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Hook para buscar produtos disponíveis
  const { products } = useProductsList();

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
    setCurrentPage(1);
  }, [searchTerm, statusFilter, productFilter, simulations]);

  // Produtos únicos para filtro
  const uniqueProducts = simulations
    ? Array.from(new Set(simulations.map((sim) => sim.productName))).sort()
    : [];

  // Paginação
  const totalPages = filteredSimulations
    ? Math.ceil(filteredSimulations.length / itemsPerPage)
    : 0;

  const paginatedSimulations = filteredSimulations
    ? filteredSimulations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <LoadingContainer message="CARREGANDO MINHAS SIMULAÇÕES..." />
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

  const handleEdit = async (simulation: Simulation) => {
    console.log("Editando simulação:", simulation);
    console.log("Produtos disponíveis:", products);

    // Encontrar o produto baseado no nome
    const matchingProduct = products.find(
      (product) =>
        product.name
          .toLowerCase()
          .includes(simulation.productName.toLowerCase()) ||
        simulation.productName
          .toLowerCase()
          .includes(product.name.toLowerCase())
    );

    if (matchingProduct) {
      console.log("Produto encontrado:", matchingProduct);
      setSelectedProductId(matchingProduct.productId);
    } else {
      console.log("Produto não encontrado, usando primeiro produto disponível");
      // Usar o primeiro produto disponível como fallback
      const firstProduct = products[0];
      if (firstProduct) {
        setSelectedProductId(firstProduct.productId);
      } else {
        // Se não houver produtos, usar um UUID padrão
        setSelectedProductId("550e8400-e29b-41d4-a716-446655440000");
      }
    }

    // Buscar os detalhes da simulação para preencher o formulário
    try {
      console.log("Buscando detalhes da simulação para edição...");
      const simulationDetails = await getSimulationDetails(
        simulation.simulationNumber.toString()
      );
      console.log("Detalhes da simulação para edição:", simulationDetails);

      // Armazenar os dados da simulação para usar no formulário
      setSimulationDetails(simulationDetails);
      setShowSimulationForm(true);
    } catch (err) {
      console.error("Erro ao buscar detalhes da simulação:", err);
      // Mesmo com erro, abrir o formulário
      setShowSimulationForm(true);
    }
  };

  const handleViewDetails = async (reference: string) => {
    console.log("=== DEBUG: Iniciando handleViewDetails ===");
    console.log("Reference:", reference);
    setLoadingDetailsId(reference);
    try {
      const details = await getSimulationDetails(reference);

      setSimulationDetails(details);
      setShowSimulationResults(true);
    } catch (err) {
      setShowSimulationResults(true);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6 p-2 md:p-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
          <input
            type="text"
            placeholder="Buscar simulação..."
            className="pl-8 md:pl-10 bg-white w-full rounded-md border border-gray-300 py-2 md:py-2 px-2 md:px-4 text-xs md:text-base focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="bg-white w-full md:w-1/3 rounded-md border border-gray-300 py-2 md:py-2 px-2 md:px-4 text-xs md:text-base focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200">
            <SelectValue placeholder="Produto" />
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
          className="flex items-center justify-center bg-white rounded-md border border-gray-300 hover:bg-gray-200 py-2 md:py-2 px-3 md:px-4 w-full md:w-auto text-gray-700 text-xs md:text-sm"
          onClick={() => {
            setSearchTerm("");
            setProductFilter("all");
            setStatusFilter("all");
          }}
        >
          <IoMdClose className="size-3 md:size-5 mr-1 md:mr-0" />
          <span className="md:hidden">Limpar</span>
        </Button>
      </div>

      <div className="space-y-3 md:space-y-4 pb-4 px-3 md:px-4">
        {paginatedSimulations.length > 0 ? (
          paginatedSimulations.map((simulation) => (
            <Card key={simulation.simulationNumber} className="overflow-hidden">
              <CardHeader className="p-3 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                  <div className="flex flex-col w-full md:w-auto">
                    <CardTitle className="text-company-blue-600 text-[#002256] text-sm md:text-base">
                      {simulation.productName}
                    </CardTitle>
                    <p className="text-xs md:text-sm text-gray-500">
                      Número Simulação: #{simulation.simulationNumber}
                    </p>
                    <span className="text-xs md:text-sm text-gray-400">
                      Objeto seguro: {simulation.registration}
                    </span>
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <p className="text-xs md:text-sm text-gray-500">
                      Data Simulação
                    </p>
                    <p className="font-medium text-[#002256] text-xs md:text-sm">
                      {formatDate(simulation.startDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-center">
                    <p className="text-xs md:text-sm text-gray-500">
                      Premio Total
                    </p>
                    <p className="font-medium text-[#002256] text-xs md:text-sm">
                      {simulation.totalPremium.toLocaleString(undefined, {
                        style: "currency",
                        currency: "ECV",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
                    <Button
                      onClick={() =>
                        handleViewDetails(
                          simulation.simulationNumber.toString()
                        )
                      }
                      className="flex items-center bg-[#002256] hover:bg-[#002256]/70 gap-2 text-xs md:text-sm py-2 px-3 md:px-4"
                      disabled={
                        loadingDetailsId ===
                        simulation.simulationNumber.toString()
                      }
                    >
                      {loadingDetailsId ===
                      simulation.simulationNumber.toString() ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
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
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            ></path>
                          </svg>
                          Carregando...
                        </span>
                      ) : (
                        <>
                          <FaRegEye />
                          Ver Detalhes
                        </>
                      )}
                    </Button>
                    {/* <Button
                      onClick={() => handleEdit(simulation)}
                      className="flex items-center bg-[#002256] hover:bg-[#002256]/70 gap-2"
                    >
                      <FaRegEdit />
                      Editar
                    </Button> */}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <FaSearch className="text-3xl md:text-4xl text-gray-400" />
            <p className="text-gray-500 text-center text-sm md:text-base">
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
        <div className="flex justify-center items-center gap-1 md:gap-2 mt-4 pb-6 px-3 md:px-4">
          <Button
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg border text-xs md:text-sm ${
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
              className={`px-2 md:px-4 py-1 md:py-2 rounded-lg border text-xs md:text-sm ${
                currentPage === i + 1
                  ? "bg-[#002256] text-white"
                  : "bg-[#E5E7EB] text-[#002256] hover:bg-[#D1D5DB]"
              }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg border text-xs md:text-sm ${
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

      <ModalDetails
        data={{
          info: { count: 1, page: 1, status: 200, errors: null },
          results: simulationDetails || {
            idSimulationTel: 0,
            idContract: 0,
            reference: "",
            totalPremium: 0,
            premium: 0,
            renewalDate: "",
            continuedDate: null,
            clientReference: null,
            producerReference: "",
            product: null,
            propertyGroup: null,
            installmentValues: [],
            simulationObjects: [],
            currency: "CVE",
            currencySymbol: "CVE",
            hasError: false,
            errors: [],
            hasWarnings: false,
            warnings: [],
          },
        }}
        isOpen={showSimulationResults}
        onClose={() => setShowSimulationResults(false)}
        reset={() => {
          setSimulationDetails(null);
          setShowSimulationResults(false);
        }}
      />

      {showSimulationForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 ">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto ">
            <div className="flex justify-between items-center bg-gray-100 p-4">
              <h1 className="text-2xl font-bold text-[#002256]">
                Editar Simulação
              </h1>
              <button onClick={() => setShowSimulationForm(false)}>
                <IoMdClose className="size-5" />
              </button>
            </div>
            <div className="p-4">
              <SimulationForm
                productId={selectedProductId}
                initialData={simulationDetails}
                reset={() => {
                  setShowSimulationForm(false);
                  setSelectedProductId("");
                  setSimulationDetails(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
