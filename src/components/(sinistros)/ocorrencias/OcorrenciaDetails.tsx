"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ocorrencia, Anexo } from "@/types/typesData";
import { Gallery } from "./Gallery";
import { CalendarDays, Clock, MapPin, FileText, Users } from "lucide-react";

interface Props {
  ocorrencia: Ocorrencia;
  anexos: Anexo[];
}

export function OcorrenciaDetails({ ocorrencia, anexos }: Props) {

  // Funções de formatação
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Status com cores específicas
  const statusVariant =
    {
      P: "bg-yellow-100 text-yellow-800 border-yellow-200",
      C: "bg-green-100 text-green-800 border-green-200",
    }[ocorrencia.status] || "default";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#002256]">
                {ocorrencia.nome_apolice}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`px-3 py-1 text-sm  ${statusVariant}`}>
                  {ocorrencia.status === "P"
                    ? "Pendente"
                    : ocorrencia.status === "C"
                    ? "Concluído"
                    : "Arquivado"}
                </Badge>
                <span className="text-sm text-gray-500">
                  Apólice: {ocorrencia.id_apolice} • {ocorrencia.tipo_apolice}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-[#002256]" />
              <span>Registrado em {formatDate(ocorrencia.data_registo)}</span>
            </div>
          </div>
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
                icon={<Users className="h-5 w-5 text-[#002256]" />}
                title="Envolvidos"
                value={ocorrencia.envolvidos}
                placeholder="Não informado"
              />
            </div>

            {/* Coluna direita */}
            <div className="space-y-5">
              <DetailItem
                icon={<MapPin className="h-5 w-5 text-[#002256]" />}
                title="Local da Ocorrência"
                value={ocorrencia.local_ocorrencia}
                placeholder="Local não especificado"
              />

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
