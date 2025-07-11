import { FaTimes } from "react-icons/fa";

export default function FormHeader({
  title,
  description,
  onClose,
}: {
  title?: string;
  description?: string;
  onClose?: () => void;
}) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-xl font-bold text-[#002256]">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
      )}
    </div>
  );
}
