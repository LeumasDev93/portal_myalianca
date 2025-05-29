/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, AlertCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { LoadingSpinner } from "./ui/loading";
import { DotLoading } from "./ui/dot-loading";
import { LoadingScreen } from "./ui/loading-screen";
import { ApoliceDetailPage } from "./apolice/DetailsApiloce";

type Invoice = {
  invoiceNumber: number;
  invoiceDate: string;
  invoiceValue: number;
};
interface ApoliceData {
  productName: string;
  contractNumber: number;
  clientName: string;
  birthdate: string | null;
  primaryMobileContact: string;
  primaryEmailContact: string;
  producerName: string;
  contractStatus: string;
  registration: string | null;
  premium: number;
  totalPremium: number;
  startDate: string;
  endDate: string | null;
  atm: string | null;
  contacts: string[];
  invoices: Invoice[];
}

const ApoliceCard = () => {
  const [apolices, setApolices] = useState<ApoliceData[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [modalDetailApolice, setModalDetailApolice] = useState(false);
  const [selectedApoliceId, setSelectedApoliceId] = useState<number | null>(
    null
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT");
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "C":
        return "Concluido";
      case "E":
        return "Em Analise";
      case "A":
        return "Aprovado";
      case "I":
        return "Inativo";
      default:
        return status;
    }
  };

  // Obter variante do badge baseado no status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "C": // Ativo
        return "bg-green-400 text-green-800 border-green-400";
      case "A": // Aprovado
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "E": // Expirado
        return "bg-red-100 text-red-800 border-red-200";
      case "I": // Inativo
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        setToken(session?.user.accessToken || null);
      } catch (error) {
        console.error("Erro ao obter sessão:", error);
        setError("Erro ao autenticar. Por favor, faça login novamente.");
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/entity/nif/501417303/policies`,
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
        setApolices(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
  }, [token]);

  const handleDetailApolice = (id: number) => {
    setSelectedApoliceId(id);
    setModalDetailApolice(true);
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#002256]">
          Minhas Apólices
        </h1>
        <Button
          size="sm"
          className="hidden md:flex bg-[#002256] hover:bg-[#002256]/80"
        >
          <FileText className="mr-2 h-4 w-4" />
          Relatório de Apólices
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <DotLoading />
          <span className="text-gray-700 font-extrabold text-2xl uppercase">
            Carregando Apólices
          </span>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : apolices.length === 0 ? (
        <DotLoading />
      ) : (
        <div className="grid gap-6">
          {apolices.map((apolice) => {
            return (
              <Card key={apolice.contractNumber} className="overflow-hidden">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-company-blue-600">
                        {apolice.productName}
                      </CardTitle>
                      <CardDescription>
                        Apólice #{apolice.contractNumber}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        handleDetailApolice(apolice.contractNumber)
                      }
                      className="bg-[#002256] hover:bg-[#002256]/80"
                      size="sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardHeader>
                {modalDetailApolice && selectedApoliceId && (
                  <ApoliceDetailPage id={selectedApoliceId.toString()} />
                )}
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-2">
                      <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                        <FaUser className="size-10" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Nome
                        </p>
                        <p className="font-bold text-gray-600 text-xl">
                          {apolice.producerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                          <MdOutlineDashboardCustomize className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-company-blue-400">
                            Matricula
                          </p>
                          {apolice.registration ? (
                            <p className="font-medium text-company-blue-600">
                              {apolice.registration}
                            </p>
                          ) : (
                            <p className="flex items-center gap-2 text-sm text-gray-300">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Nenhuma matrícula disponível
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-company-blue-50 p-2 rounded-full text-company-blue-600">
                          <CiCalendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-company-blue-400">
                            Vigência
                          </p>
                          {formatDate(apolice.startDate)} a{" "}
                          {formatDate(apolice.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-400">
                          Estado
                        </span>
                        <Badge
                          className={getStatusVariant(apolice.contractStatus)}
                        >
                          {getStatusText(apolice.contractStatus)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm text-company-blue-600">
                          Prémio Anual: {formatCurrency(apolice.premium)}
                        </span>
                      </div>
                      <Link
                        href={`/apolices/${apolice.contractNumber}`}
                        className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                        Ver todos os detalhes
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApoliceCard;
