"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getSession } from "next-auth/react";
import { TriangleAlert } from "lucide-react";
import { DotLoading } from "./ui/dot-loading";

type SinistroData = {
  claimNumber: number;
  contractNumber: number;
  occurenceDate: string;
  claimDate: string;
  clientName: string;
  status: string;
  manager: string;
  insuredObjectName: string;
  insuredObjectDescription: string;
  product: string;
};

const SinistroDetailsCard = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sinistro, setSinistro] = useState<SinistroData | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setToken(session?.user.accessToken || null);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchSinistros = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/anywhere/api/v1/private/mobile/claim/31/info",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar dados do sinistro");
        }

        const data = await response.json();
        setSinistro(data);
      } catch (error) {
        console.error("Erro ao buscar sinistro:", error);
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSinistros();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-PT");
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200 pb-2">
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl">
            Detalhes do Sinistro
          </CardTitle>
          <TriangleAlert className="ml-auto sm:w-8 sm:h-8 w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && <DotLoading />}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Sem dados!
          </div>
        )}

        {sinistro && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div>
                <h3 className="font-medium text-gray-500">Nome Cliente</h3>
                <p className="text-lg">{sinistro.clientName}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500">Contrato</h3>
                <p>{sinistro.contractNumber}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500">Produto</h3>
                <p>{sinistro.product}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="font-medium text-gray-500">
                  Data de Ocorrência
                </h3>
                <p>{formatDate(sinistro.occurenceDate)}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500">Data de Registo</h3>
                <p>{formatDate(sinistro.claimDate)}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-500">Gestor</h3>
                <p>{sinistro.manager}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="md:col-span-2 ">
                <h3 className="font-medium text-gray-500">Veículo Segurado</h3>
                <div className="flex justify-between">
                  <p>{sinistro.insuredObjectName}</p>
                </div>
              </div>
              <div className="md:col-span-2 ">
                <h3 className="font-medium text-gray-500">Matricula</h3>
                <div className="flex justify-between">
                  <p>{sinistro.insuredObjectDescription}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-500">Data de Registo</h3>
                <p>{formatDate(sinistro.claimDate)}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div
                className={`inline-block px-3 sm:px-5 sm:p-2 py-1 rounded-lg text-sm font-medium text-white ${
                  sinistro.status === "A" ? "bg-[#002256] " : "bg-[#B7021C] "
                }`}
              >
                {sinistro.status === "A" ? "Ativo" : "Em Análise"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SinistroDetailsCard;
