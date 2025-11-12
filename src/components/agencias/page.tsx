"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, Mail, X, Grid3x3, List, ChevronUp } from "lucide-react";
import { FaMapMarker } from "react-icons/fa";
import { useAgencias } from "@/hooks/useAgencias";
import { LoadingContainer } from "@/components/ui/loading-container";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [expandedAgenciaId, setExpandedAgenciaId] = useState<string | null>(null);

  if (!agencias || agencias.length === 0) {
    return (
      <LoadingContainer fullHeight={true} message="CARREGANDO AGÊNCIAS..." />
    );
  }

  return (
    <div className="w-full">
      <div className="px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6">
        <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-4 xl:mt-5">
          <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[#002256]">
              Nossas Agências
            </h1>
            {/* Botões de alternância de visualização */}
            <div className="flex gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#002256] text-white"
                    : "text-gray-600 hover:text-[#002256]"
                }`}
                title="Visualização em lista"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#002256] text-white"
                    : "text-gray-600 hover:text-[#002256]"
                }`}
                title="Visualização em grade"
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Encontre a agência mais próxima de você para atendimento presencial.
          </p>
        </div>
      </div>
      {loading ? (
        <></>
      ) : error ? (
        <p className="text-red-500 container">{error}</p>
      ) : agencias.length === 0 ? (
        <LoadingContainer message="CARREGANDO AGÊNCIAS..." />
      ) : (
        <div className="container p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
          {viewMode === "list" ? (
            /* Visualização em Lista */
            <div className="space-y-2 sm:space-y-3">
              {agencias.map((agencia) => {
                const isExpanded = expandedAgenciaId === agencia.id;
                return (
                  <div key={agencia.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div
                      className="bg-gray-100 hover:bg-gray-200 p-3 sm:p-4 cursor-pointer transition-colors flex items-center justify-between group"
                      onClick={() => setExpandedAgenciaId(isExpanded ? null : agencia.id)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#002256] flex-shrink-0" />
                        <span className="text-sm sm:text-base md:text-lg font-medium text-gray-800">
                          {agencia.nome}
                        </span>
                      </div>
                      <ChevronUp className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-[#002256] transition-all ${
                        isExpanded ? '' : 'transform rotate-180'
                      }`} />
                    </div>
                    
                    {/* Conteúdo expandido com mapa */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                        {/* Informações da agência */}
                        <div className="flex flex-col lg:flex-row lg:items-start gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                          {agencia.telefone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#002256] flex-shrink-0" />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Contacto</span>
                                <span className="text-xs sm:text-sm md:text-base text-gray-800">{agencia.telefone}</span>
                              </div>
                            </div>
                          )}
                          {agencia.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#002256] flex-shrink-0" />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Email</span>
                                <span className="text-xs sm:text-sm md:text-base text-gray-800 break-all">{agencia.email}</span>
                              </div>
                            </div>
                          )}
                          {agencia.horarios && agencia.horarios.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#002256] mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  {agencia.horarios.map((horario, index) => (
                                    <span key={index} className="text-xs sm:text-sm md:text-base text-gray-800 whitespace-nowrap">
                                      {horario}{index < agencia.horarios!.length - 1 ? ' |' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Mapa inline */}
                        <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200">
                          <iframe
                            src={`https://www.google.com/maps?q=${agencia.latitude},${agencia.longitude}&hl=pt-PT&z=15&output=embed`}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                        
                        {/* Botão Google Maps */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${agencia.latitude},${agencia.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#002256] rounded-md hover:bg-[#002256]/90 transition-colors"
                        >
                          <FaMapMarker className="mr-2 h-4 w-4" />
                          Abrir no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Visualização em Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {agencias.map((agencia) => (
                <Card key={agencia.id}>
              <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl">{agencia.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#002256] mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">{agencia.localizacao}</span>
                </div>
                {agencia.telefone && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#002256] flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base">{agencia.telefone}</span>
                  </div>
                )}
                {agencia.email && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#002256] flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base break-all">{agencia.email}</span>
                  </div>
                )}
                {agencia.horarios && agencia.horarios.length > 0 && (
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#002256] mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5 sm:space-y-1">
                      {agencia.horarios.map((horario, index) => (
                        <div key={index} className="text-[10px] sm:text-xs md:text-sm">
                          {horario}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSelectedAgencia(agencia)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[#002256] border-[#002256] text-[10px] sm:text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white hover:bg-[#002256] hover:text-white h-8 sm:h-9 md:h-10 px-3 sm:px-4 py-1.5 sm:py-2 w-full mt-3 sm:mt-4"
                >
                  <FaMapMarker className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  Ver no mapa
                </button>
              </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Modal do Mapa */}
          <Dialog open={!!selectedAgencia} onOpenChange={(open) => !open && setSelectedAgencia(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] xl:max-w-[75vw] 2xl:max-w-[70vw] h-[90vh] p-0">
              <VisuallyHidden>
                <DialogTitle>{selectedAgencia?.nome || 'Mapa da Agência'}</DialogTitle>
              </VisuallyHidden>
              {selectedAgencia && (
                <div className="h-full flex flex-col">
                  {/* Header do Mapa */}
                  <div className="flex items-start justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b bg-white">
                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#002256]">
                        {selectedAgencia.nome}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                        {selectedAgencia.localizacao}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedAgencia(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors ml-2"
                      title="Fechar mapa"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Iframe do Mapa */}
                  <div className="flex-1 relative">
                    <iframe
                      src={`https://www.google.com/maps?q=${selectedAgencia.latitude},${selectedAgencia.longitude}&hl=pt-PT&z=15&output=embed`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  {/* Footer com botão Google Maps */}
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-t bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>Lat: {selectedAgencia.latitude}, Long: {selectedAgencia.longitude}</span>
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedAgencia.latitude},${selectedAgencia.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#002256] rounded-md hover:bg-[#002256]/90 transition-colors"
                      >
                        <FaMapMarker className="mr-2 h-4 w-4" />
                        Abrir no Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
