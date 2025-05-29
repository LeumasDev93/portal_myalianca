/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ArrowLeft,
  Calendar,
  AlertCircle,
  User,
  Car,
  CreditCard,
  Clock,
  Home,
  Shield,
  Check,
  Download,
  Phone,
  AlertTriangle,
  Receipt,
  FileWarning,
  Eye,
  Calculator,
  Globe,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSessionCheckToken } from "@/hooks/useSessionToken";
import { useEffect, useState } from "react";
import {
  formatCurrency,
  formatDate,
  getStatusText,
  getStatusVariant,
} from "@/lib/utils";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import {
  FaAddressCard,
  FaCar,
  FaDollarSign,
  FaMobile,
  FaRegCalendar,
  FaUser,
} from "react-icons/fa";
import { RiShieldStarFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";

type Invoice = {
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
interface ApoliceDataDetails {
  productName: string;
  contractNumber: number;
  clientName: string;
  birthdate: string;
  primaryMobileContact: string;
  primaryEmailContact: string;
  producerName: string;
  contractStatus: string;
  registration: string;
  premium: number;
  totalPremium: number;
  startDate: string;
  endDate: string;
  atm: string;
  contacts: string[];
  invoices: Invoice[];
}
// interface dados [

//     "productName": "Caução",
//     "contractNumber": 273,
//     "clientName": "Testes1",
//     "birthdate": null,
//     "primaryMobileContact": "915377717",
//     "primaryEmailContact": "sara.soares@rtcom.pt",
//     "producerName": "Agência Sede",
//     "contractStatus": "C",
//     "registration": null,
//     "premium": 3600.0,
//     "totalPremium": 4189.5,
//     "startDate": "2025-03-20T01:00:00.000+00:00",
//     "endDate": "2025-06-17T01:00:00.000+00:00",
//     "atm": null,
//     "contacts": [
//         "sara.soares@rtcom.pt",
//         "915377717",
//         "915377717"
//     ],
//     "invoices": [
//         {
//             "number": "P2025.90",
//             "clientName": "Testes1",
//             "status": 5,
//             "dueDate": "2025-04-03T01:00:00.000+00:00",
//             "from": "2025-03-20",
//             "to": "2025-06-17",
//             "value": 4189.5,
//             "mbref": "",
//             "type": 1,
//             "atm": null
//         }
//     ]
// ]
type ApoliceDetailPageProps = {
  id: string;
  onBack: () => void;
};
export default function ApoliceDetailPage({
  id,
  onBack,
}: ApoliceDetailPageProps) {
  const { token } = useSessionCheckToken();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apoliceDetails, setApoliceDetails] = useState<ApoliceDataDetails[]>(
    []
  );
  console.log("Apolice id:", id);

  useEffect(() => {
    if (!token) return;

    const fetchApolices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/anywhere/api/v1/private/mobile/contract/${id}/info`,
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
        setApoliceDetails(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Erro ao buscar apólices:", error);
        setError("Erro ao carregar apólices. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApolices();
  }, [token, id]);

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onBack}
            className="flex items-center bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-600 hover:text-gray-800 rounded-md px-2 sm:px-4 py-1 sm:py-2"
          >
            <ArrowLeft className="h-4 w-4 " />
          </Button>
          <h1 className="text-[16px] sm:text-2xl xl:text-3xl text-[#002256] font-bold tracking-tight">
            Detalhes da Apólice
          </h1>
        </div>
        {apoliceDetails.map((apolice, idx) => (
          <div key={idx} className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() =>
                console.log("baixar apolice", apolice.invoices[0].number)
              }
              className="bg-[#002256] hover:bg-[#002256]/80 text-sm text-white flex items-center rounded-md px-2 sm:px-4 py-1 sm:py-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar Apólice
            </button>
          </div>
        ))}
      </div>
      {apoliceDetails.map((apolice, idx) => (
        <div key={idx} className="space-y-4">
          <Card>
            <CardHeader className="">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#002256] p-2 sm:p-3  rounded-full text-white">
                    <IoShieldCheckmarkSharp className="size-4 sm:size-5 xl:size-6" />
                  </div>
                  <div className="flex flex-col ">
                    <CardTitle className="flex items-center gap-2 text-xl text-[#002256]">
                      {apolice.productName}
                    </CardTitle>
                    <CardDescription>
                      Apólice #{apolice.contractNumber} • Veículo:{" "}
                      {apolice.registration}
                    </CardDescription>
                  </div>
                  <div className="hidden sm:flex flex-col ">
                    <Badge
                      className={`${getStatusVariant(
                        apolice.contractStatus
                      )} px-2 py-1 text-xs xl:text-sm font-medium `}
                    >
                      {getStatusText(apolice.contractStatus)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(apolice.totalPremium)}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span>12x de {formatCurrency(apolice.premium)} </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Tabs defaultValue="detalhes" className="">
            <TabsList className="flex justify-start space-x-2">
              <TabsTrigger
                className="px-4 py-2 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                value="detalhes"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                className="px-4 py-2 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                value="coberturas"
              >
                Coberturas
              </TabsTrigger>
              <TabsTrigger
                className="px-4 py-2 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                value="documentos"
              >
                Documentos
              </TabsTrigger>
              <TabsTrigger
                className="px-4 py-2 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
                value="historico"
              >
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="detalhes"
              className="bg-white rounded-lg px-4 xl:p-6"
            >
              <div>
                <h3 className="text-lg font-semibold uppercase">
                  Informações da Apólice
                </h3>
                <div className="flex flex-col gap-6 py-4 xl:py-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Veículo
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Vigência
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {formatDate(apolice.startDate)} a {""}
                        {formatDate(apolice.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaDollarSign className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        valor
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {formatCurrency(apolice.premium)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <RiShieldStarFill className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        cobertura
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.contractStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-red-600" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold uppercase">
                  Detalhes da Veículo
                </h3>
                <div className="flex flex-col gap-6 py-4 xl:py-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Matrícula
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.registration}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Chassi
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.contractNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Modelo
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaRegCalendar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Ano
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {formatDate(apolice.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Cor
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.contractStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaCar className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Franquia
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {formatCurrency(apolice.premium)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-red-600" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold uppercase">
                  Informações do Segurado
                </h3>
                <div className="flex flex-col gap-6 py-4 xl:py-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaUser className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Nome Completo
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaAddressCard className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Nif
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.primaryMobileContact}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaMobile className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Telefone
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.contacts[1]}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <MdEmail className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Email
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.contacts[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-red-600" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold uppercase">
                  Assistência 24h
                </h3>
                <div className="flex flex-col gap-6 py-4 xl:py-6">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <FaMobile className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Telefone de Emergência
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.primaryMobileContact}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200  p-2 rounded-full ">
                        <MdEmail className="size-3 sm:size-4 xl:size-5 text-[#002256]" />
                      </div>
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base uppercase">
                        Whatsapp
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-[12px] xl:text-base ">
                        {apolice.primaryEmailContact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="bg-red-600" />
              <div className="mt-4">
                <div className="flex justify-end gap-2">
                  <Button className="bg-white border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                    Abrir Sinistro
                  </Button>
                  <Button className="bg-white border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                    Solicitar Contacto
                  </Button>
                  <Button className="bg-white border border-blue-950 hover:bg-blue-950 text-blue-950 hover:text-white">
                    Renovar Apolice
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coberturas">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Coberturas Contratadas
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {apolice.invoices.map((invoice, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="font-medium">
                          {invoice.clientName}
                        </span>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {invoice.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  );
}
