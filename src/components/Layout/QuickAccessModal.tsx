"use client";

import React, { useState } from "react";
import { LuSquareKanban } from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile ";
import { Loader2, X } from "lucide-react";
import {
  IoGrid,
  IoShieldCheckmarkSharp,
  IoReceiptSharp,
} from "react-icons/io5";
import { TbTopologyStar3 } from "react-icons/tb";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoMdPin } from "react-icons/io";
import { AiFillFileExclamation } from "react-icons/ai";

// Lista de menus disponíveis com seus ícones (baseado no MainMenus da página principal)
const AVAILABLE_MENUS = [
  {
    nome: "Gestão de SOAT",
    titulo: "Gerencie seus Seguros",
    descricao: "Faz Gerenciamentos de seus Seguros de forma fácil e rápida",
    icone: LuSquareKanban,
    link: "gerenciamentoSOAT",
    descricaoBotao: "Acessar",
    onlyForCompany: true,
  },
  {
    nome: "Histórico",
    titulo: "Visualize seu histórico completo",
    descricao:
      "Acesse todo o histórico de transações, atividades e movimentações da sua conta de forma organizada e detalhada.",
    icone: IoGrid,
    link: "Historico",
    descricaoBotao: "Consultar Histórico",
  },
  {
    nome: "Apólice",
    titulo: "Gerencie suas apólices",
    descricao:
      "Visualize e gerencie todas as suas apólices de seguro, acompanhe coberturas, prazos e renovações.",
    icone: IoShieldCheckmarkSharp,
    link: "apolice",
    descricaoBotao: "Gerenciar Apólices",
  },
  {
    nome: "Sinistros",
    titulo: "Acompanhe seus sinistros",
    descricao:
      "Monitore o status dos seus sinistros, acompanhe processos de indenização e histórico de ocorrências.",
    icone: FaTriangleExclamation,
    link: "sinistro",
    descricaoBotao: "Acompanhar Sinistros",
  },
  {
    nome: "Recibos & Pagamentos",
    titulo: "Acesse seus recibos e pagamentos",
    descricao:
      "Consulte recibos de pagamento, histórico de transações financeiras e documentos fiscais.",
    icone: IoReceiptSharp,
    link: "recibo",
    descricaoBotao: "Ver Recibos",
  },
  {
    nome: "Ocorrências",
    titulo: "Registre e acompanhe ocorrências",
    descricao:
      "Registre novas ocorrências, acompanhe o progresso de processos e comunique-se com a seguradora.",
    icone: AiFillFileExclamation,
    link: "ocorrencias",
    descricaoBotao: "Registrar Ocorrência",
  },
  {
    nome: "Simular & Contratar",
    titulo: "Calcule valores de seguros",
    descricao:
      "Simule diferentes tipos de seguros, compare preços e coberturas, e contrate novos produtos.",
    icone: TbTopologyStar3,
    link: "Simulation",
    descricaoBotao: "Simular Agora",
  },
  {
    nome: "Agências",
    titulo: "Encontre agências próximas",
    descricao:
      "Localize agências da Aliança Seguros próximas à sua região, com informações de contato e horários.",
    icone: IoMdPin,
    link: "Agencias",
    descricaoBotao: "Encontrar Agências",
  },
];

interface QuickAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void; // Callback para atualizar a lista após adicionar item
}

export function QuickAccessModal({
  isOpen,
  onClose,
  onItemAdded,
}: QuickAccessModalProps) {
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  // Filtra os menus baseado no tipo de cliente
  const availableMenus = AVAILABLE_MENUS.filter((menu) => {
    // Se o menu tem onlyForCompany, só mostra para Company
    if (menu.onlyForCompany) {
      return profile?.user?.tipo_utilizador === "Company";
    }
    return true; // Mostra todos os outros menus
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMenu) {
      toast({
        title: "Selecione um menu",
        description:
          "Por favor, escolha um menu para adicionar ao acesso rápido.",
        variant: "destructive",
      });
      return;
    }

    const menu = availableMenus.find((m) => m.nome === selectedMenu);
    if (!menu) return;

    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

      if (!apiKey || !apiBaseUrl) {
        throw new Error("Configuração da API incompleta");
      }

      const response = await fetch(`${apiBaseUrl}/quick-access/1.0.0`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ApiKey: apiKey,
        },
        body: JSON.stringify({
          nome: menu.nome,
          titulo: menu.titulo,
          descricao: menu.descricao,
          icone: menu.icone.name,
          link: `${menu.link}`,
          descricaoBotao: menu.descricaoBotao,
          user_id: profile?.user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao adicionar ao acesso rápido"
        );
      }

      toast({
        title: "Sucesso!",
        description: `${menu.nome} foi adicionado ao seu acesso rápido.`,
        variant: "default",
      });

      // Chama o callback para atualizar a lista
      if (onItemAdded) {
        onItemAdded();
      }

      onClose();
      setSelectedMenu("");
    } catch (error) {
      console.error("Erro ao adicionar ao acesso rápido:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao adicionar ao acesso rápido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col text-[#002855]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Adicionar ao Acesso Rápido</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 text-[#002855]"
        >
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div className="space-y-4">
              <div className="px-6">
                <Label className="text-sm font-medium mb-4 block">
                  Selecione o Menu
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableMenus.map((menu) => (
                    <div
                      key={menu.titulo}
                      onClick={() => setSelectedMenu(menu.nome)}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedMenu === menu.nome
                          ? "border-[#002855] bg-blue-50"
                          : "border-gray-200 hover:border-[#002855] hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-4xl text-[#002855] mb-3">
                        {React.createElement(menu.icone)}
                      </div>
                      <span className="text-sm font-medium text-center text-[#002855]">
                        {menu.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedMenu || isLoading}
              className="bg-[#002256] hover:bg-[#002256d1] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar ao Acesso Rápido"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
