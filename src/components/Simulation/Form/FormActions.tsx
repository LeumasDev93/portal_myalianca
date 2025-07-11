import { FaSpinner } from "react-icons/fa";

export default function FormActions({
  submitting,
  onCancel,
  onNext,
  onPrevious,
}: {
  submitting: boolean;
  onCancel?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}) {
  const handleLeftButton = () => {
    if (onPrevious) {
      return onPrevious();
    } else if (onCancel) {
      return onCancel();
    }
  };

  const leftButtonLabel = onPrevious ? "◀ VOLTAR" : "CANCELAR";

  return (
    <div className="flex justify-center space-x-3 mt-6">
      {(onPrevious || onCancel) && (
        <button
          type="button"
          onClick={handleLeftButton}
          disabled={submitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {leftButtonLabel}
        </button>
      )}

      <button
        onClick={onNext}
        disabled={submitting}
        className="px-6 py-2 bg-[#002256] text-white rounded-md hover:bg-[#003380] disabled:opacity-50 flex items-center"
      >
        {submitting && <FaSpinner className="animate-spin mr-2" />}
        {submitting ? "Enviando..." : "AVANÇAR ▶"}
      </button>
    </div>
  );
}
