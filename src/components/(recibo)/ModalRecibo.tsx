import React from "react";
import { FaTimes } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";

type ReciboPDFModalProps = {
  pdfUrl: string;
  onClose: () => void;
  reciboStatus?: number;
  reciboNumber?: string;
  onPayment?: () => void;
  onDownload?: () => void;
};

export function ReciboPDFModal({
  pdfUrl,
  onClose,
  reciboStatus,
  reciboNumber,
  onPayment,
  onDownload,
}: ReciboPDFModalProps) {
  // Determinar se pode pagar baseado no status
  const canPay =
    !reciboStatus ||
    (reciboStatus !== 1 && reciboStatus !== 2 && reciboStatus !== 5);

  // Determinar se pode baixar baseado no status
  const canDownload =
    reciboStatus &&
    (reciboStatus === 1 || reciboStatus === 2 || reciboStatus === 5);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg relative overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-100">
          <div className="text-[#002256] flex items-center">
            <MdOutlinePayment className="mr-2 size-4 xl:size-6" />
            <h2 className="text-sm sm:text-lg font-semibold">
              Detalhes do Recibo #{reciboNumber}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {canPay && onPayment && (
              <button
                onClick={onPayment}
                className="bg-[#002256] text-white px-4 py-2 rounded-md text-sm sm:text-lg hover:bg-[#001a3d] transition-colors"
              >
                Pagar Agora
              </button>
            )}
            {canDownload && onDownload && (
              <button
                onClick={onDownload}
                className="bg-[#002256] text-white px-4 py-2 text-sm sm:text-lg rounded-md hover:bg-[#002256]/70 transition-colors"
              >
                Baixar Recibo
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Corpo com iframe */}
        <iframe src={pdfUrl} title="Recibo PDF" className="w-full h-full" />
      </div>
    </div>
  );
}
