import { Simulation } from "@/types/typesData";
import { TbTopologyStar3 } from "react-icons/tb";
type propsModal = {
  selectedSimulation: Simulation;
  setOpenModal: (open: boolean) => void;
};

export function ModalDetails({ selectedSimulation, setOpenModal }: propsModal) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full shadow-xl relative">
        <button
          onClick={() => setOpenModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg> */}

            <TbTopologyStar3 className="h-8 w-8 text-[#002256]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Simulação #{selectedSimulation.simulationNumber}
            </h2>
            <p className="text-gray-600">{selectedSimulation.productName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Informações do Cliente
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Nome:</span>{" "}
                  {selectedSimulation.clientName}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Data de Nascimento:
                  </span>{" "}
                  {selectedSimulation.birthdate || "Não informado"}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Produtor:</span>{" "}
                  {selectedSimulation.producerName || "Não informado"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Contatos
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Telefone:</span>{" "}
                  {selectedSimulation.primaryMobileContact}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Email:</span>{" "}
                  {selectedSimulation.primaryEmailContact || "Não informado"}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Outros contatos:
                  </span>{" "}
                  {selectedSimulation.contacts.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Detalhes do Contrato
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedSimulation.contractStatus === "I"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedSimulation.contractStatus === "I"
                      ? "Inativo"
                      : "Ativo"}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-600">Matrícula:</span>{" "}
                  {selectedSimulation.registration}
                </p>
                <p>
                  <span className="font-medium text-gray-600">ATM:</span>{" "}
                  {selectedSimulation.atm || "Não informado"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Valores
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Prêmio:</span>{" "}
                  {selectedSimulation.premium.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
                <p>
                  <span className="font-medium text-gray-600">
                    Prêmio Total:
                  </span>{" "}
                  {selectedSimulation.totalPremium.toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Datas
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium text-gray-600">Início:</span>{" "}
                  {selectedSimulation.startDate
                    ? new Date(selectedSimulation.startDate).toLocaleDateString(
                        "pt-PT"
                      )
                    : "Não definido"}
                </p>
                <p>
                  <span className="font-medium text-gray-600">Fim:</span>{" "}
                  {selectedSimulation.endDate
                    ? new Date(selectedSimulation.endDate).toLocaleDateString(
                        "pt-PT"
                      )
                    : "Não definido"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
