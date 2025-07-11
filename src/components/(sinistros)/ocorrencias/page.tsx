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
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useUserProfile } from "@/hooks/useUserProfile ";

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

  // Busca ocorrências
  const fetchOcorrencias = async () => {
    try {
      const response = await fetch(
        `/api/ocorrencia?user_id=${profile?.user?.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.info?.errors?.[0] || "Erro ao buscar ocorrências"
        );
      }

      setOcorrencias(data.results);
      setError(null);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Erro ao buscar ocorrências:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        toast({
          title: "Erro",
          description: "Não foi possível carregar as ocorrências",
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
        <LoadingScreen />
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
    <div className="flex-1 space-y-6 p-6 md:p-8">
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
                    ? "bg-[#002256] hover:bg-[#002256]/70"
                    : "bg-white border border-input text-[#002256] hover:bg-[#002256]/70"
                }`}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                className={`${
                  viewMode === "grid"
                    ? "bg-[#002256] hover:bg-[#002256]/70"
                    : "bg-white border border-input text-[#002256] hover:bg-[#002256]/70"
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
                <SelectItem value="P">Pendentes</SelectItem>
                <SelectItem value="R">Resolvidos</SelectItem>
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
          <LoadingScreen />
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
          {filteredOcorrencias.map((ocorrencia) => (
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
                    className={`inline-flex items-center rounded-lg px-3 py-1 text-xs xl:text-sm font-medium ${
                      ocorrencia.status === "P"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {ocorrencia.status === "P" ? "Pendente" : "Resolvido"}
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
          {filteredOcorrencias.map((ocorrencia) => (
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
                        className={`inline-flex items-center rounded-lg px-3 py-1 text-xs xl:text-sm font-medium ${
                          ocorrencia.status === "P"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {ocorrencia.status === "P" ? "Pendente" : "Resolvido"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      #{ocorrencia.tipo_apolice} • #{ocorrencia.id_apolice}
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
    </div>
  );
}
