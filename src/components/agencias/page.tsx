"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Mail, X } from "lucide-react";
import { FaMapMarker } from "react-icons/fa";
import { useAgencias } from "@/hooks/useAgencias";
import { LoadingContainer } from "@/components/ui/loading-container";

interface Agencia {
  id: string;
  nome: string;
  localizacao: string;
  telefone?: string;
  email?: string;
  horarios?: string[];
  latitude: number;
  longitude: number;
}

export default function AgenciasPage() {
  const { agencias, loading, error } = useAgencias();
  const [selectedAgencia, setSelectedAgencia] = useState<Agencia | null>(null);

  if (!agencias || agencias.length === 0) {
    return (
      <LoadingContainer fullHeight={true} message="CARREGANDO AGÊNCIAS..." />
    );
  }

  return (
    <div className="container p-6">
      <div className="mb-8 mt-6">
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2 text-[#002256]">
          Nossas Agências
        </h1>
        <p className="text-gray-600 mb-6">
          Encontre a agência mais próxima de você para atendimento presencial.
        </p>
      </div>
      {loading ? (
        <></>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : agencias.length === 0 ? (
        <LoadingContainer message="CARREGANDO AGÊNCIAS..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencias.map((agencia) => (
            <Card key={agencia.id}>
              <CardHeader>
                <CardTitle>{agencia.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-[#002256] mt-0.5" />
                  <span>{agencia.localizacao}</span>
                </div>
                {agencia.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#002256]" />
                    <span>{agencia.telefone}</span>
                  </div>
                )}
                {agencia.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#002256]" />
                    <span>{agencia.email}</span>
                  </div>
                )}
                {agencia.horarios && agencia.horarios.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-[#002256] mt-0.5" />
                    <div className="space-y-1">
                      {agencia.horarios.map((horario, index) => (
                        <div key={index} className="text-sm">
                          {horario}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSelectedAgencia(agencia)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[#002256] border-[#002256] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white hover:bg-[#002256] hover:text-white h-10 px-4 py-2 w-full mt-4"
                >
                  <FaMapMarker className="mr-2 h-4 w-4" />
                  Ver no mapa
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal do Mapa */}
      {selectedAgencia && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b">
              <div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-[#002256]">
                  {selectedAgencia.nome}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {selectedAgencia.localizacao}
                </p>
              </div>
              <button
                onClick={() => setSelectedAgencia(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mapa */}
            <div className="flex-1 p-2 md:p-4">
              <iframe
                src={`https://www.google.com/maps?q=${selectedAgencia.latitude},${selectedAgencia.longitude}&hl=pt-PT&z=15&output=embed`}
                className="w-full h-full rounded-lg border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Footer com botão para abrir no Google Maps */}
            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="text-xs md:text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Coordenadas: {selectedAgencia.latitude}, {selectedAgencia.longitude}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedAgencia(null)}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedAgencia.latitude},${selectedAgencia.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#002256] rounded-md hover:bg-[#002256]/90 transition-colors"
                >
                  <FaMapMarker className="mr-2 h-4 w-4" />
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
