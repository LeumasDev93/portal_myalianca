"use client";

import { Separator } from "@/components/ui/separator";
import { Ocorrencia, Anexo } from "@/types/typesData";
import { Gallery } from "./Gallery";
import { CalendarDays, Clock, MapPin, FileText, Check, X, Archive, FileCheck } from "lucide-react";

interface Props {
  ocorrencia: Ocorrencia;
  anexos: Anexo[];
}

// Componente de Timeline de Status
const StatusTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const baseSteps = [
    { key: "P", label: "Pendente", icon: Clock, color: "bg-yellow-500" },
    { key: "EA", label: "Em Análise", icon: FileText, color: "bg-blue-500" },
  ];

  const endSteps = {
    D: { key: "D", label: "Descartada", icon: X, color: "bg-red-500" },
    CS: { key: "CS", label: "Convertida em Sinistro", icon: FileCheck, color: "bg-green-500" },
    A: { key: "A", label: "Arquivada", icon: Archive, color: "bg-gray-500" },
  };

  // Determinar quais steps mostrar baseado no estado atual
  const activeSteps = (() => {
    if (currentStatus === "P" || currentStatus === "EA") {
      // Se Pendente ou Em Análise: mostrar TODOS os 5 estados possíveis
      return [...baseSteps, endSteps.D, endSteps.CS, endSteps.A];
    } else if (currentStatus === "D") {
      // Se Descartada: P → EA → D (3 estados, CS e A desaparecem)
      return [...baseSteps, endSteps.D];
    } else if (currentStatus === "CS") {
      // Se Convertida em Sinistro: P → EA → CS → A (4 estados, D desaparece)
      return [...baseSteps, endSteps.CS, endSteps.A];
    } else if (currentStatus === "A") {
      // Se Arquivada: P → EA → CS → A (4 estados, D desaparece)
      return [...baseSteps, endSteps.CS, endSteps.A];
    }
    // Fallback: apenas estados base
    return baseSteps;
  })();

  const currentIndex = activeSteps.findIndex((step) => step.key === currentStatus);
  const progressPercentage = currentIndex >= 0 ? (currentIndex / (activeSteps.length - 1)) * 100 : 0;

  return (
    <div className="w-full py-4 sm:py-6">
      <div className="relative w-full mx-auto">
        <div className="relative">
          {/* Linha de fundo - 100% de largura, SEM padding */}
          <div className="absolute left-0 right-0 h-1 sm:h-1.5 bg-gray-200 rounded-full" style={{ top: '20px' }} />
          
          {/* Linha de progresso */}
          <div 
            className="absolute left-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#002256] to-[#0044a0] rounded-full transition-all duration-700"
            style={{ 
              top: '20px',
              width: `${progressPercentage}%`
            }}
          />

          {/* Steps - flex justify-between garante que primeiro e último fiquem nas pontas */}
          <div className="relative h-24 sm:h-28 flex justify-between">
            {activeSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div 
                  key={step.key} 
                  className="flex flex-col items-center"
                >
                  {/* Ícone - tamanho fixo */}
                  <div
                    className={`relative z-10 flex items-center justify-center rounded-full border-2 sm:border-4 transition-all duration-500 ${
                      isActive
                        ? isCurrent
                          ? `w-10 h-10 sm:w-12 sm:h-12 ${step.color} border-white shadow-2xl animate-pulse`
                          : `w-10 h-10 sm:w-12 sm:h-12 bg-[#002256] border-white shadow-lg`
                        : "w-10 h-10 sm:w-12 sm:h-12 bg-white border-gray-300"
                    }`}
                  >
                    {isActive && !isCurrent && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {(!isActive || isCurrent) && (
                      <Icon
                        className={`transition-all ${
                          isCurrent ? "w-5 h-5 sm:w-6 sm:h-6" : "w-4 h-4 sm:w-5 sm:h-5"
                        } ${
                          isActive ? "text-white" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-2 sm:mt-3 text-center max-w-[70px] sm:max-w-[90px]">
                    <p
                      className={`text-[9px] sm:text-[10px] md:text-xs font-semibold leading-tight ${
                        isActive ? "text-[#002256]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export function OcorrenciaDetails({ ocorrencia, anexos }: Props) {

  // Funções de formatação
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#002256]">
                {ocorrencia.nome_apolice}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-gray-500">
                  Apólice: {ocorrencia.id_apolice}
                  {ocorrencia.objeto_seguro && ` • ${ocorrencia.objeto_seguro}`}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-[#002256]" />
              <span>Registrado em {formatDate(ocorrencia.data_registo)}</span>
            </div>
          </div>

          {/* Timeline de Status */}
          <StatusTimeline currentStatus={ocorrencia.status} />
        </div>

        <Separator className="my-2" />

        {/* Detalhes principais */}
        <div className="p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna esquerda */}
            <div className="space-y-5">
              <DetailItem
                icon={<FileText className="h-5 w-5 text-[#002256]" />}
                title="Descrição"
                value={ocorrencia.descricao}
                placeholder="Nenhuma descrição fornecida"
              />

              <DetailItem
                icon={<MapPin className="h-5 w-5 text-[#002256]" />}
                title="Local da Ocorrência"
                value={ocorrencia.local_ocorrencia}
                placeholder="Local não especificado"
              />
            </div>

            {/* Coluna direita */}
            <div className="space-y-5">
             

              <DetailItem
                icon={<CalendarDays className="h-5 w-5 text-[#002256]" />}
                title="Data do Ocorrido"
                value={
                  ocorrencia.data_ocorrencia
                    ? formatDate(ocorrencia.data_ocorrencia)
                    : "Não informado"
                }
              />
              <DetailItem
                icon={<Clock className="h-5 w-5 text-[#002256]" />}
                title="Hora do Ocorrido"
                value={
                  ocorrencia.hora_ocorrencia
                    ? ocorrencia.hora_ocorrencia.substring(0, 5)
                    : "Não informado"
                }
              />
              {ocorrencia.boletim_ocorrencia && (
                <DetailItem
                  icon={<FileText className="h-5 w-5 text-[#002256]" />}
                  title="Número do BO"
                  value={ocorrencia.boletim_ocorrencia}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {anexos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-[#002256]">
              <FileText className="h-5 w-5 " />
              Documentos Anexados
            </h2>
            <span className="text-sm text-white bg-[#002256] bg-opacity-70 px-3 py-1 rounded-full">
              {anexos.length} {anexos.length === 1 ? "imagem" : "imagens"}
            </span>
          </div>

          <Gallery anexos={anexos} title={ocorrencia.nome_apolice} />
        </div>
      )}
    </div>
  );
}

// Componente DetailItem melhorado
const DetailItem = ({
  icon,
  title,
  value,
  placeholder = "Não informado",
}: {
  icon?: React.ReactNode;
  title: string;
  value?: string | null;
  placeholder?: string;
}) => (
  <div className="flex gap-3">
    <div className="mt-0.5 text-[#002256]">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-[#002256] mb-1">{title}</h3>
      <p className="text-sm text-gray-800">
        {value ? (
          typeof value === "string" ? (
            value.split("\n").map((paragraph, i) => (
              <span key={i}>
                {paragraph}
                <br />
              </span>
            ))
          ) : (
            value
          )
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </p>
    </div>
  </div>
);
