import { SimulationResponse } from "@/types/typesData";
import React, { useState } from "react";
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

interface Props {
  data: SimulationResponse;
  onClose?: () => void;
  isOpen: boolean;
  reset: () => void;
}

export function SimulationResults({ data, onClose, isOpen, reset }: Props) {
  if (!isOpen || !data) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Mensagem desaparece após 2s
  };

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

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {data.hasError ? (
              <span className="text-red-600">Erro na Simulação</span>
            ) : (
              <>
                Simulação Feita Com Sucesso /
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-gray-600 hover:underline active:opacity-70"
                  title="Clique para copiar"
                >
                  #{data.reference}
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                {copied && (
                  <span className="text-sm text-green-600 ml-2">Copiado!</span>
                )}
              </>
            )}
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {/* Verificar se há erros */}
          {data.hasError && data.errors && data.errors.length > 0 ? (
            <div className="bg-red-50 border border-red-300 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">
                    Erro na Simulação
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {data.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {data.installmentValues.map((installment) => {
              // Define ícone com base no tipo de parcela
              const getPeriodIcon = () => {
                switch (installment.name) {
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

              return (
                <div
                  key={installment.name}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="bg-blue-50 p-4 border-b">
                    <h4 className="font-bold flex items-center text-lg text-[#002855] text-center">
                      {getPeriodIcon()}
                      {installment.name === "A"
                        ? "Anual"
                        : installment.name === "S"
                        ? "Semestral"
                        : installment.name === "T"
                        ? "Trimestral"
                        : "Mensal"}
                    </h4>
                  </div>

                  <div className="p-4 flex-grow">
                    <p className="text-2xl font-bold text-[#002855] mb-4 text-center">
                      <FaMoneyBillWave className="inline mr-2 text-[#002855]" />
                      {installment.value.toLocaleString(undefined, {
                        style: "currency",
                        currency: data.currency,
                      })}
                    </p>

                    <ul className="space-y-3 mb-4">
                      <li className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center">
                          <FaFileInvoiceDollar className="mr-2 text-[#002855]" />
                          Valor Anual:
                        </span>
                        <span className="text-sm font-medium">
                          {installment.annualValue.toLocaleString(undefined, {
                            style: "currency",
                            currency: data.currency,
                          })}
                        </span>
                      </li>

                      {Object.entries(installment.taxes)
                        .filter(([, value]) => value > 0)
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
                              {taxValue.toLocaleString(undefined, {
                                style: "currency",
                                currency: data.currency,
                              })}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="p-4 border-t">
                    <button className="w-full cursor-pointer bg-[#002855] text-white py-2 rounded-md hover:bg-[#002855]/70 transition-colors flex items-center justify-center">
                      <FaFileInvoiceDollar className="mr-2" />
                      Contratar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-[#002855] text-white rounded-lg hover:bg-[#002855]/70 transition-colors"
          >
            Minhas Simulações
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-[#002855] text-white rounded-lg hover:bg-[#002855]/70 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
