"use client";

import { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaPaperPlane,
  FaTrash,
  FaDownload,
} from "react-icons/fa";
import {
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoListOutline,
} from "react-icons/io5";

interface SoatLista {
  mesReferencia: string;
  nomeArquivo: string;
  dataCriacao: string;
  totalTrabalhadores: number;
  valorTotal: string;
  status: string;
  situacao: string;
}

export default function PageGestaoSOAT() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [soatListas, setSoatListas] = useState<SoatLista[]>([]);

  // Estados do modal
  const [modalData, setModalData] = useState({
    periodo: "especifico", // "especifico" ou "intervalo"
    mes: "",
    ano: "",
    mesInicio: "",
    anoInicio: "",
    mesFim: "",
    anoFim: "",
  });

  // Calcular estatísticas dinamicamente
  const listasAtivas = soatListas.filter(
    (lista) => lista.status === "Ativo"
  ).length;
  const listasVencidas = soatListas.filter(
    (lista) => lista.status === "Vencido"
  ).length;
  const totalTrabalhadores = soatListas.reduce(
    (total, lista) => total + lista.totalTrabalhadores,
    0
  );
  const totalListas = soatListas.length;

  // Dados das estatísticas SOAT (calculadas dinamicamente)
  const soatStats = [
    {
      title: "Listas Ativas",
      amount: listasAtivas.toString(),
      description: "Em dia",
      icon: IoDocumentTextOutline,
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
  const filteredListas = soatListas.filter((lista) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      lista.mesReferencia.toLowerCase().includes(searchLower) ||
      lista.nomeArquivo.toLowerCase().includes(searchLower) ||
      lista.dataCriacao.includes(searchQuery) ||
      lista.valorTotal.toLowerCase().includes(searchLower) ||
      lista.status.toLowerCase().includes(searchLower) ||
      lista.situacao.toLowerCase().includes(searchLower)
    );
  });

  // Função para obter classes de cor
  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: "bg-green-50",
        icon: "bg-green-100 text-green-600",
        text: "text-green-600",
        border: "border-green-200",
      },
      red: {
        bg: "bg-red-50",
        icon: "bg-red-100 text-red-600",
        text: "text-red-600",
        border: "border-red-200",
      },
      blue: {
        bg: "bg-blue-50",
        icon: "bg-blue-100 text-blue-600",
        text: "text-blue-600",
        border: "border-blue-200",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "bg-purple-100 text-purple-600",
        text: "text-purple-600",
        border: "border-purple-200",
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  // Função para validar o formulário
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

  // Função para obter nome do mês
  const getMonthName = (monthNumber: string) => {
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    return months[parseInt(monthNumber) - 1] || "";
  };

  // Função para criar nova lista SOAT
  const handleCreateSOAT = () => {
    if (!isFormValid()) return;

    if (modalData.periodo === "especifico") {
      // Criar uma lista para mês específico
      const monthName = getMonthName(modalData.mes);
      const newLista = {
        mesReferencia: `${monthName} de ${modalData.ano}`,
        nomeArquivo: `SOAT_${
          monthName.charAt(0).toUpperCase() + monthName.slice(1)
        }_${modalData.ano}.xlsx`,
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
        totalTrabalhadores: Math.floor(Math.random() * 50) + 30, // Simular número de trabalhadores
        valorTotal: `R$ ${(Math.random() * 2000 + 1500)
          .toFixed(2)
          .replace(".", ",")}`,
        status: "Ativo",
        situacao: "Não enviado",
      };

      setSoatListas((prev) => [newLista, ...prev]);
    } else {
      // Criar uma única lista para intervalo de meses
      const mesInicio = getMonthName(modalData.mesInicio);
      const mesFim = getMonthName(modalData.mesFim);
      const anoInicio = modalData.anoInicio;
      const anoFim = modalData.anoFim;

      // Calcular número total de meses no intervalo
      const startDate = new Date(
        parseInt(anoInicio),
        parseInt(modalData.mesInicio) - 1
      );
      const endDate = new Date(
        parseInt(anoFim),
        parseInt(modalData.mesFim) - 1
      );
      const diffMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth()) +
        1;

      const mesReferencia =
        anoInicio === anoFim
          ? `${mesInicio} a ${mesFim} de ${anoInicio}`
          : `${mesInicio} de ${anoInicio} a ${mesFim} de ${anoFim}`;

      const nomeArquivo =
        anoInicio === anoFim
          ? `SOAT_${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)}_${
              mesFim.charAt(0).toUpperCase() + mesFim.slice(1)
            }_${anoInicio}.xlsx`
          : `SOAT_${
              mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)
            }_${anoInicio}_${
              mesFim.charAt(0).toUpperCase() + mesFim.slice(1)
            }_${anoFim}.xlsx`;

      const newLista: SoatLista = {
        mesReferencia,
        nomeArquivo,
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
        totalTrabalhadores: Math.floor(Math.random() * 50) + 30 * diffMonths, // Mais trabalhadores para intervalo
        valorTotal: `R$ ${((Math.random() * 2000 + 1500) * diffMonths)
          .toFixed(2)
          .replace(".", ",")}`,
        status: "Ativo",
        situacao: "Não enviado",
      };

      setSoatListas((prev) => [newLista, ...prev]);
    }

    // Fechar modal e limpar dados
    setShowModal(false);
    setModalData({
      periodo: "especifico",
      mes: "",
      ano: "",
      mesInicio: "",
      anoInicio: "",
      mesFim: "",
      anoFim: "",
    });
  };

  return (
    <div className="p-4 w-full mt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#002256] mb-2">
          Gestão de SOAT
        </h1>
        <p className="text-sm text-[#002856]">
          Gerencie o Seguro Obrigatório de Acidentes de Trânsito dos
          trabalhadores da empresa
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {soatStats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          const IconComponent = stat.icon;

          return (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg shadow-md border border-gray-200 ${colors.bg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {stat.title}
                </h3>
                <div className={`p-2 rounded-full ${colors.icon}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <p className={`text-xl font-bold ${colors.text}`}>
                  {stat.amount}
                </p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seção Buscar */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#002256]">Buscar</h2>
        <div className="flex justify-between">
          <div className="w-1/2 relative">
            <input
              type="text"
              placeholder="Buscar por mês ou nome do arquivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#B7021C] hover:bg-[#B7021C]/90 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            Adicionar SOAT
          </button>
        </div>
      </div>

      {/* Tabela de Listas de SOAT */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-[#002256]">Listas de SOAT</h3>
          <p className="text-sm text-gray-600">
            Todas as listas mensais de SOAT dos trabalhadores
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês Referência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome do Arquivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Trabalhadores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {soatListas.length === 0 ? (
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
                        onClick={() => setShowModal(true)}
                        className="bg-[#B7021C] hover:bg-[#B7021C]/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <FaPlus className="w-4 h-4" />
                        Adicionar SOAT
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredListas.length === 0 ? (
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
                filteredListas.map((lista, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {lista.mesReferencia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {lista.nomeArquivo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lista.dataCriacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lista.totalTrabalhadores}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lista.valorTotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          lista.status === "Ativo"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lista.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {lista.situacao === "Enviado" ? (
                          <>
                            <span className="text-green-600 text-sm mr-2">
                              ✓
                            </span>
                            <span className="text-green-600 text-sm">
                              Enviado
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-600 text-sm">
                            Não enviado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                          <FaEye className="w-4 h-4" />
                        </button>
                        {lista.situacao !== "Enviado" && (
                          <>
                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded">
                              <FaPaperPlane className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800 p-1 rounded">
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="text-green-600 hover:text-green-800 p-1 rounded">
                          <FaDownload className="w-4 h-4" />
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

      {/* Modal Adicionar Nova Lista de SOAT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#002256] mb-2">
                Adicionar Nova Lista de SOAT
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Crie uma nova lista de SOAT para um mês específico. Os dados
                serão importados do Excel configurado no backend.
              </p>

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
                  onClick={() => {
                    setShowModal(false);
                    setModalData({
                      periodo: "especifico",
                      mes: "",
                      ano: "",
                      mesInicio: "",
                      anoInicio: "",
                      mesFim: "",
                      anoFim: "",
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Função para criar nova lista SOAT
                    handleCreateSOAT();
                  }}
                  disabled={!isFormValid()}
                  className="px-4 py-2 bg-[#B7021C] text-white rounded-lg hover:bg-[#B7021C]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
