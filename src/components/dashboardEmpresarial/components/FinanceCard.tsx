import { useFinanceSummary } from "@/hooks/useFinanceSummary";

export function FinanceCard() {
  const { data: financeData, isLoading, error } = useFinanceSummary();

  // Função para formatar valores monetários
  const formatValue = (valor: number, moeda: string) => {
    return `${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} ${moeda}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-20 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-[#002256] mb-4">
          Resumo Financeiro
        </h2>
        <div className="flex items-center space-x-3">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="text-red-800 font-semibold">
              Erro ao carregar dados financeiros
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Card Pago */}
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg flex flex-col justify-between h-[150px]">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 uppercase mb-4">
              Pago
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {financeData?.pago?.moeda || "ECV"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002256] mb-2">
              {financeData?.pago
                ? formatValue(financeData.pago.valor, financeData.pago.moeda)
                : "0 ECV"}
            </p>
          </div>
        </div>

        {/* Card Em Cobrança */}
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg flex flex-col justify-between h-[150px]">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 uppercase mb-4">
              Em Cobrança
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {financeData?.emCobranca?.moeda || "ECV"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#002256] mb-2">
              {financeData?.emCobranca
                ? formatValue(
                    Math.abs(financeData.emCobranca.valor),
                    financeData.emCobranca.moeda
                  )
                : "0 ECV"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
