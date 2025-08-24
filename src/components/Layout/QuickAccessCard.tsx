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

interface QuickAccessCardProps {
  nome?: string;
  titulo?: string;
  icone?: string;
  descricaoBotao?: string;
  isAddCard?: boolean;
  onClick?: () => void;
  onItemAdded?: () => void; // Callback para atualizar a lista após adicionar item
  existingItems?: Array<{ nome: string }>; // Lista de itens já existentes no acesso rápido
  id?: string; // ID do item para deletar
  onDelete?: () => void; // Callback para atualizar a lista após deletar item
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  nome = "",
  titulo = "",
  icone = "",
  descricaoBotao = "",
  isAddCard = false,
  onClick,
  onItemAdded,
  existingItems = [],
  id,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

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
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT;

      if (!apiKey || !apiBaseUrl) {
        throw new Error("Configuração da API incompleta");
      }

      const response = await fetch(`${apiBaseUrl}/quick-access/1.0.0/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ApiKey: apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar acesso rápido");
      }

      // Chama o callback para atualizar a lista
      onDelete();

      toast({
        title: "Sucesso!",
        description: "Acesso rápido removido com sucesso.",
        variant: "default",
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
        className="flex flex-col bg-white border border-gray-200 rounded-xl w-32 h-32 xl:h-40 sm:w-[200px] xl:w-[270px] shadow-md cursor-pointer transition hover:shadow-xl p-3 xl:p-4 relative"
      >
        {/* Botão de deletar - só aparece se não for o card de adicionar */}
        {!isAddCard && id && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-1 right-1 z-10 p-1 shadow-2xl rounded-full hover:bg-gray-200 text-red-500 transition-colors disabled:opacity-50"
            title="Remover acesso rápido"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isAddCard ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-2">
            <Plus className="text-gray-400 size-3 sm:size-4 xl:size-8" />
            <p className="text-[10px] sm:text-xs xl:text-sm text-gray-400 leading-tight">
              Adicionar acesso rápido
            </p>
          </div>
        ) : (
          <>
            {/* Título e ícone na mesma linha */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] sm:text-xs xl:text-lg text-[#002855] font-semibold flex-1 mr-2">
                {nome}
              </h3>
              <div className="text-[#002855] text-xl flex-shrink-0 mr-4">
                {getIconComponent(icone)}
              </div>
            </div>

            <p className="text-gray-600 text-left text-xs xl:text-base mb-3 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
              {titulo}
            </p>

            <div className="w-full">
              <div className="bg-[#002855] text-white py-1.5 px-3 rounded-lg text-center w-full">
                <span className="text-[8px] sm:text-[10px] xl:text-sm font-semibold">
                  {descricaoBotao || "Acessar"}
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
