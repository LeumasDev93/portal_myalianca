import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { addSoat } from "@/service/addSoatService";
import { AlertTriangle } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile ";

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
    onClose();
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#002256] mb-2">
            Adicionar Nova Lista de SOAT
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Crie uma nova lista de SOAT para um mês específico. Os dados serão
            importados do Excel configurado no backend.
          </p>
          {error && (
            <div className="flex items-center justify-center space-x-2 bg-red-50 border border-red-200 rounded-lg py-2 px-4 mb-4">
              <AlertTriangle color="#B7021C" size={20} />
              <p className="text-red-500">{error}</p>
            </div>
          )}
          {/* Período */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Período <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="periodo"
                  value="especifico"
                  checked={modalData.periodo === "especifico"}
                  onChange={(e) =>
                    setModalData({ ...modalData, periodo: e.target.value })
                  }
                  className="w-4 h-4 text-[#002256] border-gray-300 focus:ring-[#002256]"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">📅</span>
                    <span className="font-medium text-gray-900">
                      Mês Específico
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    Criar lista para um único mês
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="periodo"
                  value="intervalo"
                  checked={modalData.periodo === "intervalo"}
                  onChange={(e) =>
                    setModalData({ ...modalData, periodo: e.target.value })
                  }
                  className="w-4 h-4 text-[#002256] border-gray-300 focus:ring-[#002256]"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">📊</span>
                    <span className="font-medium text-gray-900">
                      Intervalo de Meses
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    Criar listas para múltiplos meses consecutivos
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Mês/Ano */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mês/Ano <span className="text-red-500">*</span>
            </label>

            {modalData.periodo === "especifico" ? (
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={modalData.mes}
                  onChange={(e) =>
                    setModalData({ ...modalData, mes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                >
                  <option value="">Selecione o ano</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={modalData.mesInicio}
                    onChange={(e) =>
                      setModalData({
                        ...modalData,
                        mesInicio: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
                  >
                    <option value="">Ano início</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={modalData.mesFim}
                    onChange={(e) =>
                      setModalData({ ...modalData, mesFim: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] focus:border-transparent"
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

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!isFormValid() || loading}
              className="px-4 py-2 bg-[#B7021C] text-white rounded-lg hover:bg-[#B7021C]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
              {loading ? "Criando..." : "Criar Lista"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
