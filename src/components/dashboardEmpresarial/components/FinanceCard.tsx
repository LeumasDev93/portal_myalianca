import { useFinanceSummary } from "@/hooks/useFinanceSummary";

interface FinanceCardProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

export function FinanceCard({ onNavigate }: FinanceCardProps) {
  const { data: financeData, isLoading, error } = useFinanceSummary();

  // Função para formatar valores monetários
  const formatValue = (valor: number, moeda: string) => {
    return `${valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} ${moeda}`;
  };

  // Função para navegar para recibos com filtro "Pago"
  const handlePagoClick = () => {
    if (onNavigate) {
      onNavigate("recibo", { estado: "5" }); // 5 = Cobrado (Pago)
    }
  };

  // Função para navegar para recibos com filtro "Em Cobrança"
  const handleEmCobrancaClick = () => {
    if (onNavigate) {
      onNavigate("recibo", { estado: "1" }); // 1 = Em Cobrança
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-[#002256] mb-4"></h2>
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
        <div
          className="bg-green-50 border border-green-200 p-3 md:p-4 lg:p-6 rounded-lg flex flex-col justify-between h-[120px] md:h-[140px] lg:h-[150px] hover:bg-green-100 hover:scale-105 cursor-pointer transition-all duration-300"
          onClick={handlePagoClick}
          title="Ver recibos pagos"
        >
          <div className="text-center">
            <h3 className="text-xs md:text-sm font-medium text-gray-600 uppercase mb-2 md:mb-3 lg:mb-4">
              Pago
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 lg:mb-4">
              {financeData?.pago?.moeda || "ECV"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#002256] mb-1 md:mb-2">
              {financeData?.pago
                ? formatValue(financeData.pago.valor, financeData.pago.moeda)
                : "0 ECV"}
            </p>
          </div>
        </div>

        {/* Card Em Cobrança */}
        <div
          className="bg-orange-50 border border-orange-200 p-3 md:p-4 lg:p-6 rounded-lg flex flex-col justify-between h-[120px] md:h-[140px] lg:h-[150px] hover:bg-orange-100 hover:scale-105 cursor-pointer transition-all duration-300"
          onClick={handleEmCobrancaClick}
          title="Ver recibos em cobrança"
        >
          <div className="text-center">
            <h3 className="text-xs md:text-sm font-medium text-gray-600 uppercase mb-2 md:mb-3 lg:mb-4">
              Em Cobrança
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 lg:mb-4">
              {financeData?.emCobranca?.moeda || "ECV"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[#002256] mb-1 md:mb-2">
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
