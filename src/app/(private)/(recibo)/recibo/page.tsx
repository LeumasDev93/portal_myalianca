/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { DotLoading } from "@/components/ui/dot-loading";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { FaDownload, FaSpinner, FaUser } from "react-icons/fa";
import { IoDownloadOutline } from "react-icons/io5";

type ReciboData = {
  number: string;
  clientName: string;
  status: number;
  dueDate: string;
  from: string;
  to: string;
  value: number;
  mbref: string;
  type: number;
  atm: string;
};

type ReciboPageProps = {
  onSelectDetail?: (id: string) => void;
};

type ReciboLoadingState = {
  [number: string]: boolean;
};

export default function ReciboPage({}: ReciboPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStates, setLoadingStates] = useState<ReciboLoadingState>({});
  const [recibos, setRecibos] = useState<ReciboData[]>([]);
  const { token } = useSessionCheckToken();

  useEffect(() => {
    if (!token) return;

    const fetchRecibos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/501417303/invoices`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setRecibos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        setError("Erro ao carregar recibos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecibos();
  }, [token]);

  const handleDownload = async (invoiceNumber: string) => {
    setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: true }));
    setError(null);

    try {
      const response = await fetch(
        `/api/anywhere/api/v1/private/mobile/invoice/${invoiceNumber}/print/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/pdf",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo-${invoiceNumber}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Erro ao baixar PDF:", error);
      setError(error.message || "Erro desconhecido ao baixar PDF.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [invoiceNumber]: false }));
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Meus Recibos
        </h1>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <span className="text-gray-700 font-semibold text-xl uppercase">
            Carregando Recibos
          </span>
          <DotLoading />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : recibos.length === 0 ? (
        <DotLoading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recibos.map((recibo) => (
            <Card key={recibo.number}>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="text-sm xl:text-lg font-bold text-[#002256]">
                    Numero:{" "}
                    <span className="text-sm xl:text-[16px] bg-[#cdcecf] text-[#002256] px-2 py-1 rounded-sm">
                      #{recibo.number}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDownload(recibo.number)}
                    disabled={loadingStates[recibo.number]}
                    className="flex items-center bg-[#002856] hover:bg-[#002856]/50 gap-2"
                  >
                    {loadingStates[recibo.number] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaDownload />
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  <div>Referencia: {recibo.mbref}</div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex items-center just gap-2">
                    <span className="bg-blue-100 rounded-full p-2">
                      <FaUser />
                    </span>{" "}
                    <span>{recibo.clientName}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span>Estado:</span>
                    <span
                      className={`text-xs xl:text-[14px] border ${
                        recibo.status === 1
                          ? "bg-red-200 border-red-400"
                          : recibo.status === 5
                          ? "bg-green-200 border-green-400"
                          : recibo.status === 2
                          ? "bg-blue-200 border-blue-400"
                          : "bg-gray-200 border-gray-400"
                      } bg-[#cdcecf] text-[#002256] px-2 py-1 rounded-sm`}
                    >
                      {recibo.status === 5
                        ? "Concluido"
                        : recibo.status === 1
                        ? "Divida"
                        : recibo.status === 2
                        ? "Pago"
                        : "Pendente"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col">
                  Data Faturacao:
                  <span className="text-xs xl:text-[14px] text-[#002256] ">
                    {formatDate(recibo.dueDate)} - {formatDate(recibo.from)}
                  </span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
