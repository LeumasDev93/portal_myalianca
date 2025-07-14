import { SimulationResponse } from "@/types/typesData";
import React from "react";

interface Props {
  data: SimulationResponse;
}

export function SimulationResults({ data }: Props) {
  if (!data) return <p>Sem dados da simulação.</p>;

  return (
    <div>
      <h2>Simulação ID: {data.idSimulationTel}</h2>
      <p>
        Prêmio Total:{" "}
        {data.totalPremium.toLocaleString(undefined, {
          style: "currency",
          currency: data.currency,
        })}
      </p>

      <h3>Parcelas:</h3>
      <ul>
        {data.installmentValues.map((installment) => (
          <li key={installment.name} className="mb-4 p-2 border rounded">
            <strong>{installment.name}</strong>:{" "}
            {installment.value.toLocaleString(undefined, {
              style: "currency",
              currency: data.currency,
            })}{" "}
            (Anual:{" "}
            {installment.annualValue.toLocaleString(undefined, {
              style: "currency",
              currency: data.currency,
            })}
            )
            <div>
              <h4>Taxas:</h4>
              <ul>
                {Object.entries(installment.taxes).map(
                  ([taxName, taxValue]) => (
                    <li key={taxName}>
                      {taxName}:{" "}
                      {taxValue.toLocaleString(undefined, {
                        style: "currency",
                        currency: data.currency,
                      })}
                    </li>
                  )
                )}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
