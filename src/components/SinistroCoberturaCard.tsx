"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { getSession } from "next-auth/react";
import { Kanban, TriangleAlert } from "lucide-react";
import { DotLoading } from "./ui/dot-loading";

type CoberturaData = {
  code: string;
  name: string;
};

const SinistroCoberturaCard = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [coberturas, setCoberturas] = useState<CoberturaData[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setToken(session?.user.accessToken || null);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchCoberturas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "/api/anywhere/api/v1/private/mobile/claim/31/risks",
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
          throw new Error("Erro ao buscar coberturas do sinistro");
        }

        const data = await response.json();

        // Normaliza os dados para sempre trabalhar com array
        setCoberturas(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar coberturas:", error);
        setError("Erro ao carregar coberturas. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoberturas();
  }, [token]);

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200 pb-2">
        <div className="flex items-center justify-center">
          <CardTitle className="text-lg sm:text-xl">
            Coberturas Associadas
          </CardTitle>
          <Kanban className="ml-auto sm:w-8 sm:h-8 w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading && <DotLoading />}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-md">
            <TriangleAlert className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {coberturas.length > 0 ? (
          <div className="space-y-3">
            {coberturas.map((cobertura, index) => (
              <div
                key={`${cobertura.code}-${index}`}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">
                      {cobertura.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Código: {cobertura.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading &&
          !error && (
            <div className="text-center py-6 text-gray-500">
              Nenhuma cobertura encontrada
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default SinistroCoberturaCard;
