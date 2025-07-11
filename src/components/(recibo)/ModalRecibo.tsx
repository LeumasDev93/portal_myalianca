import React from "react";
import { FaTimes } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";

type ReciboPDFModalProps = {
  pdfUrl: string;
  onClose: () => void;
};

export function ReciboPDFModal({ pdfUrl, onClose }: ReciboPDFModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-lg relative overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-100">
          <div
            className="text-[#002256] flex items-center cursor-pointer"
            onClick={onClose}
          >
            <MdOutlinePayment className="mr-2 size-4 xl:size-6" />
            <h2 className="text-lg font-semibold ">Pagar Agora</h2>
          </div>
          <div className="flex items-center space-x-4">
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
