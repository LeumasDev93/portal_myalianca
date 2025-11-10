/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Check, Copy, X } from "lucide-react";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarDay,
  FaCalendarWeek,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaPercentage,
} from "react-icons/fa";
import { SimulationDetails } from "./MySimulationsTab";

// Tipos atualizados para refletir a estrutura real dos dados

interface Props {
  data: {
    info: {
      count: number;
      page: number;
      status: number;
      errors: null;
    };
    results: SimulationDetails;
  };
  onClose: () => void;
  isOpen: boolean;
  reset: () => void;
}

export function ModalDetails({ data, onClose, isOpen, reset }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !data?.results) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const currency = data.results?.currency || "CVE";

  const handleCopy = () => {
    if (navigator.clipboard && data.results.reference) {
      navigator.clipboard.writeText(data.results.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPeriodIcon = (name: string) => {
    switch (name) {
      case "A":
        return <FaCalendarAlt className="inline mr-2" />;
      case "S":
        return <FaCalendarCheck className="inline mr-2" />;
      case "T":
        return <FaCalendarWeek className="inline mr-2" />;
      case "M":
        return <FaCalendarDay className="inline mr-2" />;
      default:
        return <FaCalendarAlt className="inline mr-2" />;
    }
  };

  const getPeriodLabel = (name: string) => {
    switch (name) {
      case "A":
        return "Anual";
      case "S":
        return "Semestral";
      case "T":
        return "Trimestral";
      case "M":
        return "Mensal";
      default:
        return "Período Desconhecido";
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    return value.toLocaleString("pt-CV", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-CV");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gray-100 p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Detalhes da Simulação /
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-gray-600 hover:underline active:opacity-70 ml-2"
              title="Clique para copiar"
            >
              #{data.results?.reference}
              {copied ? (
                <Check size={16} className="text-green-600" />
              ) : (
                <Copy size={16} />
              )}
            </button>
            {copied && (
              <span className="text-sm text-green-600 ml-2">Copiado!</span>
            )}
          </h2>

          <button
            onClick={handleClose}
            aria-label="Fechar modal"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Informações Gerais */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Data de Renovação</p>
              <p className="font-medium">
                {formatDateString(data.results.renewalDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prêmio Total</p>
              <p className="font-medium">
                {formatCurrency(data.results.totalPremium)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Referência do Cliente</p>
              <p className="font-medium">
                {data.results.clientReference || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Opções de Pagamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {data.results?.installmentValues?.map((installment: any) => (
              <div
                key={installment.name}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="bg-blue-50 p-4 border-b">
                  <h4 className="font-bold flex items-center text-lg text-[#002855] text-center">
                    {getPeriodIcon(installment.name)}
                    {getPeriodLabel(installment.name)}
                  </h4>
                </div>

                <div className="p-4 flex-grow">
                  <p className="text-2xl font-bold text-[#002855] mb-4 text-center">
                    <FaMoneyBillWave className="inline mr-2 text-[#002855]" />
                    {formatCurrency(installment.value)}
                  </p>

                  <ul className="space-y-3 mb-4">
                    <li className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <FaFileInvoiceDollar className="mr-2 text-[#002855]" />
                        Valor Anual:
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(installment.annualValue)}
                      </span>
                    </li>

                    {Object.entries(installment.taxes)
                      .filter(([, value]) => isNumber(value) && value > 0)
                      .map(([taxName, taxValue]) => (
                        <li
                          key={taxName}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-600 flex items-center">
                            <FaPercentage className="mr-2 text-[#002855]" />
                            {taxName.split(" - ")[1] || taxName}:
                          </span>
                          <span className="text-sm font-medium">
                            {formatCurrency(isNumber(taxValue) ? taxValue : 0)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="p-4 border-t">
                  <button className="w-full bg-[#002855] text-white py-2 rounded-md hover:bg-[#002256]/70 transition-colors flex items-center justify-center">
                    <FaFileInvoiceDollar className="mr-2" />
                    Contratar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="px-8 pb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Objetos Segurados
          </h3>

          {data.results.simulationObjects?.map((obj, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg mb-6 p-6 bg-gray-50"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-[#002855] font-bold text-lg">
                    <FaCar className="mr-2" />
                    {obj.description || "Objeto sem descrição"}
                  </div>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {obj.code || "Sem código"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Capital Segurado</p>
                    <p className="font-medium">{formatCurrency(obj.capital)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prêmio</p>
                    <p className="font-medium">{formatCurrency(obj.premium)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Franquia</p>
                    <p className="font-medium">
                      {obj.franchise ? `${obj.franchise}%` : "N/A"}
                    </p>
                  </div>
                </div>

                {obj.propertyGroup?.name === "PROD_AUTO" && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold text-[#002855] mb-2">
                      Detalhes do Veículo
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {obj.propertyGroup.values.map((prop, idx) => (
                        <div key={idx}>
                          <p className="text-sm text-gray-500 capitalize">
                            {prop.name.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="font-medium">{prop.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {obj.risks.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-[#002855] flex items-center mb-2">
                    <FaShieldAlt className="mr-2" /> Coberturas
                  </h4>

                  <ul className="space-y-2">
                    {obj.risks.map((risk, idx) => (
                      <li
                        key={idx}
                        className="border border-gray-200 rounded-md p-4 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-700">
                              {risk.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Código: {risk.code} | Ordem: {risk.order}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">
                              <span className="font-medium">Capital:</span>{" "}
                              {formatCurrency(risk.capital)}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">Prêmio:</span>{" "}
                              {formatCurrency(risk.premium)}
                            </p>
                          </div>
                        </div>
                        {risk.deductibleValue > 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Franquia:</span>{" "}
                            {formatCurrency(risk.deductibleValue)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div> */}

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#002855] text-white rounded-lg hover:bg-[#002256]/70 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}
