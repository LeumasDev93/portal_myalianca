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
import { useUserProfile } from "@/hooks/useUserProfile";
import { useActivities } from "@/hooks/useActivities";
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
    iconName: "LuSquareKanban",
    link: "gestaoSOAT",
    descricao_botao: "Acessar",
    border_color: "border-blue-200",
    icon_color: "text-blue-800",
    bg_color: "bg-blue-50 hover:bg-blue-100",
    text_color: "text-blue-900",
    bg_botton_color: "bg-blue-900 hover:bg-blue-900/70",
    order_number: 1,
    onlyForCompany: true,
  },
  {
    nome: "Histórico",
    titulo: "Visualize seu histórico completo",
    descricao:
      "Acesse todo o histórico de transações, atividades e movimentações da sua conta de forma organizada e detalhada.",
    icone: IoGrid,
    iconName: "IoGrid",
    link: "Historico",
    descricao_botao: "Consultar Histórico",
    border_color: "border-[#171133]",
    icon_color: "text-[#274862]",
    bg_color: "bg-gray-100 hover:bg-gray-200",
    text_color: "text-[#274862]",
    bg_botton_color: "bg-[#274862] hover:bg-#274862]/70",
    order_number: 5,
  },
  {
    nome: "Apólice",
    titulo: "Gerencie suas apólices",
    descricao:
      "Visualize e gerencie todas as suas apólices de seguro, acompanhe coberturas, prazos e renovações.",
    icone: IoShieldCheckmarkSharp,
    iconName: "IoShieldCheckmarkSharp",
    link: "apolice",
    descricao_botao: "Gerenciar Apólices",
    border_color: "border-[#171133]",
    icon_color: "text-[#274862]",
    bg_color: "bg-gray-100 hover:bg-gray-200",
    text_color: "text-[#274862]",
    bg_botton_color: "bg-[#274862] hover:bg-#274862]/70",
    order_number: 6,
  },
  {
    nome: "Sinistros",
    titulo: "Acompanhe seus sinistros",
    descricao:
      "Monitore o status dos seus sinistros, acompanhe processos de indenização e histórico de ocorrências.",
    icone: FaTriangleExclamation,
    iconName: "FaTriangleExclamation",
    link: "sinistro",
    descricao_botao: "Acompanhar Sinistros",
    border_color: "border-[#171133]",
    icon_color: "text-[#274862]",
    bg_color: "bg-gray-100 hover:bg-gray-200",
    text_color: "text-[#274862]",
    bg_botton_color: "bg-[#274862] hover:bg-#274862]/70",
    order_number: 7,
  },
  {
    nome: "Recibos & Pagamentos",
    titulo: "Acesse seus recibos e pagamentos",
    descricao:
      "Consulte recibos de pagamento, histórico de transações financeiras e documentos fiscais.",
    icone: IoReceiptSharp,
    iconName: "IoReceiptSharp",
    link: "recibo",
    descricao_botao: "Ver Recibos",
    border_color: "border-[#171133]",
    icon_color: "text-[#274862]",
    bg_color: "bg-gray-100 hover:bg-gray-200",
    text_color: "text-[#274862]",
    bg_botton_color: "bg-[#274862] hover:bg-#274862]/70",
    order_number: 8,
  },
  {
    nome: "Ocorrências",
    titulo: "Registre e acompanhe ocorrências",
    descricao:
      "Registre novas ocorrências, acompanhe o progresso de processos e comunique-se com a seguradora.",
    icone: AiFillFileExclamation,
    iconName: "AiFillFileExclamation",
    link: "ocorrencias",
    descricao_botao: "Registrar Ocorrência",
    border_color: "border-red-800",
    icon_color: "text-red-800",
    bg_color: "bg-red-50 hover:bg-red-100",
    text_color: "text-red-700",
    bg_botton_color: "bg-red-700 hover:bg-red-800/70",
    order_number: 2,
  },
  {
    nome: "Simular & Contratar",
    titulo: "Calcule valores de seguros",
    descricao:
      "Simule diferentes tipos de seguros, compare preços e coberturas, e contrate novos produtos.",
    icone: TbTopologyStar3,
    iconName: "TbTopologyStar3",
    link: "Simulation",
    descricao_botao: "Simular Agora",
    border_color: "border-[#002855]",
    icon_color: "text-[#002855]",
    bg_color: "bg-blue-100 hover:bg-blue-50",
    text_color: "text-[#002855]",
    bg_botton_color: "bg-[#002855] hover:bg-[#002855]/70",
    order_number: 3,
  },
  {
    nome: "Agências",
    titulo: "Encontre agências próximas",
    descricao:
      "Localize agências da Aliança Seguros próximas à sua região, com informações de contato e horários.",
    icone: IoMdPin,
    iconName: "IoMdPin",
    link: "Agencias",
    descricao_botao: "Encontrar Agências",
    border_color: "border-[#171133]",
    icon_color: "text-[#274862]",
    bg_color: "bg-gray-100 hover:bg-gray-200",
    text_color: "text-[#274862]",
    bg_botton_color: "bg-[#274862] hover:bg-#274862]/70",
    order_number: 9,
  },
];

interface QuickAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
  existingItems?: Array<{ nome: string }>;
}

export function QuickAccessModal({
  isOpen,
  onClose,
  onItemAdded,
  existingItems = [],
}: QuickAccessModalProps) {
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const { registerActivity } = useActivities();

  const availableMenus = AVAILABLE_MENUS.filter((menu) => {
    if (menu.onlyForCompany) {
      return profile?.user?.tipo_cliente === "Company";
    }
    return true;
  }).map((menu) => ({
    ...menu,
    isDisabled: existingItems.some((item) => item.nome === menu.nome),
  }));

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

    console.log("Menu selecionado:", menu);

    setIsLoading(true);

    try {
      const requestData = {
        nome: String(menu.nome || ""),
        titulo: String(menu.titulo || ""),
        icone: String(menu.iconName || ""),
        link: String(menu.link || ""),
        descricao_botao: String(menu.descricao_botao || ""),
        user_id: String(profile?.user?.id || ""),
        border_color: String(menu.border_color || "#002855"),
        icon_color: String(menu.icon_color || "#002855"),
        bg_color: String(menu.bg_color || "#002855"),
        text_color: String(menu.text_color || "#002855"),
        bg_botton_color: String(menu.bg_botton_color || "#002855"),
        order_number: Number(menu.order_number || 1),
      };

      const response = await fetch('/api/quick-access', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na resposta:", errorData);
        throw new Error(
          errorData.error || "Erro ao adicionar ao acesso rápido"
        );
      }

      const responseData = await response.json();
      console.log("Resposta da API:", responseData);

      toast({
        title: "Sucesso!",
        description: `${menu.nome} foi adicionado ao seu acesso rápido.`,
        variant: "success",
      });

      // Registrar atividade
      try {
        await registerActivity({
          action: "ITEM_ADICIONADO",
          description: `${menu.nome} foi adicionado ao acesso rápido`,
        });
      } catch (error) {
        console.error("Erro ao registrar atividade:", error);
      }

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
      <DialogContent className="w-[95vw] max-w-[700px] h-[90vh] max-h-[700px] sm:h-[500px] xl:h-[700px] flex flex-col text-[#002855] mx-auto p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between text-lg sm:text-xl">
            <span className="text-base sm:text-lg">
              Adicionar ao Acesso Rápido
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 text-[#002855] min-h-0"
        >
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pr-1 sm:pr-2">
            <div className="space-y-3 sm:space-y-4">
              <div className="px-3 sm:px-6">
                <Label className="text-sm font-medium mb-3 sm:mb-4 block">
                  Selecione o Menu
                </Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {availableMenus.map((menu) => (
                    <div
                      key={menu.titulo}
                      onClick={() =>
                        !menu.isDisabled && setSelectedMenu(menu.nome)
                      }
                      className={`flex flex-col items-center p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 min-h-[100px] sm:min-h-[120px] ${
                        menu.isDisabled
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                          : selectedMenu === menu.nome
                          ? "border-[#002855] bg-blue-50 cursor-pointer shadow-md"
                          : "border-gray-200 hover:border-[#002855] hover:bg-gray-50 cursor-pointer hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 flex-shrink-0 ${
                          menu.isDisabled ? "text-gray-400" : "text-[#002855]"
                        }`}
                      >
                        {React.createElement(menu.icone)}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-medium text-center leading-tight ${
                          menu.isDisabled ? "text-gray-400" : "text-[#002855]"
                        }`}
                      >
                        {menu.nome}
                      </span>
                      {menu.isDisabled && (
                        <span className="text-xs text-gray-500 mt-1 text-center">
                          Já adicionado
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t mt-4 sm:mt-6 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedMenu || isLoading}
              className="bg-[#002256] hover:bg-[#002256d1] text-white w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Adicionando...</span>
                  <span className="sm:hidden">Adicionando</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    Adicionar ao Acesso Rápido
                  </span>
                  <span className="sm:hidden">Adicionar</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
