/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  IoGrid,
  IoShieldCheckmarkSharp,
  IoReceiptSharp,
} from "react-icons/io5";
import { LuSquareKanban } from "react-icons/lu";
import { IoMdPin } from "react-icons/io";
import { FaTriangleExclamation } from "react-icons/fa6";
import { AiFillFileExclamation } from "react-icons/ai";
import { TbTopologyStar3 } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { QuickAccessModal } from "./QuickAccessModal";
import { useToast } from "@/components/ui/use-toast";
import { useActivities } from "@/hooks/useActivities";

interface QuickAccessCardProps {
  nome?: string;
  titulo?: string;
  icone?: string;
  border_color?: string;
  icon_color?: string;
  bg_color?: string;
  text_color?: string;
  descricao_botao?: string;
  bg_botton_color?: string;
  isAddCard?: boolean;
  order_number?: number;
  onClick?: () => void;
  onItemAdded?: () => void; // Callback para atualizar a lista após adicionar item
  existingItems?: Array<{ nome: string }>; // Lista de itens já existentes no acesso rápido
  id?: string; // ID do item para deletar
  onDelete?: () => void; // Callback para atualizar a lista após deletar item
  hideDelete?: boolean; // Esconder o botão de deletar
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  nome = "",
  titulo = "",
  icone = "",
  descricao_botao = "",
  border_color = "",
  icon_color = "",
  bg_color = "",
  text_color = "",
  bg_botton_color = "",
  order_number = 0,
  isAddCard = false,
  onClick,
  onItemAdded,
  existingItems = [],
  hideDelete = false,
  id,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { registerActivity } = useActivities();

  const handleCardClick = () => {
    if (isAddCard) {
      setIsModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique propague para o card

    if (!id || !onDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/quick-access/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao deletar acesso rápido");
      }

      // Chama o callback para atualizar a lista
      onDelete();

      // Registrar atividade
      try {
        await registerActivity({
          action: nome,
          description: `Removido do acesso rápido`,
        });
      } catch (error) {
        console.error("Erro ao registrar atividade:", error);
      }

      toast({
        title: "Sucesso!",
        description: "Acesso rápido removido com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao deletar acesso rápido:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao deletar acesso rápido",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType } = {
      IoGrid,
      IoShieldCheckmarkSharp,
      FaTriangleExclamation,
      LuSquareKanban,
      IoReceiptSharp,
      AiFillFileExclamation,
      TbTopologyStar3,
      IoMdPin,
      MdEmail,
    };

    const IconComponent = iconMap[iconName];

    if (IconComponent) {
      return React.createElement(IconComponent);
    }

    return (
      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
        <span className="text-xs text-gray-600">?</span>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`cursor-pointer flex flex-col border rounded-xl w-60 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] shadow-md transition hover:shadow-xl p-3 xl:p-4 relative ${
          bg_color?.startsWith("bg-") ? bg_color : ""
        } ${border_color?.startsWith("border-") ? border_color : ""}`}
        style={{
          backgroundColor: bg_color?.startsWith("bg-") ? undefined : bg_color,
          borderColor: border_color?.startsWith("border-")
            ? undefined
            : border_color,
        }}
      >
        {!isAddCard && id && onDelete && !hideDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-1 right-1 z-10 p-1 shadow-2xl cursor-pointer rounded-full hover:bg-gray-200 text-red-500 transition-colors disabled:opacity-50"
            title="Remover acesso rápido"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isAddCard ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2">
            <Plus className="text-gray-400 size-6 sm:size-8 xl:size-10" />
            <p className="text-[14px] sm:text-sm xl:text-[18px] text-gray-400 leading-tight">
              Adicionar acesso rápido
            </p>
          </div>
        ) : (
          <>
            {/* Título e ícone na mesma linha */}
            <div className="flex justify-between items-center mb-2">
              <h3
                className={`text-[14px] sm:text-xs xl:text-lg font-semibold flex-1 mr-2 ${
                  text_color?.startsWith("text-") ? text_color : ""
                }`}
                style={{
                  color: text_color?.startsWith("text-")
                    ? undefined
                    : text_color,
                }}
              >
                {nome}
              </h3>
              <div
                className={`text-xl flex-shrink-0 mr-4 ${
                  icon_color?.startsWith("text-") ? icon_color : ""
                }`}
                style={{
                  color: icon_color?.startsWith("text-")
                    ? undefined
                    : icon_color,
                }}
              >
                {getIconComponent(icone)}
              </div>
            </div>

            <p className="text-gray-600 text-left text-xs xl:text-base mb-3 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {titulo}
            </p>

            <div className="w-full cursor-pointer" onClick={handleCardClick}>
              <div
                className={`py-1.5 px-3 rounded-lg text-center w-full ${
                  bg_botton_color?.startsWith("bg-") ? bg_botton_color : ""
                }`}
                style={{
                  backgroundColor: bg_botton_color?.startsWith("bg-")
                    ? undefined
                    : bg_botton_color,
                  color: bg_botton_color?.startsWith("bg-")
                    ? "white"
                    : undefined,
                }}
              >
                <span className="text-[12px] sm:text-[10px] xl:text-sm font-semibold">
                  {descricao_botao}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <QuickAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onItemAdded={onItemAdded}
        existingItems={existingItems}
      />
    </>
  );
};

export default QuickAccessCard;
