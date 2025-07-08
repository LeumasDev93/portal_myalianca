import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ocrorrenciaDetailsProps = {
  onBack: () => void;
};

export default function OcorrenciaDetailsPage({
  onBack,
}: ocrorrenciaDetailsProps) {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
            Detalhes da Ocorrências
          </h1>
        </div>
      </div>
    </div>
  );
}
