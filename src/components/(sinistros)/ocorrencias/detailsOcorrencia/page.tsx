/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { OcorrenciaDetails } from "../OcorrenciaDetails";
import { Ocorrencia, Anexo } from "@/types/typesData";
import { LoadingContainer } from "@/components/ui/loading-container";

type OcorrenciaDetailsProps = {
  onBack: () => void;
  id: string;
};

export default function OcorrenciaDetailsPage({
  id,
  onBack,
}: OcorrenciaDetailsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocorrencia, setOcorrencia] = useState<Ocorrencia[] | null>(null);
  const [anexos, setAnexos] = useState<Anexo[]>([]);

  const fetchOcorrenciaDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/detailsOcorrencia?id=${id}`);
      if (!response.ok)
        throw new Error("Erro ao buscar detalhes da ocorrência");

      const data = await response.json();
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Nenhum dado retornado pela API');
      }
      
      setOcorrencia(data);

      const ocorrencia = Array.isArray(data) ? data[0] : data;
      
      // Se houver anexos, processar diretamente usando a URL da API externa
      let anexosIds: string[] = [];

      if (typeof ocorrencia.id_anexos === "string" && ocorrencia.id_anexos) {
        try {
          anexosIds = JSON.parse(ocorrencia.id_anexos);
        } catch (e) {
          anexosIds = [];
        }
      } else if (Array.isArray(ocorrencia.id_anexos)) {
        anexosIds = ocorrencia.id_anexos;
      }

      if (anexosIds.length > 0) {
        // Processar anexos diretamente usando a URL da API externa
        const processedAnexos = anexosIds.map((id: string) => {
          const apiBaseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT ||
            "https://api.aliancaseguros.cv";
          const imageUrl = `${apiBaseUrl}/files/1.0.0/download/${id}`;

          const anexo = {
            id: id,
            filename: `Anexo ${id}`,
            content: "", // Será preenchido pelo componente Gallery
            mimetype: "image/jpeg", // Assumindo que são imagens
            userid: "",
            datecreate: new Date().toISOString(),
            url: imageUrl, // URL direta para download
          };

          return anexo;
        });

        setAnexos(processedAnexos);
      } else {
        setAnexos([]);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da ocorrência",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOcorrenciaDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center py-12 ">
        <LoadingContainer
          fullHeight={true}
          message="CARREGANDO DETALHES OCORRÊNCIAS..."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 mt-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
        >
          <ArrowLeft className="h-4 w-4 " />
        </Button>
        <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
          Detalhes da Ocorrência
        </h1>
      </div>
      {!error && ocorrencia && Array.isArray(ocorrencia) && ocorrencia.length > 0 ? (
        <OcorrenciaDetails ocorrencia={ocorrencia[0]} anexos={anexos} />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Nenhuma ocorrência encontrada
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Não foi possível carregar os detalhes desta ocorrência. Por favor,
            tente novamente mais tarde.
          </p>
          <Button
            onClick={onBack}
            className="mt-4 border border-[#002256] bg-white hover:bg-[#002256] hover:text-white text-[#002256]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a lista
          </Button>
        </div>
      )}
    </div>
  );
}
