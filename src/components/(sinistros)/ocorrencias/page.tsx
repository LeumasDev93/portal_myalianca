/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ListChecks,
  RefreshCw,
  List,
  Grid,
  Eye,
  Search,
  Filter,
  X,
  SearchX,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Ocorrencia } from "@/types/typesData";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserProfile } from "@/hooks/useUserProfile";
import { LoadingContainer } from "@/components/ui/loading-container";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type ViewMode = "grid" | "list";

type OcorrenciasPageProps = {
  onNewOcorrencia: () => void;
  onViewDetails: (id: string) => void;
};

export default function OcorrenciasPage({
  onNewOcorrencia,
  onViewDetails,
}: OcorrenciasPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { toast } = useToast();

  const { profile } = useUserProfile();
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Mapear texto do status
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      P: "Pendente",
      EA: "Em Análise",
      D: "Descartada",
      CS: "Convertida em Sinistro",
      A: "Arquivada",
    };
    return statusMap[status] || "Status Desconhecido";
  };

  // Status com cores específicas
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      P: "bg-yellow-100 text-yellow-800",
      EA: "bg-blue-100 text-blue-800",
      D: "bg-red-100 text-red-800",
      CS: "bg-green-100 text-green-800",
      A: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  // Busca ocorrências
  const fetchOcorrencias = async () => {
    try {
      const response = await fetch(
        `/api/ocorrencia?user_id=${profile?.user?.id}`
      );
      const data = await response.json();

      if (!response.ok) {
        const apiError =
          data?.info?.errors?.[0] || "Erro ao buscar ocorrências.";
        throw new Error(apiError);
      }

      if (!Array.isArray(data.results)) {
        throw new Error("Dados inválidos: 'results' não é um array.");
      }

      setOcorrencias(data.results);
      setError(null);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Erro ao buscar ocorrências:", error);
        setError(error.message || "Erro desconhecido");

        toast({
          title: "Erro ao carregar",
          description:
            error.message ||
            "Ocorreu um erro inesperado ao carregar as ocorrências.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Uso no componente
  useEffect(() => {
    if (profile?.user?.id) {
      fetchOcorrencias();
    }
  }, [profile?.user?.id]); // Adicione profile.id como dependência

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOcorrencias();
  };

  // Filtra as ocorrências
  const filteredOcorrencias = ocorrencias.filter((ocorrencia) => {
    // Filtro por termo de busca
    const matchesSearch =
      searchTerm === "" ||
      ocorrencia.nome_apolice
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ocorrencia.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.id_apolice.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por status
    const matchesStatus =
      statusFilter === "all" || ocorrencia.status === statusFilter;

    // Filtro por tipo
    const matchesTipo =
      tipoFilter === "all" || ocorrencia.tipo_apolice === tipoFilter;

    // Filtro por data
    const matchesDate = () => {
      if (dateFilter === "all") return true;

      const dataRegisto = new Date(ocorrencia.data_registo);
      const hoje = new Date();

      if (dateFilter === "today") {
        return dataRegisto.toDateString() === hoje.toDateString();
      }

      if (dateFilter === "week") {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(hoje.getDate() - 7);
        return dataRegisto >= umaSemanaAtras;
      }

      if (dateFilter === "month") {
        const umMesAtras = new Date();
        umMesAtras.setMonth(hoje.getMonth() - 1);
        return dataRegisto >= umMesAtras;
      }

      return true;
    };

    return matchesSearch && matchesStatus && matchesTipo && matchesDate();
  });

  // Paginação (estilo Apólices)
  const totalItems = filteredOcorrencias.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredOcorrencias.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tipoFilter, dateFilter]);

  // Obtém tipos únicos para o filtro
  const getUniqueTipos = () => {
    const tipos = new Set<string>();
    ocorrencias.forEach((ocorrencia) => {
      tipos.add(ocorrencia.tipo_apolice);
    });
    return Array.from(tipos).sort();
  };

  // Limpa todos os filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTipoFilter("all");
    setDateFilter("all");
  };

  // Contadores para badges
  const activeFilterCount = [
    searchTerm !== "",
    statusFilter !== "all",
    tipoFilter !== "all",
    dateFilter !== "all",
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-12 ">
        <LoadingContainer
          fullHeight={true}
          message="CARREGANDO OCORRÊNCIAS..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-medium">Erro ao carregar ocorrências</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
      {/* Cabeçalho */}
      <div className="flex flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Ocorrências
        </h1>

        <div className="flex flex-col md:flex-row gap-2">
          <Button
            onClick={onNewOcorrencia}
            className="bg-[#002256] hover:bg-[#002256]/70 text-xs sm:text-sm px-2 sm:px-4"
          >
            Nova Ocorrência
          </Button>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 justify-center w-[70%]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar ocorrências..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white text-xs sm:text-sm border border-input text-[#002256] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant={
                  showFilters || activeFilterCount > 0 ? "default" : "outline"
                }
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 w-8"
              >
                <Filter className="h-4 w-4" />
                {/* {activeFilterCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )} */}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                className={`${
                  viewMode === "list"
                    ? "bg-[#002256] text-white border-[#002256] hover:bg-[#002256]/90"
                    : "bg-white border border-[#002256] text-[#002256] hover:bg-[#002256] hover:text-white"
                }`}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                className={`${
                  viewMode === "grid"
                    ? "bg-[#002256] text-white border-[#002256] hover:bg-[#002256]/90"
                    : "bg-white border border-[#002256] text-[#002256] hover:bg-[#002256] hover:text-white"
                }`}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="absolute right-3 top-3 flex gap-2">
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm("")}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="P">Pendente</SelectItem>
                <SelectItem value="EA">Em Análise</SelectItem>
                <SelectItem value="D">Descartada</SelectItem>
                <SelectItem value="CS">Convertida em Sinistro</SelectItem>
                <SelectItem value="A">Arquivada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={tipoFilter}
              onValueChange={(value) => setTipoFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de apólice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {getUniqueTipos().map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer data</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="mt-2 md:col-span-3 text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar todos os filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Controles de visualização */}
      <div className="flex justify-between items-center"></div>

      {/* Lista vazia */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <LoadingContainer
            fullHeight={true}
            message="CARREGANDO OCORRÊNCIAS..."
          />
        </div>
      ) : filteredOcorrencias.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          {activeFilterCount > 0 ? (
            <>
              <SearchX className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                Nenhum resultado encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Sua busca não retornou nenhuma ocorrência com os filtros
                aplicados.
              </p>
              <div className="flex gap-2">
                <Button onClick={clearFilters} variant="outline">
                  Limpar filtros
                </Button>
                <Button onClick={handleRefresh}>Tentar novamente</Button>
              </div>
            </>
          ) : (
            <>
              <ListChecks className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">
                Nenhuma ocorrência registrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Não há ocorrências disponíveis no momento.
              </p>
              <Button onClick={handleRefresh}>
                {refreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Recarregar
              </Button>
            </>
          )}
        </div>
      ) : null}

      {/* Visualização em Grid */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((ocorrencia) => (
            <Card
              key={ocorrencia.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {ocorrencia.nome_apolice}
                    </CardTitle>
                    <CardDescription>
                      #{ocorrencia.tipo_apolice} • #{ocorrencia.id_apolice}
                    </CardDescription>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-lg px-3 py-1 text-xs xl:text-sm font-medium ${getStatusColor(
                      ocorrencia.status
                    )}`}
                  >
                    {getStatusText(ocorrencia.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent></CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {format(
                    new Date(ocorrencia.data_registo),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: pt,
                    }
                  )}
                </span>
                <Button
                  className="flex items-center gap-1 bg-[#002256] hover:bg-[#002256] border border-[#002256] text-white hover:text-white rounded-md px-2 sm:px-4 py-1 sm:py-2"
                  size="sm"
                  onClick={() => onViewDetails(ocorrencia.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Visualização em Lista */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {currentItems.map((ocorrencia) => (
            <Card
              key={ocorrencia.id}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="px-4">
                <div className="flex flex-row  justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#002256]">
                        {ocorrencia.nome_apolice}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1 text-xs xl:text-sm font-medium ${getStatusColor(
                          ocorrencia.status
                        )}`}
                      >
                        {getStatusText(ocorrencia.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      #{ocorrencia.id_apolice} • {ocorrencia.objeto_seguro}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(ocorrencia.data_registo),
                        "dd/MM/yyyy HH:mm",
                        {
                          locale: pt,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col md:items-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => onViewDetails(ocorrencia.id)}
                      className="flex items-center gap-1 bg-[#002256] hover:bg-[#002256] border border-[#002256] text-white hover:text-white rounded-md px-2 sm:px-4 py-1 sm:py-2"
                    >
                      <Eye className="h-4 w-4" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação (estilo Apólices) */}
      {totalItems > ITEMS_PER_PAGE && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4 px-2 md:px-4 py-2">
          <div className="text-[10px] md:text-xs text-gray-600 text-center md:text-left">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, totalItems)} de {totalItems} itens
          </div>
          <div className="flex items-center space-x-1 md:space-x-2 text-[10px] md:text-sm">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#002256] text-white hover:bg-[#002256]/90"
              }`}
              aria-label="Página anterior"
            >
              <FaChevronLeft className="h-2 w-2 2xl:h-3 2xl:w-3" />
            </button>
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 4) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                let startPage = 1;
                if (currentPage <= 2) startPage = 1;
                else if (currentPage >= totalPages - 1) startPage = totalPages - 3;
                else startPage = currentPage - 1;
                for (let i = 0; i < 4; i++) {
                  const pageNum = startPage + i;
                  if (pageNum <= totalPages) pages.push(pageNum);
                }
                if (startPage > 1) pages.unshift("...");
                if (startPage + 3 < totalPages) pages.push("...");
              }
              return pages.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-2 h-2 md:w-4 md:h-4 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={page as number}
                    onClick={() => goToPage(page as number)}
                    className={`w-2 h-2 md:w-6 md:h-6 2xl:w-8 2xl:h-8 rounded-md text-xs md:text-sm font-medium transition-colors ${
                      page === currentPage ? "bg-[#002256] text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1 md:p-2 rounded-md text-xs md:text-sm ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#002256] text-white hover:bg-[#002256]/90"
              }`}
              aria-label="Próxima página"
            >
              <FaChevronRight className="h-2 w-2 2xl:h-3 2xl:w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
