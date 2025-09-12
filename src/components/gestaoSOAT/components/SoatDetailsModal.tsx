/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { FaTrash, FaDownload, FaSpinner, FaEdit } from "react-icons/fa";
import { IoAlertCircleOutline } from "react-icons/io5";
import CollaboratorModal from "./CollaboratorModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { addCollaborator } from "@/service/addCollaboratorService";
import { removeCollaborator } from "@/service/removeCollaboratorService";
import { updateCollaborator } from "@/service/updateCollaboratorService";
import * as XLSX from "xlsx";
import { LoadingContainer } from "@/components/ui/loading-container";

interface SoatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soatDetails: any;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function SoatDetailsModal({
  isOpen,
  onClose,
  soatDetails,
  loading,
  error,
  onRefresh,
}: SoatDetailsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCollaborator, setSelectedCollaborator] = useState<Record<
    string,
    string | number
  > | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Filtrar colaboradores baseado na busca
  const filteredContents =
    soatDetails?.contents?.filter((content: any) => {
      if (!searchQuery) return true;

      try {
        const colaborador = JSON.parse(content.json_content);
        const searchLower = searchQuery.toLowerCase();

        return (
          (colaborador.name &&
            colaborador.name.toLowerCase().includes(searchLower)) ||
          (colaborador.nif &&
            colaborador.nif.toString().includes(searchQuery)) ||
          (colaborador.cargo &&
            colaborador.cargo.toLowerCase().includes(searchLower)) ||
          (colaborador.position &&
            colaborador.position.toLowerCase().includes(searchLower)) ||
          (colaborador.status &&
            colaborador.status.toLowerCase().includes(searchLower))
        );
      } catch {
        return false;
      }
    }) || [];

  // Paginação para colaboradores
  const collaboratorsPagination = usePagination({
    data: filteredContents,
    itemsPerPage: 5,
    sortBy: "created_at", // Assumindo que existe um campo de data de criação
    sortOrder: "desc",
  });

  // Resetar paginação quando o modal for fechado
  useEffect(() => {
    if (!isOpen) {
      collaboratorsPagination.resetPagination();
    }
  }, [isOpen, collaboratorsPagination]);

  if (!isOpen) return null;

  const handleExportToExcel = async () => {
    setExportLoading(true);
    try {
      // Preparar dados para exportação
      const exportData = filteredContents.map((content: any, index: number) => {
        try {
          const colaborador = JSON.parse(content.json_content);
          return {
            Nº: index + 1,
            Nome: colaborador.name || "N/A",
            NIF: colaborador.nif
              ? colaborador.nif
                  .toString()
                  .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
              : "N/A",
            Cargo: colaborador.cargo || colaborador.position || "N/A",
            Salário: colaborador.salary
              ? (colaborador.salary / 100).toLocaleString("pt-CV", {
                  style: "currency",
                  currency: "CVE",
                  minimumFractionDigits: 2,
                })
              : "N/A",
            Status: colaborador.status || "Ativo",
            "Data de Criação": new Date(
              content.created_at || Date.now()
            ).toLocaleDateString("pt-BR"),
          };
        } catch (error) {
          return {
            Nº: index + 1,
            Nome: "Erro ao processar",
            NIF: "N/A",
            Cargo: "N/A",
            Salário: "N/A",
            Status: "N/A",
            "Data de Criação": "N/A",
          };
        }
      });

      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Definir largura das colunas
      const columnWidths = [
        { wch: 5 }, // Nº
        { wch: 25 }, // Nome
        { wch: 15 }, // NIF
        { wch: 20 }, // Cargo
        { wch: 15 }, // Salário
        { wch: 12 }, // Status
        { wch: 15 }, // Data de Criação
      ];
      worksheet["!cols"] = columnWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Colaboradores");

      // Gerar nome do arquivo
      const fileName = `Colaboradores_${soatDetails.mes_referente.replace(
        "_",
        "_"
      )}_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Exportar arquivo
      XLSX.writeFile(workbook, fileName);

      console.log("Arquivo Excel exportado com sucesso:", fileName);
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      alert("Erro ao exportar arquivo Excel. Tente novamente.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleEditCollaborator = (content: any) => {
    try {
      const collaborator = JSON.parse(content.json_content);
      // Incluir o ID do colaborador nos dados selecionados
      setSelectedCollaborator({
        ...collaborator,
        id: content.id, // ID do colaborador para a API
      });
      setModalMode("edit");
      setShowCollaboratorModal(true);
    } catch (error) {
      console.error("Erro ao processar dados do colaborador:", error);
    }
  };

  const handleSaveCollaborator = async (
    collaboratorData: Record<string, string | number>
  ) => {
    setModalLoading(true);
    try {
      if (modalMode === "edit") {
        // Lógica para editar colaborador
        console.log("Editando colaborador:", collaboratorData);
        console.log("ID do colaborador:", selectedCollaborator?.id);
        console.log("ID do SOAT:", soatDetails?.id);

        if (!selectedCollaborator?.id || !soatDetails?.id) {
          throw new Error("ID do colaborador ou SOAT não encontrado");
        }

        // Preparar os dados para a API
        const requestData = {
          id_soat: soatDetails.id,
          json_content: JSON.stringify(collaboratorData),
        };

        console.log("Dados da requisição de edição:", requestData);

        // Chamar a API para editar o colaborador
        const response = await updateCollaborator(
          selectedCollaborator.id.toString(),
          requestData
        );

        if (response.info.status === 200) {
          console.log("Colaborador editado com sucesso:", response);

          // Fechar modal após sucesso
          setShowCollaboratorModal(false);
          setSelectedCollaborator(null);

          // Recarregar dados da tabela de colaboradores
          if (onRefresh) {
            onRefresh();
          }
        } else {
          throw new Error(response.info.errors || "Erro ao editar colaborador");
        }
      } else {
        // Lógica para adicionar colaborador
        console.log("Adicionando colaborador:", collaboratorData);
        console.log("ID do SOAT:", soatDetails?.id);

        if (!soatDetails?.id) {
          throw new Error("ID do SOAT não encontrado");
        }

        // Preparar os dados para a API
        const requestData = {
          id_soat: soatDetails.id,
          json_content: JSON.stringify(collaboratorData),
        };

        console.log("Dados da requisição:", requestData);

        // Chamar a API para adicionar o colaborador
        const response = await addCollaborator(requestData);

        if (response.info.status === 200) {
          console.log("Colaborador adicionado com sucesso:", response);

          // Fechar modal após sucesso
          setShowCollaboratorModal(false);
          setSelectedCollaborator(null);

          // Recarregar dados da tabela de colaboradores
          if (onRefresh) {
            onRefresh();
          }
        } else {
          throw new Error(
            response.info.errors || "Erro ao adicionar colaborador"
          );
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar colaborador:", error);
      // Aqui você pode mostrar uma notificação de erro para o usuário
      alert(
        `Erro ao ${
          modalMode === "edit" ? "editar" : "adicionar"
        } colaborador: ${error.message}`
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseCollaboratorModal = () => {
    setShowCollaboratorModal(false);
    setSelectedCollaborator(null);
  };

  const handleAddCollaborator = () => {
    setModalMode("add");
    setSelectedCollaborator(null);
    setShowCollaboratorModal(true);
  };

  const handleRemoveCollaborator = (content: any) => {
    setCollaboratorToRemove(content);
    setShowConfirmModal(true);
  };

  const confirmRemoveCollaborator = async () => {
    if (!collaboratorToRemove) return;

    try {
      const collaboratorId = collaboratorToRemove.id;

      if (!collaboratorId) {
        throw new Error("ID do colaborador não encontrado");
      }

      setRemoveLoading(collaboratorId);

      console.log("Removendo colaborador:", collaboratorId);

      // Chamar a API para remover o colaborador
      const response = await removeCollaborator(collaboratorId);

      if (response.info.status === 200) {
        console.log("Colaborador removido com sucesso:", response);

        // Fechar modal de confirmação
        setShowConfirmModal(false);
        setCollaboratorToRemove(null);

        // Recarregar dados da tabela de colaboradores
        if (onRefresh) {
          onRefresh();
        }

        console.log("Colaborador removido com sucesso!");
      } else {
        throw new Error(response.info.errors || "Erro ao remover colaborador");
      }
    } catch (error: any) {
      console.error("Erro ao remover colaborador:", error);
    } finally {
      setRemoveLoading(null);
    }
  };

  const cancelRemoveCollaborator = () => {
    setShowConfirmModal(false);
    setCollaboratorToRemove(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingContainer message="Carregando detalhes..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <IoAlertCircleOutline className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">
                  Serviços temporariamente indisponível! Tente novamente mais
                  tarde.
                </p>
              </div>
            </div>
          </div>
        ) : soatDetails ? (
          <div>
            {/* Header com informações do arquivo */}
            <div className=" text-[#002256] p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      Colaboradores -{" "}
                      {soatDetails.mes_referente.replace("_", " de ")}
                    </h2>
                    {soatDetails.situacao === "Enviado" && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Enviado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>Arquivo: {soatDetails.nome_ficheiro}</span>
                    {/* <span>|</span>
                    <span>
                      Total: {soatDetails.total_colaborador} colaboradores
                    </span> */}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#002256] hover:text-[#002256]/70 text-2xl"
                >
                  <X />
                </button>
              </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <h2 className="text-sm text-left text-[#002256]">
                    {searchQuery
                      ? "Colaboradores Filtrados"
                      : "Total de Colaboradores"}
                  </h2>
                  <div className="text-2xl text-left font-bold text-[#002256]">
                    {filteredContents.length}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm text-left text-[#002256]">
                    Colaboradores Ativos
                  </div>
                  <div className="text-2xl text-left font-bold text-green-600">
                    {filteredContents.length}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm text-left text-[#002256]">
                    Valor Total
                  </div>
                  <div className="text-xl text-left font-bold text-[#002256]">
                    {(
                      filteredContents.reduce((total: number, content: any) => {
                        try {
                          const colaborador = JSON.parse(content.json_content);
                          return total + (colaborador.salary || 0);
                        } catch {
                          return total;
                        }
                      }, 0) / 100
                    ).toLocaleString("pt-CV", {
                      style: "currency",
                      currency: "CVE",
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-sm text-left text-[#002256]">
                    Data de Criação
                  </div>
                  <div className="text-xl text-left font-semibold text-[#002256]">
                    {new Date(soatDetails.data_criacao).toLocaleDateString(
                      "pt-BR"
                    )}
                  </div>
                </div>
              </div>

              {/* Barra de busca */}
              <div className="mb-4 flex items-center justify-between">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    placeholder="Buscar Colaborador (nome, NIF, cargo, status)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {soatDetails?.situacao !== "Enviado" && (
                  <button
                    onClick={handleAddCollaborator}
                    className="cursor-pointer bg-[#002256] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors hover:bg-[#002256]/90"
                  >
                    <Plus /> Adicionar Colaborador
                  </button>
                )}
              </div>
            </div>

            {/* Tabela de colaboradores */}
            <div className="px-6 pb-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salário
                      </th>
                      {soatDetails?.situacao !== "Enviado" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-gra-100 divide-y divide-gray-200">
                    {collaboratorsPagination.paginatedData.length > 0 ? (
                      collaboratorsPagination.paginatedData.map(
                        (content: any) => {
                          try {
                            const colaborador = JSON.parse(
                              content.json_content
                            );
                            return (
                              <tr key={content.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {colaborador.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {colaborador.nif
                                    ? colaborador.nif
                                        .toString()
                                        .replace(
                                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                          "$1.$2.$3-$4"
                                        )
                                    : "N/A"}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {colaborador.salary
                                    ? (colaborador.salary / 100).toLocaleString(
                                        "pt-CV",
                                        {
                                          style: "currency",
                                          currency: "CVE",
                                          minimumFractionDigits: 2,
                                        }
                                      )
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {soatDetails?.situacao !== "Enviado" && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditCollaborator(content)
                                        }
                                        className="bg-blue-50 border border-blue-200 flex  items-center justify-center p-2 text-blue-600  cursor-pointer hover:text-blue-800 rounded"
                                        title="Editar colaborador"
                                      >
                                        <FaEdit className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="bg-red-50 border border-red-200 flex  items-center justify-center text-red-600  cursor-pointer hover:text-red-800 p-2 rounded"
                                        title="Excluir colaborador"
                                        onClick={() =>
                                          handleRemoveCollaborator(content)
                                        }
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          } catch {
                            return (
                              <tr key={content.id} className="hover:bg-gray-50">
                                <td
                                  colSpan={
                                    soatDetails?.situacao === "Enviado" ? 4 : 5
                                  }
                                  className="px-6 py-4 text-center text-sm text-red-600"
                                >
                                  Erro ao processar dados do colaborador
                                </td>
                              </tr>
                            );
                          }
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={soatDetails?.situacao === "Enviado" ? 4 : 5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          {searchQuery ? (
                            <div>
                              <p className="text-sm">
                                Nenhum colaborador encontrado para &quot;
                                {searchQuery}&quot;
                              </p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="text-[#002256] hover:underline mt-2 text-sm"
                              >
                                Limpar filtro
                              </button>
                            </div>
                          ) : (
                            "Nenhum colaborador encontrado"
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação para colaboradores */}
            {collaboratorsPagination.totalPages > 1 && (
              <Pagination
                currentPage={collaboratorsPagination.currentPage}
                totalPages={collaboratorsPagination.totalPages}
                onPageChange={collaboratorsPagination.goToPage}
                onNext={collaboratorsPagination.nextPage}
                onPrev={collaboratorsPagination.prevPage}
                canGoNext={collaboratorsPagination.canGoNext}
                canGoPrev={collaboratorsPagination.canGoPrev}
                totalItems={collaboratorsPagination.totalItems}
                startIndex={collaboratorsPagination.startIndex}
                endIndex={collaboratorsPagination.endIndex}
              />
            )}
            {/* Footer com botões */}
            <div className="px-6 py-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportToExcel}
                    disabled={exportLoading || filteredContents.length === 0}
                    className="bg-[#002256] hover:bg-[#002256]/80 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    {exportLoading ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaDownload className="w-4 h-4" />
                    )}
                    {exportLoading ? "Exportando..." : "Exportar Lista"}
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gray-400  cursor-pointer hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Modal Unificado de Colaborador */}
      <CollaboratorModal
        isOpen={showCollaboratorModal}
        onClose={handleCloseCollaboratorModal}
        onSave={handleSaveCollaborator}
        loading={modalLoading}
        fields={soatDetails?.fields || []}
        mode={modalMode}
        collaborator={selectedCollaborator}
      />

      {/* Modal de Confirmação para Remover Colaborador */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={cancelRemoveCollaborator}
        onConfirm={confirmRemoveCollaborator}
        title="Remover Colaborador"
        message={`Tem certeza que deseja remover este colaborador? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        loading={removeLoading === collaboratorToRemove?.id}
        type="danger"
      />
    </div>
  );
}
