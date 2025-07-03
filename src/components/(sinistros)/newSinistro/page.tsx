/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, X, Camera, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { Toaster } from "@/components/ui/toaster";

interface Apolice {
  id: string;
  policyNumber: string;
  insuranceType: string;
  productName: string;
  startDate: string;
  endDate: string;
  status: string;
  contractNumber: number;
}

type NewSinistroPageProps = {
  onBack: () => void;
};

export default function AbrirSinistroPage({ onBack }: NewSinistroPageProps) {
  const { toast } = useToast();
  const { token } = useSessionCheckToken();
  const { profile } = useUserProfile();

  // Estados do componente
  const [apolices, setApolices] = useState<Apolice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSinistros, setLoadingSinistros] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sinistrosDisponiveis, setSinistrosDisponiveis] = useState<any[]>([]);

  // Dados do formulário
  const [formData, setFormData] = useState({
    apolice: "",
    tipoSinistro: "",
    data: "",
    hora: "",
    local: "",
    descricao: "",
    envolvidos: "",
    boletimOcorrencia: "nao",
    numeroBO: "",
  });

  // Upload de fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!token || !profile?.nif) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/${profile.nif}/policies`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const processedApolices = Array.isArray(data) ? data : [data];
        setApolices(processedApolices);
      } catch (error) {
        if (!signal.aborted) {
          console.error("Erro ao buscar apólices:", error);
          setError(
            error instanceof Error ? error.message : "Erro desconhecido"
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
    return () => controller.abort();
  }, [token, profile?.nif]);
  console.log(`Atualizando apolices:`, apolices);

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Atualizando ${name} para:`, value);

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "apolice") {
        newData.tipoSinistro = ""; // limpa o tipo de sinistro
        setSinistrosDisponiveis([]); // limpa lista antiga
        fetchSinistros(value); // busca sinistros com id da apólice
      }

      return newData;
    });
  };

  // 3. FetchSinistros corrigido para garantir que está usando o ID correto
  const fetchSinistros = async (apoliceId: string) => {
    console.log("Buscando sinistros para:", apoliceId);
    if (!token || !apoliceId) return;

    const apoliceIdNumber = apoliceId;
    setLoadingSinistros(true);
    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/contract/${apoliceIdNumber}/claims`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`Erro ${response.status}`);

      const data = await response.json();
      console.log("Sinistros recebidos:", data);
      setSinistrosDisponiveis(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Erro ao buscar sinistros:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os sinistros",
        variant: "destructive",
      });
    } finally {
      setLoadingSinistros(false);
    }
  };

  // Manipuladores de eventos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...fotos, ...newFiles];

      if (totalFiles.length > 5) {
        toast({
          title: "Limite de fotos excedido",
          description: "Você pode enviar no máximo 5 fotos.",
          variant: "destructive",
        });
        return;
      }

      setFotos(totalFiles);
      setPreviews([
        ...previews,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFotos = [...fotos];
    const newPreviews = [...previews];

    URL.revokeObjectURL(newPreviews[index]);
    newFotos.splice(index, 1);
    newPreviews.splice(index, 1);

    setFotos(newFotos);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      apolice,
      tipoSinistro,
      data,
      hora,
      local,
      descricao,
      envolvidos,
      boletimOcorrencia,
      numeroBO,
    } = formData;

    // Verificação de campos obrigatórios
    if (!apolice || !tipoSinistro || !data || !local || !descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos marcados com *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id_apolice: apolice, // ID ou número da apólice
        nome_apolice: tipoSinistro, // nome ou título do sinistro (ajuste se necessário)
        tipo_apolice: "sinistro", // valor fixo ou adaptável se tiver tipos
        descricao,
        data_ocorrido: `${data}T${hora || "00:00"}:00`,
        local,
        envolvidos: envolvidos || "", // string vazia se não informado
        boletim_ocorrencia: boletimOcorrencia === "sim",
        numero_bo: numeroBO || "", // ou null, se a API aceitar
        id_anexo: fotos.length > 0 ? `FOTOS_${Date.now()}` : null,
        user_id: profile?.id,
      };

      const response = await fetch("/api/sinistro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const datares = await response.json();

      if (!response.ok) {
        throw new Error(datares.error || "Erro ao enviar sinistro");
      }

      toast({
        title: "Sinistro enviado com sucesso",
        description:
          "Seu sinistro foi registrado com sucesso e está em análise.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Erro ao enviar sinistro:", error);
      toast({
        title: "Erro ao enviar sinistro",
        description:
          error?.message || "Ocorreu um erro ao registrar o sinistro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={onBack}
          className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
          Nova Ocorrência
        </h1>
      </div>
      <Toaster />

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-company-red-500" />
            Formulário de Abertura de Sinistro
          </CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios (*) e forneça o máximo de
            informações possível.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apolice">
                    Apólice relacionada{" "}
                    <span className="text-company-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.apolice} // isso é só o ID (contractNumber)
                    onValueChange={(value) => {
                      handleSelectChange("apolice", value); // salva apenas o ID
                    }}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoading
                            ? "Carregando..."
                            : apolices.length === 0
                            ? "Nenhuma apólice disponível"
                            : "Selecione uma apólice"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {apolices.map((apolice) => (
                        <SelectItem
                          key={apolice.contractNumber}
                          value={String(apolice.contractNumber)} // envia o ID
                        >
                          {apolice.productName} {/* exibe o nome */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoSinistro">
                    Tipo de Sinistro{" "}
                    <span className="text-company-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipoSinistro}
                    onValueChange={(value) => {
                      console.log("Sinistro selecionado:", value);
                      handleSelectChange("tipoSinistro", value); // Apenas atualiza tipoSinistro
                    }}
                    disabled={!formData.apolice || loadingSinistros}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingSinistros
                            ? "Carregando..."
                            : !formData.apolice
                            ? "Selecione uma apólice primeiro"
                            : sinistrosDisponiveis.length === 0
                            ? "Nenhum sinistro disponível"
                            : "Selecione o sinistro"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sinistrosDisponiveis.length > 0 ? (
                        sinistrosDisponiveis.map((sinistro) => (
                          <SelectItem
                            key={sinistro.claimNumber}
                            value={String(sinistro.claimNumber)}
                          >
                            {sinistro.product}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          {formData.apolice
                            ? "Nenhum sinistro encontrado"
                            : "Selecione uma apólice"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Campos Data e Hora */}
                <div className="space-y-2">
                  <Label htmlFor="data">
                    Data do Ocorrido{" "}
                    <span className="text-company-red-500">*</span>
                  </Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={formData.data}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">Hora do Ocorrido</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                  />
                </div>

                {/* Campo Local */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="local">
                    Local do Ocorrido{" "}
                    <span className="text-company-red-500">*</span>
                  </Label>
                  <Input
                    id="local"
                    name="local"
                    placeholder="Endereço completo onde ocorreu o sinistro"
                    value={formData.local}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Seção Detalhes do Sinistro */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalhes do Sinistro</h3>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição Detalhada{" "}
                  <span className="text-company-red-500">*</span>
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Descreva com detalhes o que aconteceu"
                  rows={5}
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Forneça o máximo de detalhes possível sobre o ocorrido,
                  incluindo circunstâncias e danos.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="envolvidos">
                  Pessoas ou Veículos Envolvidos
                </Label>
                <Textarea
                  id="envolvidos"
                  name="envolvidos"
                  placeholder="Liste outras pessoas ou veículos envolvidos no sinistro, se houver"
                  rows={3}
                  value={formData.envolvidos}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Boletim de Ocorrência</Label>
                <RadioGroup
                  value={formData.boletimOcorrencia}
                  onValueChange={(value) =>
                    handleSelectChange("boletimOcorrencia", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="bo-sim" />
                    <Label htmlFor="bo-sim">Sim, já registrei um B.O.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="bo-nao" />
                    <Label htmlFor="bo-nao">Não registrei um B.O.</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.boletimOcorrencia === "sim" && (
                <div className="space-y-2">
                  <Label htmlFor="numeroBO">
                    Número do Boletim de Ocorrência
                  </Label>
                  <Input
                    id="numeroBO"
                    name="numeroBO"
                    placeholder="Informe o número do B.O."
                    value={formData.numeroBO}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Seção Fotos e Documentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fotos e Documentos</h3>

              <div className="space-y-2">
                <Label>Fotos do Sinistro (máximo 5 fotos)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste e solte fotos aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Formatos aceitos: JPG, PNG, HEIC - Tamanho máximo: 10MB
                    </p>
                    <Input
                      id="fotos"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("fotos")?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Selecionar Fotos
                    </Button>
                  </div>

                  <div>
                    {previews.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Fotos selecionadas ({previews.length}/5)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {previews.map((preview, index) => (
                            <div
                              key={index}
                              className="relative rounded-md overflow-hidden border"
                            >
                              <Image
                                src={preview}
                                alt={`Foto do sinistro ${index + 1}`}
                                className="w-full h-24 object-cover"
                                width={100}
                                height={100}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full border rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          Nenhuma foto selecionada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione fotos que mostrem os danos ou o local do sinistro.
                </p>
              </div>
            </div>

            {/* Rodapé do Formulário */}
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 ">
              <Button
                className="bg-[#b5b7bb] hover:bg-[#b5b7bb]/80"
                onClick={onBack}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#002256] hover:bg-[#002256]/80"
                disabled={isLoading || isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Sinistro"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
