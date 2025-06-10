"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { FaMapMarker } from "react-icons/fa";
import { useAgencias } from "@/hooks/useAgencias";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AgenciasPage() {
  const { agencias, loading, error } = useAgencias();

  return (
    <div className="container p-6">
      <div className="mb-8">
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2 text-[#002256]">
          Nossas Agências
        </h1>
        <p className="text-gray-600 mb-6">
          Encontre a agência mais próxima de você para atendimento presencial.
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingScreen />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : agencias.length === 0 ? (
        <LoadingScreen />
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
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#002256]" />
                  <span>Sem telefone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#002256]" />
                  <span>Horário indisponível</span>
                </div>
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${agencia.latitude},${agencia.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[#002256] border-[#002256] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white hover:bg-[#002256] hover:text-white h-10 px-4 py-2 w-full mt-4"
                >
                  <FaMapMarker className="mr-2 h-4 w-4" />
                  Ver no mapa
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
