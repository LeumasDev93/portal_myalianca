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
import { Toaster } from "@/components/ui/toaster";
import { useUserProfile } from "@/hooks/useUserProfile ";

interface Apolice {
  id: string;
  policyNumber: string;
  insuranceType?: string; // Opcional para compatibilidade
  productName: string;
  startDate: string;
  endDate: string;
  status: string;
  contractNumber: number;
}

type NewSinistroPageProps = {
  onBack: () => void;
};

export default function NewOcorrênciasPage({ onBack }: NewSinistroPageProps) {
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Dados do formulário
  const [formData, setFormData] = useState({
    apolice: "",
    tipoSinistro: "",
    nomeApolice: "",
    tipoApolice: "",
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
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token || !profile?.user?.nif) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/${profile?.user?.nif}/policies`,
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
  }, [token, profile?.user?.nif]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "apolice") {
        newData.tipoSinistro = "";
        newData.tipoApolice = "";
        setSinistrosDisponiveis([]);
        fetchSinistros(value);

        // Buscar dados da apólice selecionada
        const apoliceSelecionada = apolices.find(
          (apolice) => String(apolice.contractNumber) === value
        );

        if (apoliceSelecionada) {
          newData.nomeApolice = apoliceSelecionada.productName;
          newData.tipoApolice = apoliceSelecionada.insuranceType || "AUTO";
        }
      }

      if (name === "tipoSinistro") {
        // Buscar dados do sinistro selecionado
        const sinistroSelecionado = sinistrosDisponiveis.find(
          (sinistro) => String(sinistro.claimNumber) === value
        );

        if (sinistroSelecionado) {
          newData.tipoSinistro = sinistroSelecionado.product || value;
        }
      }

      return newData;
    });
  };

  const fetchSinistros = async (apoliceId: string) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 handleFileChange iniciado -", new Date().toISOString());

    if (e.target.files?.length) {
      const newFiles = Array.from(e.target.files);
      console.log(
        "📂 Arquivos selecionados:",
        newFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );

      const totalFiles = [...fotos, ...newFiles];
      console.log("📊 Total de arquivos após adição:", totalFiles.length);

      if (totalFiles.length > 5) {
        console.log("❌ Limite de 5 arquivos excedido");
        toast({
          title: "Limite de fotos excedido",
          description: "Você pode enviar no máximo 5 fotos.",
          variant: "destructive",
        });
        return;
      }

      // Verificar tamanho dos arquivos (2MB cada)
      const maxSize = 2 * 1024 * 1024; // 2MB
      const oversizedFiles = newFiles.filter((file) => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        console.log(
          "❌ Arquivos muito grandes:",
          oversizedFiles.map((f) => ({ name: f.name, size: f.size }))
        );
        toast({
          title: "Arquivo muito grande",
          description: `Os arquivos ${oversizedFiles
            .map((f) => f.name)
            .join(", ")} excedem o limite de 2MB.`,
          variant: "destructive",
        });
        return;
      }

      // Verificar tipo de arquivo
      const allowedTypes = [
        "image/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      const invalidFiles = newFiles.filter(
        (file) =>
          !allowedTypes.some(
            (type) => file.type.startsWith(type) || file.type === type
          )
      );

      if (invalidFiles.length > 0) {
        console.log(
          "❌ Tipos de arquivo inválidos:",
          invalidFiles.map((f) => ({ name: f.name, type: f.type }))
        );
        toast({
          title: "Tipo de arquivo não suportado",
          description: `Os arquivos ${invalidFiles
            .map((f) => f.name)
            .join(", ")} não são suportados.`,
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Validações passadas, adicionando arquivos ao state");
      setFotos(totalFiles);
      setPreviews([
        ...previews,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);

      console.log("📸 Previews criados:", newFiles.length, "arquivos");
      console.log(
        "📋 Estado atual - fotos:",
        totalFiles.length,
        "previews:",
        previews.length + newFiles.length
      );

      // Upload imediato de cada arquivo
      for (const file of newFiles) {
        await uploadFileImmediately(file);
      }
    } else {
      console.log("⚠️ Nenhum arquivo selecionado");
    }
  };

  // Função para upload imediato de arquivo
  const uploadFileImmediately = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    console.log(`🔄 Iniciando upload imediato: ${file.name}`);
    setUploadingFiles((prev) => new Set(prev).add(fileId));

    try {
      const uploadedId = await uploadDocument(file);
      setUploadedFileIds((prev) => [...prev, uploadedId]);
      console.log(
        `✅ Upload imediato concluído: ${file.name} -> ID: ${uploadedId}`
      );

      toast({
        title: "Upload concluído",
        description: `${file.name} foi enviado com sucesso.`,
        variant: "success",
      });
    } catch (error) {
      console.error(`❌ Erro no upload imediato: ${file.name}`, error);
      toast({
        title: "Erro no upload",
        description: `Falha ao enviar ${file.name}.`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    console.log("🗑️ Removendo arquivo no índice:", index);
    console.log("📁 Arquivo removido:", fotos[index]?.name);

    const newFotos = [...fotos];
    const newPreviews = [...previews];
    const newUploadedIds = [...uploadedFileIds];

    URL.revokeObjectURL(newPreviews[index]);
    newFotos.splice(index, 1);
    newPreviews.splice(index, 1);
    newUploadedIds.splice(index, 1);

    setFotos(newFotos);
    setPreviews(newPreviews);
    setUploadedFileIds(newUploadedIds);

    console.log("✅ Arquivo removido. Total restante:", newFotos.length);
    console.log("📋 IDs restantes:", newUploadedIds);
  };

  // Função para upload de documento único usando o mesmo sistema das mensagens
  const uploadDocument = async (file: File): Promise<string> => {
    console.log(
      "🔄 Iniciando upload do arquivo:",
      file.name,
      "-",
      new Date().toISOString()
    );

    const formData = new FormData();
    formData.append("file", file);
    console.log(
      "📦 FormData criado com arquivo:",
      file.name,
      "(",
      file.size,
      "bytes)"
    );

    // Timeout de 30 segundos para uploads
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      console.log("📤 Enviando requisição para /api/upload...");
      console.log("📡 URL:", "/api/upload");
      console.log("📡 Método: POST");
      console.log("📡 Arquivo:", file.name);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(
        "📥 Resposta recebida da API de upload:",
        response.status,
        response.statusText
      );
      console.log(
        "📥 Headers da resposta:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na API de upload:", response.status, errorText);
        throw new Error(`Erro no upload do arquivo: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Resposta da API de upload:", data);
      console.log("✅ Tipo de resposta:", typeof data);
      console.log("✅ Chaves da resposta:", Object.keys(data));

      // Verificar se o ID foi retornado
      if (!data.id) {
        console.error("❌ API não retornou ID do arquivo:", data);
        console.error(
          "❌ Estrutura da resposta:",
          JSON.stringify(data, null, 2)
        );
        throw new Error(
          `API não retornou ID do arquivo. Resposta: ${JSON.stringify(data)}`
        );
      }

      console.log("✅ ID do arquivo retornado:", data.id);
      console.log("✅ Upload concluído com sucesso para:", file.name);
      return data.id; // Retorna o ID do arquivo no servidor
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("❌ Erro durante upload:", error);

      if (error instanceof Error && error.name === "AbortError") {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        console.error("❌ Timeout no upload:", fileSizeMB, "MB");
        throw new Error(
          `Timeout no upload (${fileSizeMB}MB) - verifique sua conexão ou tente novamente.`
        );
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      apolice,
      nomeApolice,
      tipoApolice,
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
    if (!apolice || !data || !local || !descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos marcados com *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Usar os IDs já carregados
      const documentosIds = uploadedFileIds;
      console.log("📋 IDs de arquivos já carregados:", documentosIds);

      // 2. Envio dos dados do sinistro
      console.log("📝 Preparando payload para envio do sinistro");
      const payload = {
        id_apolice: apolice,
        nome_apolice: nomeApolice,
        tipo_apolice: tipoApolice || "AUTO", // Usa o valor da API ou "AUTO" como fallback
        tipo_sinistro: tipoSinistro || "", // Usa o valor do sinistro selecionado
        descricao,
        id_anexos: documentosIds,
        data_ocorrencia: data,
        hora_ocorrencia: hora || "00:00",
        local_ocorrencia: local,
        envolvidos: envolvidos || "",
        boletim_ocorrencia: boletimOcorrencia === "sim",
        numero_bo: numeroBO || null,
        user_id: profile?.user?.id,
      };

      console.log("📦 Payload preparado:", {
        id_apolice: payload.id_apolice,
        nome_apolice: payload.nome_apolice,
        tipo_apolice: payload.tipo_apolice,
        tipo_sinistro: payload.tipo_sinistro,
        id_anexos: payload.id_anexos,
        user_id: payload.user_id,
      });

      console.log("🌐 Enviando requisição para /api/sinistro...");
      const response = await fetch("/api/sinistro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log(
        "📥 Resposta recebida:",
        response.status,
        response.statusText
      );
      const responseData = await response.json();
      console.log("📄 Dados da resposta:", responseData);

      if (!response.ok) {
        console.error("❌ Erro na resposta:", responseData);
        throw new Error(responseData.error || "Erro ao enviar sinistro");
      }

      console.log("✅ Sinistro registrado com sucesso!");
      toast({
        title: "Sucesso!",
        description: "Sinistro registrado com sucesso.",
        variant: "success",
      });

      // Limpar formulário após sucesso
      console.log("🧹 Limpando formulário...");
      setFormData({
        apolice: "",
        nomeApolice: "",
        tipoSinistro: "",
        tipoApolice: "",
        data: "",
        hora: "",
        local: "",
        descricao: "",
        envolvidos: "",
        boletimOcorrencia: "nao",
        numeroBO: "",
      });
      setFotos([]);
      setPreviews([]);
      setUploadedFileIds([]);
      setUploadingFiles(new Set());
      console.log("✅ Formulário limpo");
    } catch (error: any) {
      console.error("Erro no processo:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao registrar o sinistro",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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
                    value={formData.apolice}
                    onValueChange={(value) =>
                      handleSelectChange("apolice", value)
                    }
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
                          value={String(apolice.contractNumber)}
                        >
                          {apolice.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoApolice">Tipo de Apólice</Label>
                  <Input
                    id="tipoApolice"
                    value={formData.tipoApolice || "Não definido"}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoSinistro">Tipo de Sinistro</Label>
                  <Select
                    value={formData.tipoSinistro}
                    onValueChange={(value) =>
                      handleSelectChange("tipoSinistro", value)
                    }
                    disabled={!formData.apolice || loadingSinistros}
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
                <Label>
                  Fotos do Sinistro (selecione uma por vez, máximo 5 fotos)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste e solte uma foto aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Formatos aceitos: JPG, PNG, HEIC - Tamanho máximo: 2MB
                    </p>
                    <Input
                      id="fotos"
                      type="file"
                      accept="image/*"
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
                      Selecionar Foto
                    </Button>
                  </div>

                  <div>
                    {previews.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Fotos selecionadas ({previews.length}/5)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {previews.map((preview, index) => {
                            const file = fotos[index];
                            const fileId = file
                              ? `${file.name}-${Date.now()}`
                              : "";
                            const isUploading = uploadingFiles.has(fileId);
                            const isUploaded = uploadedFileIds[index];

                            return (
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

                                {/* Indicador de status */}
                                <div className="absolute top-1 left-1">
                                  {isUploading && (
                                    <div className="bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                                      📤
                                    </div>
                                  )}
                                  {isUploaded && (
                                    <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                      ✅
                                    </div>
                                  )}
                                </div>

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
                            );
                          })}
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
              </div>

              {/* Barra de progresso do upload */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Rodapé do Formulário */}
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
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
                {isSubmitting ? "Enviando..." : "Enviar Ocorrência"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
