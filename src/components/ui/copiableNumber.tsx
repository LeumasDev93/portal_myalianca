import { useState } from "react";
import { Check, Copy } from "lucide-react";

const CopiableNumber = ({ number }: { number: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(number)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Falha ao copiar: ", err);
      });
  };

  return (
    <span
      onClick={copyToClipboard}
      className="text-sm xl:text-[16px] bg-[#cdcecf] text-[#002256] px-2 py-1 rounded-sm cursor-pointer hover:bg-[#b4b5b6] transition-colors flex items-center gap-1"
    >
      #{number}
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 opacity-70 hover:opacity-100" />
      )}
    </span>
  );
};

export default CopiableNumber;
