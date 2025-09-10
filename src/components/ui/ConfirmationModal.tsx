import { FaExclamationTriangle } from "react-icons/fa";
import { ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
  type = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "text-red-500",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          icon: <FaExclamationTriangle className="w-6 h-6" />,
        };
      case "warning":
        return {
          iconColor: "text-yellow-500",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          icon: <FaExclamationTriangle className="w-6 h-6" />,
        };
      case "info":
        return {
          iconColor: "text-blue-500",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: <FaExclamationTriangle className="w-6 h-6" />,
        };
      default:
        return {
          iconColor: "text-red-500",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          icon: <FaExclamationTriangle className="w-6 h-6" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`${styles.iconColor} mr-3`}>{styles.icon}</div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>

          <div className="text-gray-600 mb-6 text-left">
            {typeof message === "string" ? (
              <div className="whitespace-pre-line">{message}</div>
            ) : (
              message
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {loading ? "Processando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
