import { SimulationResponse } from "@/types/typesData";
import React from "react";
import { X } from "lucide-react";

interface Props {
  data: SimulationResponse;
  onClose: () => void;
  isOpen: boolean;
}

export function SimulationResults({ data, onClose, isOpen }: Props) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Resultados da Simulação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">ID da Simulação</p>
            <p className="text-lg font-semibold text-blue-600">
              {data.idSimulationTel}
            </p>
          </div>

          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Prêmio Total</p>
            <p className="text-2xl font-bold text-green-600">
              {data.totalPremium.toLocaleString(undefined, {
                style: "currency",
                currency: data.currency,
              })}
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Opções de Parcelamento
          </h3>

          <div className="space-y-4">
            {data.installmentValues.map((installment) => (
              <div
                key={installment.name}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 p-4 border-b">
                  <h4 className="font-medium text-gray-800">
                    {installment.name}
                  </h4>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Valor da Parcela</p>
                      <p className="font-medium">
                        {installment.value.toLocaleString(undefined, {
                          style: "currency",
                          currency: data.currency,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Valor Anual</p>
                      <p className="font-medium">
                        {installment.annualValue.toLocaleString(undefined, {
                          style: "currency",
                          currency: data.currency,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Detalhes das Taxas
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(installment.taxes).map(
                        ([taxName, taxValue]) => (
                          <div key={taxName} className="bg-gray-50 p-3 rounded">
                            <p className="text-xs text-gray-500">{taxName}</p>
                            <p className="text-sm font-medium">
                              {taxValue.toLocaleString(undefined, {
                                style: "currency",
                                currency: data.currency,
                              })}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
