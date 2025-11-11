/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaPaperPlane,
  FaTrash,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";
import { BsCashCoin } from "react-icons/bs";
import {
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoListOutline,
} from "react-icons/io5";
import {
  StatisticsCard,
  StatisticData,
} from "@/components/empresarial/components/StatisticsCard";
import { useSoat } from "@/hooks/useSoat";
import { useSoatDetails } from "@/hooks/useSoatDetails";
import SoatDetailsModal from "./components/SoatDetailsModal";
import AddSoatModal from "./components/AddSoatModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { removeSoat } from "@/service/removeSoatService";
import { sendSoat } from "@/service/sendSoatService";
import { X } from "lucide-react";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function PageGestaoSOAT() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSoatId, setSelectedSoatId] = useState<string>("");
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [soatToRemove, setSoatToRemove] = useState<any>(null);
  const [sendLoading, setSendLoading] = useState<string | null>(null);
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false);
  const [soatToSend, setSoatToSend] = useState<any>(null);
  const [showPendingWarningModal, setShowPendingWarningModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [downloadTemplateLoading, setDownloadTemplateLoading] = useState(false);
  const [rowDownloadLoading, setRowDownloadLoading] = useState<string | null>(
    null
  );

  const { soatData, loading, refetch } = useSoat();
  const {
    soatDetails,
    loading: detailsLoading,
    error: detailsError,
    fetchSoatDetails,
    clearDetails,
  } = useSoatDetails();

  // Calcular estatísticas dinamicamente
  const listasVencidas = soatData.filter(
    (lista) => lista.estado === "Vencido"
  ).length;
  // Pegar apenas o total de colaboradores da última linha adicionada (mais recente)
  const totalTrabalhadores =
    soatData.length > 0 ? soatData[0].total_colaborador : 0;
  // Pegar o valor total da SOAT mais recente
  const valorTotalMaisRecente =
    soatData.length > 0 ? soatData[0].valor_total || "N/A" : "N/A";
  const totalListas = soatData.length;

  // Verificar se existe SOAT com estado pendente
  const hasPendingSoat = soatData.some((soat) => soat.situacao === "Pendente");

  // Função para formatar valores monetários
  const formatCurrency = (
    value: string | number | null | undefined
  ): string => {
    if (!value || value === "N/A" || value === "") return "N/A";

    // Se for string, tentar converter para número
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) return "N/A";

    // Formatar como moeda (Escudo Cabo-verdiano)
    return new Intl.NumberFormat("pt-CV", {
      style: "currency",
      currency: "CVE",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  // Limpar detalhes quando o modal for fechado
  useEffect(() => {
    if (!showDetailsModal) {
      // Limpar detalhes após um pequeno delay para evitar problemas de reabertura
      const timer = setTimeout(() => {
        clearDetails();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDetailsModal, clearDetails]);

  // Dados das estatísticas SOAT (calculadas dinamicamente)
  const soatStats: StatisticData[] = [
    {
      title: "Valor Total",
      amount: formatCurrency(valorTotalMaisRecente),
      description: "Último período",
      icon: BsCashCoin,
      color: "green",
    },
    {
      title: "Listas Vencidas",
      amount: listasVencidas.toString(),
      description: "Necessitam atualização",
      icon: IoAlertCircleOutline,
      color: "red",
    },
    {
      title: "Total Trabalhadores",
      amount: totalTrabalhadores.toString(),
      description: "Cadastrados",
      icon: IoPeopleOutline,
      color: "blue",
    },
    {
      title: "Total de Listas",
      amount: totalListas.toString(),
      description: "Criadas",
      icon: IoListOutline,
      color: "purple",
    },
  ];

  // Função para filtrar as listas baseado na busca
  const filteredListas = soatData.filter((lista) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      lista.mes_referente?.toLowerCase().includes(searchLower) ||
      lista.nome_ficheiro?.toLowerCase().includes(searchLower) ||
      lista.data_criacao?.includes(searchQuery) ||
      (lista.valor_total &&
        String(lista.valor_total || "")
          .toLowerCase()
          .includes(searchLower)) ||
      lista.estado?.toLowerCase().includes(searchLower) ||
      lista.situacao?.toLowerCase().includes(searchLower)
    );
  });

  // Paginação para SOATs
  const soatsPagination = usePagination({
    data: filteredListas,
    itemsPerPage: 5,
    sortBy: "data_criacao", // Usando data_criacao que existe nos dados
    sortOrder: "desc",
  });

  // Função para abrir modal de detalhes
  const handleViewDetails = async (soatId: string) => {
    // Se for um SOAT diferente do atual, limpar detalhes
    if (selectedSoatId !== soatId) {
      clearDetails();
    }
    setSelectedSoatId(soatId);
    setShowDetailsModal(true);
    await fetchSoatDetails(soatId);
  };

  // Função para verificar se pode criar novo SOAT
  const handleCreateSOATClick = () => {
    if (hasPendingSoat) {
      setShowPendingWarningModal(true);
    } else {
      setShowModal(true);
    }
  };

  // Função para baixar template SOAT
  const handleDownloadTemplate = async () => {
    setDownloadTemplateLoading(true);
    try {
      const response = await fetch("/api/soat/template/download", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao baixar template");
      }

      // Obter o nome do arquivo do header Content-Disposition
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "template_soat.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
      setErrorMessage("Erro ao baixar template SOAT");
      setShowError(true);
    } finally {
      setDownloadTemplateLoading(false);
    }
  };

  // Download de uma lista SOAT específica
  const handleDownloadSoat = async (soatId: string, suggestedName?: string) => {
    try {
      setRowDownloadLoading(soatId);
      const response = await fetch(`/api/soat/${soatId}/download`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Erro ao baixar SOAT");
      }

      // Tentar obter nome do arquivo
      const contentDisposition = response.headers.get("content-disposition");
      let filename = suggestedName || `soat_${soatId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar SOAT:", error);
      showErrorMessage("Erro ao baixar SOAT");
    } finally {
      setRowDownloadLoading(null);
    }
  };

  // Função para criar nova lista SOAT
  const handleCreateSOAT = async (data: {
    periodo: string;
    mes: string;
    ano: string;
    mesInicio: string;
    anoInicio: string;
    mesFim: string;
    anoFim: string;
  }) => {
    try {
      console.log("Dados do formulário:", data);
      // Aqui você pode implementar a chamada para a API para criar um novo SOAT
      // Por enquanto, vamos apenas recarregar os dados
      await refetch();
    } catch (error) {
      console.error("Erro ao criar SOAT:", error);
    }
  };

  const handleRemoveSoat = (soat: any) => {
    setSoatToRemove(soat);
    setShowConfirmModal(true);
  };

  const confirmRemoveSoat = async () => {
    if (!soatToRemove) return;

    try {
      const soatId = soatToRemove.id;

      if (!soatId) {
        throw new Error("ID do SOAT não encontrado");
      }

      setRemoveLoading(soatId);

      console.log("Removendo SOAT:", soatId);

      // Chamar a API para remover o SOAT
      const response = await removeSoat(soatId);

      if (response.info.status === 200) {
        console.log("SOAT removido com sucesso:", response);

        // Fechar modal de confirmação
        setShowConfirmModal(false);
        setSoatToRemove(null);

        // Recarregar dados após remover
        refetch();
      } else {
        throw new Error(response.info.errors || "Erro ao remover SOAT");
      }
    } catch (error: any) {
      console.error("Erro ao remover SOAT:", error);
      showErrorMessage(`Erro ao remover SOAT: ${error.message}`);
    } finally {
      setRemoveLoading(null);
    }
  };

  const cancelRemoveSoat = () => {
    setShowConfirmModal(false);
    setSoatToRemove(null);
  };

  const handleSendSoat = (soat: any) => {
    setSoatToSend(soat);
    setShowSendConfirmModal(true);
  };

  const confirmSendSoat = async () => {
    if (!soatToSend?.id) {
      showErrorMessage("ID do SOAT não encontrado");
      return;
    }

    setSendLoading(soatToSend.id);
    try {
      console.log("Enviando SOAT:", soatToSend.id);

      const response = await sendSoat({
        soatId: soatToSend.id,
      });

      console.log("SOAT enviado com sucesso:", response);

      // Fechar modal de confirmação
      setShowSendConfirmModal(false);
      setSoatToSend(null);

      // Recarregar dados após envio
      refetch();
    } catch (error: any) {
      console.error("Erro ao enviar SOAT:", error);
      showErrorMessage(`Erro ao enviar SOAT: ${error.message}`);
    } finally {
      setSendLoading(null);
    }
  };

  const cancelSendSoat = () => {
    setShowSendConfirmModal(false);
    setSoatToSend(null);
  };

  const closePendingWarningModal = () => {
    setShowPendingWarningModal(false);
  };

  // Função para mostrar erros na interface
  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
    // Auto-hide após 5 segundos
    setTimeout(() => {
      setShowError(false);
      setErrorMessage("");
    }, 5000);
  };

  // Função para fechar mensagem de erro
  const closeErrorMessage = () => {
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-4 xl:p-6 w-full mt-3 sm:mt-4 md:mt-5 lg:mt-5 xl:mt-6">
      <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#002256] mb-1 sm:mb-1.5 md:mb-2">
          Gestão de SOAT
        </h1>
        <p className="text-[10px] sm:text-xs md:text-sm lg:text-sm text-[#002856] leading-tight">
          Gerencie o Seguro Obrigatório de Acidentes de Trânsito dos
          trabalhadores da empresa
        </p>
      </div>

      {/* Mensagem de Erro */}
      {showError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <IoAlertCircleOutline className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={closeErrorMessage}
            className="text-red-600 hover:text-red-800 font-bold text-lg"
          >
            <X />
          </button>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-8">
        <StatisticsCard statistics={soatStats} />
      </div>

      {/* Seção Buscar */}
      <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg font-semibold text-[#002256] mb-1.5 sm:mb-2">Buscar</h2>
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 justify-between">
          <div className="sm:w-1/2 w-full relative">
            <input
              type="text"
              placeholder="Buscar por mês ou arquivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 sm:pl-9 md:pl-10 lg:pl-10 pr-7 sm:pr-9 md:pr-10 lg:pr-10 py-1.5 sm:py-2 md:py-2.5 lg:py-2.5 xl:py-3 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base"
            />
            <FaSearch className="absolute left-1.5 sm:left-2.5 md:left-3 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs md:text-sm" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 sm:right-2.5 md:right-3 lg:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs sm:text-sm md:text-base"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-2.5 xl:gap-3 flex-shrink-0">
            <button
              onClick={handleDownloadTemplate}
              disabled={downloadTemplateLoading}
              className="px-1.5 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2.5 xl:px-6 xl:py-3 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base rounded-md sm:rounded-lg font-medium flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 transition-colors bg-[#002256] hover:bg-[#002256]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {downloadTemplateLoading ? (
                <FaSpinner className="animate-spin w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              ) : (
                <FaDownload className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              )}
              <span className="hidden sm:inline">{downloadTemplateLoading ? "Baixando..." : "Baixar Template"}</span>
              <span className="sm:hidden">Temp.</span>
            </button>
            <button
              onClick={handleCreateSOATClick}
              className="px-1.5 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2 lg:px-4 lg:py-2.5 xl:px-6 xl:py-3 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base rounded-md sm:rounded-lg font-medium flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-1.5 xl:gap-2 transition-colors bg-[#B7021C] hover:bg-[#B7021C]/90 text-white whitespace-nowrap"
              title={
                hasPendingSoat
                  ? "Existe um SOAT pendente. Finalize-o antes de criar um novo."
                  : "Adicionar novo SOAT"
              }
            >
              <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Adicionar SOAT</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Listas de SOAT */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-3 md:px-4 lg:px-6 py-3 md:py-4 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-bold text-[#002256]">Listas de SOAT</h3>
          <p className="text-xs md:text-sm text-gray-600">
            Todas as listas mensais de SOAT dos trabalhadores
          </p>
          <p className="text-[10px] text-gray-400 mt-1 lg:hidden">
            ← Deslize para ver mais →
          </p>
        </div>

        <div className="overflow-x-auto overflow-y-visible w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês Ref.
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivo
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trabalhadores
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <TableSkeleton rows={5} columns={8} />
              ) : soatData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <IoListOutline className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma lista criada ainda
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Clique em &quot;Adicionar SOAT&quot; para criar sua
                        primeira lista de trabalhadores.
                      </p>
                      <button
                        onClick={handleCreateSOATClick}
                        disabled={hasPendingSoat}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                          hasPendingSoat
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                            : "bg-[#B7021C] hover:bg-[#B7021C]/90 text-white"
                        }`}
                        title={
                          hasPendingSoat
                            ? "Existe um SOAT pendente. Finalize-o antes de criar um novo."
                            : "Adicionar novo SOAT"
                        }
                      >
                        <FaPlus className="w-4 h-4" />
                        Adicionar SOAT
                      </button>
                    </div>
                  </td>
                </tr>
              ) : soatsPagination.paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FaSearch className="w-8 h-8 text-gray-300 mb-2" />
                      <p>
                        Nenhum resultado encontrado para &quot;{searchQuery}
                        &quot;
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                soatsPagination.paginatedData.map((lista) => (
                  <tr key={lista.id} className="hover:bg-gray-50">
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-red-600 font-medium">
                      {lista.mes_referente}
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-red-600">
                      {lista.nome_ficheiro}
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                      {new Date(lista.data_criacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                      {lista.total_colaborador}
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                      {formatCurrency(lista.valor_total)}
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {lista.situacao === "Enviado" ? (
                          <>
                            <span className="text-green-600 text-xs md:text-sm mr-1 md:mr-2">
                              ✓
                            </span>
                            <span className="text-green-600 text-xs md:text-sm">
                              Enviado
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-600 text-xs md:text-sm">
                            {lista.situacao}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      <div className="flex space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleViewDetails(lista.id)}
                          className="bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:text-blue-800 p-1.5 md:p-2 cursor-pointer rounded"
                        >
                          <FaEye className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        {lista.situacao !== "Enviado" && (
                          <>
                            <button
                              onClick={() => handleSendSoat(lista)}
                              className="bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:text-blue-800 p-1.5 md:p-2 cursor-pointer rounded"
                              title="Enviar SOAT"
                            >
                              <FaPaperPlane className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <button
                              className="bg-red-50 border border-red-200 flex items-center justify-center text-red-600 hover:text-red-800 p-1.5 md:p-2 rounded cursor-pointer"
                              onClick={() => handleRemoveSoat(lista)}
                            >
                              <FaTrash className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="bg-green-50 border border-green-200 flex items-center justify-center text-green-600 hover:text-green-800 p-1.5 md:p-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() =>
                            handleDownloadSoat(
                              lista.id,
                              lista.nome_ficheiro || undefined
                            )
                          }
                          disabled={rowDownloadLoading === lista.id}
                          title="Baixar SOAT"
                        >
                          {rowDownloadLoading === lista.id ? (
                            <FaSpinner className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            <FaDownload className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação para SOATs */}
      {soatsPagination.totalPages > 1 && (
        <Pagination
          currentPage={soatsPagination.currentPage}
          totalPages={soatsPagination.totalPages}
          onPageChange={soatsPagination.goToPage}
          onNext={soatsPagination.nextPage}
          onPrev={soatsPagination.prevPage}
          canGoNext={soatsPagination.canGoNext}
          canGoPrev={soatsPagination.canGoPrev}
          totalItems={soatsPagination.totalItems}
          startIndex={soatsPagination.startIndex}
          endIndex={soatsPagination.endIndex}
        />
      )}

      {/* Modal Adicionar Nova Lista de SOAT */}
      <AddSoatModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateSOAT}
      />

      {/* Modal Detalhes do SOAT */}
      <SoatDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          // Não limpar os detalhes imediatamente para evitar problemas de reabertura
          // clearDetails();
        }}
        soatDetails={soatDetails}
        loading={detailsLoading}
        error={detailsError}
        onRefresh={() => {
          // Atualizar dados principais do SOAT (para atualizar total_colaborador)
          refetch();
          // Atualizar detalhes do SOAT selecionado
          if (selectedSoatId) {
            fetchSoatDetails(selectedSoatId);
          }
        }}
      />

      {/* Modal de Confirmação para Remover SOAT */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={cancelRemoveSoat}
        onConfirm={confirmRemoveSoat}
        title="Remover SOAT"
        message={`Tem certeza que deseja remover este SOAT? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        loading={removeLoading === soatToRemove?.id}
        type="danger"
      />

      {/* Modal de Confirmação para Enviar SOAT */}
      <ConfirmationModal
        isOpen={showSendConfirmModal}
        onClose={cancelSendSoat}
        onConfirm={confirmSendSoat}
        title="Enviar SOAT"
        message={`Tem certeza que deseja enviar este SOAT?`}
        confirmText="Enviar"
        cancelText="Cancelar"
        loading={sendLoading === soatToSend?.id}
        type="info"
      />

      {/* Modal de Aviso - SOAT Pendente */}
      <ConfirmationModal
        isOpen={showPendingWarningModal}
        onClose={closePendingWarningModal}
        onConfirm={closePendingWarningModal}
        title=" SOAT Pendente"
        message={
          <div className="space-y-3">
            <div className="text-red-600 font-semibold">
              🚫 NÃO É POSSÍVEL CRIAR UM NOVO SOAT NO MOMENTO
            </div>

            <div>
              <div className="font-semibold mb-2">📋 SITUAÇÃO ATUAL:</div>
              <div className="ml-4">
                • Existe um SOAT com estado &quot;Pendente&quot; na sua lista
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">
                ✅ PARA CRIAR UM NOVO SOAT, VOCÊ DEVE PRIMEIRO:
              </div>
              <div className="ml-4 space-y-1">
                <div>1️⃣ Finalizar o SOAT pendente</div>
                <div>2️⃣ Adicionar todos os colaboradores necessários</div>
                <div>3️⃣ Enviar o SOAT para processamento</div>
              </div>
            </div>

            <div className="text-blue-600">
              💡 Após completar essas etapas, você poderá criar um novo SOAT.
            </div>
          </div>
        }
        confirmText="OK"
        loading={false}
        type="warning"
      />
    </div>
  );
}
