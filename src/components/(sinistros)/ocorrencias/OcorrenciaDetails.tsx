// components/ocorrencias/OcorrenciaDetails.tsx
"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ocorrencia, Anexo } from "@/types/typesData";
import { ArrowLeft, Printer, Share2, Edit, Trash2 } from "lucide-react";
import { Gallery } from "./Gallery";

export function OcorrenciaDetails({
  ocorrencia,
  anexos,
}: {
  ocorrencia: Ocorrencia;
  anexos: Anexo[];
}) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
            Detalhes da Ocorrência
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Informações principais */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">{ocorrencia.nome_apolice}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={ocorrencia.status === "P" ? "default" : "success"}
              >
                {ocorrencia.status === "P" ? "Pendente" : "Resolvido"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {ocorrencia.tipo_apolice} • {ocorrencia.id_apolice}
              </span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Registrado em{" "}
            {format(new Date(ocorrencia.data_registo), "PPPp", {
              locale: pt,
            })}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Descrição
              </h3>
              <p className="text-sm">
                {ocorrencia.descricao || "Sem descrição"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Envolvidos
              </h3>
              <p className="text-sm">
                {ocorrencia.envolvidos || "Não informado"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Local da Ocorrência
              </h3>
              <p className="text-sm">
                {ocorrencia.local_ocorrencia || "Não informado"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Boletim de Ocorrência
              </h3>
              <p className="text-sm">
                {ocorrencia.boletim_ocorrencia || "Não registrado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Galeria de Fotos */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Galeria de Fotos</h2>
        <Gallery anexos={anexos} />
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-2">
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </Button>
        <Button variant="default" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  );
}
