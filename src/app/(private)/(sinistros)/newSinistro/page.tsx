"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
// Dados simulados de apólices
const apolices = [
  { id: "123456", tipo: "Seguro Auto", item: "Honda Civic 2022" },
  { id: "789012", tipo: "Seguro Residencial", item: "Residência Principal" },
  { id: "345678", tipo: "Seguro Vida", item: "Vida Individual" },
];

// Tipos de sinistro
const tiposSinistro = {
  auto: ["Colisão", "Roubo/Furto", "Incêndio", "Alagamento", "Vidros", "Outro"],
  residencial: [
    "Incêndio",
    "Roubo/Furto",
    "Danos Elétricos",
    "Alagamento",
    "Vendaval",
    "Outro",
  ],
  vida: ["Acidente Pessoal", "Doença", "Invalidez", "Outro"],
};

type NewSinistroPageProps = {
  onBack: () => void;
};
export default function AbrirSinistroPage({ onBack }: NewSinistroPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Estado para armazenar os dados do formulário
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

  // Estado para armazenar as fotos
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Estado para controlar o tipo de apólice selecionada
  const [tipoApolice, setTipoApolice] = useState<
    "auto" | "residencial" | "vida" | ""
  >("");

  // Estado para controlar o carregamento
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para atualizar os dados do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para atualizar o select
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Se for a apólice, atualiza o tipo de apólice
    if (name === "apolice") {
      const apolice = apolices.find((a) => a.id === value);
      if (apolice) {
        if (apolice.tipo === "Seguro Auto") setTipoApolice("auto");
        else if (apolice.tipo === "Seguro Residencial")
          setTipoApolice("residencial");
        else if (apolice.tipo === "Seguro Vida") setTipoApolice("vida");
      }
    }
  };

  // Função para lidar com o upload de fotos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Limita a 5 fotos no total
      const totalFiles = [...fotos, ...newFiles];
      if (totalFiles.length > 5) {
        toast({
          title: "Limite de fotos excedido",
          description: "Você pode enviar no máximo 5 fotos.",
          variant: "destructive",
        });
        return;
      }

      // Adiciona as novas fotos
      setFotos([...fotos, ...newFiles]);

      // Cria previews para as novas fotos
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  // Função para remover uma foto
  const handleRemoveFile = (index: number) => {
    const newFotos = [...fotos];
    newFotos.splice(index, 1);
    setFotos(newFotos);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Libera a URL do objeto
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  // Função para enviar o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulação de envio
    setTimeout(() => {
      toast({
        title: "Sinistro aberto com sucesso",
        description:
          "Seu sinistro foi registrado e será analisado pela nossa equipe.",
        variant: "success",
      });
      setIsSubmitting(false);
      router.push("/sinistros");
    }, 2000);
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
          Abrir Sinistro
        </h1>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-company-red-500" />
            Formulário de Abertura de Sinistro
          </CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios e forneça o máximo de
            informações possível.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma apólice" />
                    </SelectTrigger>
                    <SelectContent>
                      {apolices.map((apolice) => (
                        <SelectItem key={apolice.id} value={apolice.id}>
                          {apolice.tipo} - {apolice.item} (#{apolice.id})
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
                    onValueChange={(value) =>
                      handleSelectChange("tipoSinistro", value)
                    }
                    disabled={!tipoApolice}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          tipoApolice
                            ? "Selecione o tipo de sinistro"
                            : "Selecione uma apólice primeiro"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoApolice &&
                        tiposSinistro[tipoApolice].map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">
                    Hora do Ocorrido{" "}
                    <span className="text-company-red-500">*</span>
                  </Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                    required
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
                                src={preview || "/placeholder.svg"}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-24 object-cover"
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
                  Isso ajudará na análise do seu caso.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 bg-gray-50">
          <Button variant="outline" asChild>
            <Link href="/sinistros">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-company-blue-600 hover:bg-company-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Sinistro"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
