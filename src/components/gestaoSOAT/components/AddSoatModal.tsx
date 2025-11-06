/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { FaSpinner, FaUpload } from "react-icons/fa";
import { addSoat } from "@/service/addSoatService";
import { AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ModalData {
  periodo: string;
  mes: string;
  ano: string;
  mesInicio: string;
  anoInicio: string;
  mesFim: string;
  anoFim: string;
}

interface AddSoatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: ModalData) => void;
}

export default function AddSoatModal({
  isOpen,
  onClose,
  onCreate,
}: AddSoatModalProps) {
  const [modalData, setModalData] = useState<ModalData>({
    periodo: "especifico", // "especifico" ou "intervalo"
    mes: "",
    ano: "",
    mesInicio: "",
    anoInicio: "",
    mesFim: "",
    anoFim: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { profile } = useUserProfile();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setModalData({
      periodo: "especifico",
      mes: "",
      ano: "",
      mesInicio: "",
      anoInicio: "",
      mesFim: "",
      anoFim: "",
    });
    setError(null);
    setSelectedFile(null);
    onClose();
  };

  // Função para lidar com o upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo Excel
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(
          "Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)"
        );
        return;
      }

      // Verificar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("O arquivo deve ter no máximo 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  // Função para processar o upload quando criar lista
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo para importar");
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Construir URL com parâmetros baseados no modalData
      let uploadUrl = "/api/soat/upload?";

      if (modalData.periodo === "especifico") {
        uploadUrl += `inicio_mes_referente=${modalData.mes}&fim_mes_referente=${modalData.mes}&inicio_ano_referente=${modalData.ano}&fim_ano_referente=${modalData.ano}`;
      } else {
        uploadUrl += `inicio_mes_referente=${modalData.mesInicio}&fim_mes_referente=${modalData.mesFim}&inicio_ano_referente=${modalData.anoInicio}&fim_ano_referente=${modalData.anoFim}`;
      }

      if (profile?.user?.id) {
        uploadUrl += `&id_utilizador=${profile.user.id}`;
      }

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload do arquivo");
      }

      await response.json();

      // Fechar modal e limpar dados
      setSelectedFile(null);
      handleClose();

      // Chamar onCreate para atualizar a lista
      onCreate(modalData);
    } catch (error) {
      setError("Erro ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setUploadLoading(false);
    }
  };

  const isFormValid = () => {
    if (modalData.periodo === "especifico") {
      return modalData.mes && modalData.ano;
    } else {
      return (
        modalData.mesInicio &&
        modalData.anoInicio &&
        modalData.mesFim &&
        modalData.anoFim
      );
    }
  };

  const handleCreate = async () => {
    if (!isFormValid()) return;

    // Se há arquivo selecionado, fazer upload
    if (selectedFile) {
      await handleUploadFile();
      return;
    }

    // Se não há arquivo, criar SOAT normalmente
    setLoading(true);
    try {
      // ID do utilizador fixo (você pode pegar do contexto de autenticação)
      const idUtilizador = profile?.user?.id || "";

      let requestData;

      if (modalData.periodo === "especifico") {
        // JSON para mês específico
        requestData = {
          inicio_mes_referente: parseInt(modalData.mes),
          inicio_ano_referente: parseInt(modalData.ano),
          id_utilizador: idUtilizador,
        };
      } else {
        // JSON para intervalo de meses
        requestData = {
          inicio_mes_referente: parseInt(modalData.mesInicio),
          fim_mes_referente: parseInt(modalData.mesFim),
          inicio_ano_referente: parseInt(modalData.anoInicio),
          fim_ano_referente: parseInt(modalData.anoFim),
          id_utilizador: idUtilizador,
        };
      }

      // Chamar a API para criar o SOAT
      const response = await addSoat(requestData);

      if (response.info.status === 200) {
        onCreate(modalData);

        // Fechar modal
        handleClose();
      } else {
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <div className="p-3 md:p-4 lg:p-6">
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-[#002256] mb-1 md:mb-2">
            Adicionar Nova Lista de SOAT
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 lg:mb-6">
            Crie uma nova lista de SOAT para um mês específico. Os dados serão
            importados do Excel configurado no backend.
          </p>
          {error && (
            <div className="flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-lg py-2 px-3 md:px-4 mb-3 md:mb-4">
              <AlertTriangle color="#B7021C" size={16} className="md:w-5 md:h-5" />
              <p className="text-xs md:text-sm text-red-500">{error}</p>
            </div>
          )}
          {/* Período */}
          <div className="mb-3 md:mb-4 lg:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
              Período <span className="text-red-500">*</span>
            </label>

            <div className="space-y-2 md:space-y-3">
              <label className="flex items-start md:items-center space-x-2 md:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="periodo"
                  value="especifico"
                  checked={modalData.periodo === "especifico"}
                  onChange={(e) =>
                    setModalData({ ...modalData, periodo: e.target.value })
                  }
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#002256] border-gray-300 focus:ring-[#002256] mt-0.5 md:mt-0"
                />
                <div>
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <span className="text-sm md:text-base">📅</span>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">
                      Mês Específico
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 ml-5 md:ml-6">
                    Criar lista para um único mês
                  </p>
                </div>
              </label>

              <label className="flex items-start md:items-center space-x-2 md:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="periodo"
                  value="intervalo"
                  checked={modalData.periodo === "intervalo"}
                  onChange={(e) =>
                    setModalData({ ...modalData, periodo: e.target.value })
                  }
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#002256] border-gray-300 focus:ring-[#002256] mt-0.5 md:mt-0"
                />
                <div>
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <span className="text-sm md:text-base">📊</span>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">
                      Intervalo de Meses
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 ml-5 md:ml-6">
                    Criar listas para múltiplos meses consecutivos
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Mês/Ano */}
          <div className="mb-3 md:mb-4 lg:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
              Mês/Ano <span className="text-red-500">*</span>
            </label>

            {modalData.periodo === "especifico" ? (
              <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                <select
                  value={modalData.mes}
                  onChange={(e) =>
                    setModalData({ ...modalData, mes: e.target.value })
                  }
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                >
                  <option value="">Selecione o mês</option>
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
                <select
                  value={modalData.ano}
                  onChange={(e) =>
                    setModalData({ ...modalData, ano: e.target.value })
                  }
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                >
                  <option value="">Selecione o ano</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3 lg:space-y-4">
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                  <select
                    value={modalData.mesInicio}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        mesInicio: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                  >
                    <option value="">Mês início</option>
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                  <select
                    value={modalData.anoInicio}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        anoInicio: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                  >
                    <option value="">Ano início</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                  <select
                    value={modalData.mesFim}
                    onChange={(e) =>
                      setModalData({ ...modalData, mesFim: e.target.value })
                    }
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                  >
                    <option value="">Mês fim</option>
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                  <select
                    value={modalData.anoFim}
                    onChange={(e) =>
                      setModalData({ ...modalData, anoFim: e.target.value })
                    }
                    className="w-full px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                  >
                    <option value="">Ano fim</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          {selectedFile && (
            <div className="text-xs md:text-sm text-gray-600 pb-2 md:pb-3 lg:pb-4">
              Arquivo selecionado:{" "}
              <span className="font-medium">{selectedFile.name}</span>
            </div>
          )}
          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 sm:space-x-2 md:space-x-3">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-[#002256] text-white rounded-lg hover:bg-[#002256]/90 transition-colors flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer"
              >
                <FaUpload className="w-3 h-3 md:w-4 md:h-4" />
                Importar Lista
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!isFormValid() || loading || uploadLoading}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-[#B7021C] text-white rounded-lg hover:bg-[#B7021C]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none"
              >
                {(loading || uploadLoading) && (
                  <FaSpinner className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                )}
                {uploadLoading
                  ? "Importando..."
                  : loading
                  ? "Criando..."
                  : "Criar Lista"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
