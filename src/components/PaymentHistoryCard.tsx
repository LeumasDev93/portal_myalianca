"use client";

import React, { useState } from "react";

const PaymentHistoryCard = () => {
  // Dados completos da tabela
  const allPaymentData = [
    {
      name: "Alex Correia",
      type: "Carro",
      value: "30.000 ECV",
      status: "Pago",
      date: new Date(2024, 5, 15), // Exemplo: 15 de junho de 2023
    },
    {
      name: "Alex Correia",
      type: "Viagem",
      value: "30.000 ECV",
      status: "Pago",
      date: new Date(2024, 5, 10), // 10 de junho de 2023
    },
    {
      name: "Alex Correia",
      type: "Saúde",
      value: "30.000 ECV",
      status: "Pendente",
      date: new Date(2025, 4, 2), // 28 de maio de 2023
    },
    {
      name: "Alex Correia",
      type: "Casa",
      value: "30.000 ECV",
      status: "Pago",
      date: new Date(2025, 4, 15), // 15 de abril de 2023
    },
  ];

  // Estado para o filtro ativo
  const [activeFilter, setActiveFilter] = useState<string>("Tudo");
  const [paymentData, setPaymentData] = useState(allPaymentData);

  // Opções de filtro
  const filterOptions = ["Tudo", "Semana", "Mês", "Ano"];

  // Função para aplicar filtro
  const applyFilter = (filter: string) => {
    setActiveFilter(filter);

    const now = new Date();
    let filteredData = [...allPaymentData];

    if (filter === "Semana") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = allPaymentData.filter((item) => item.date >= oneWeekAgo);
    } else if (filter === "Mês") {
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      filteredData = allPaymentData.filter((item) => item.date >= oneMonthAgo);
    } else if (filter === "Ano") {
      const oneYearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      filteredData = allPaymentData.filter((item) => item.date >= oneYearAgo);
    }

    setPaymentData(filteredData);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="border-b-2 border-[#B7021C]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  NOME
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  TIPO DE SEGUROS
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  VALOR
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">
                  ESTADO
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentData.map((payment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center justify-center w-24 py-2 text-xs font-semibold rounded-lg ${
                        payment.status === "Pago"
                          ? "bg-[#002855] text-white"
                          : "bg-[#B7021C] text-white"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-start px-4 py-6 space-x-4">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => applyFilter(option)}
            className={`text-sm focus:outline-none ${
              activeFilter === option
                ? "text-[#002855] font-bold bg-white px-4 py-2 rounded-lg shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistoryCard;
