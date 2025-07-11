// types/insurance.ts

export interface InsuranceRisk {
  name: string;
  capital: number;
  premium: number;
}

export interface InsurancePolicy {
  name: string | null;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  suspensionDate: string | null;
  cancelDate: string | null;
  capital: number;
  premium: number;
  totalPremium: number;
  risks: InsuranceRisk[];
}


export type Invoice = {
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

export interface ApoliceDataDetails {
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

export type SinistroData = {
  claimNumber: number;
  contractNumber: number;
  occurenceDate: string;
  claimDate: string;
  clientName: string;
  status: string;
  manager: string;
  insuredObjectName: string;
  insuredObjectDescription: string;
  product: string;
}

export type ReciboData = {
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
type InvoiceApolice = {
  invoiceNumber: number;
  invoiceDate: string;
  invoiceValue: number;
};

export interface ApoliceData {
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
  invoices: InvoiceApolice[];
}

export interface Ocorrencia {
  id: string;
  descricao: string;
  envolvidos: string | null;
  status: string;
  id_apolice: string;
  nome_apolice: string;
  tipo_apolice: string;
  id_anexo: string | null;
  user_id: string;
  data_registo: string;
  data_ocorrencia: string | null;
  hora_ocorrencia: string | null;
  local_ocorrencia: string | null;
  boletim_ocorrencia: string | null;
}

// types/typesData.ts
export interface Anexo {
  id: string;
  filename: string;
  content: string; // conteúdo base64 da imagem
  mimetype: string; // ex: "image/jpeg", "image/png", etc.
  userid: string;
  datecreate: string; // ISO string da data de criação
}

export interface Ocorrencia {
  id: string;
  descricao: string;
  envolvidos: string | null;
  status: string;
  id_apolice: string;
  nome_apolice: string;
  tipo_apolice: string;
  id_anexo: string | null;
  user_id: string;
  data_registo: string;
  data_ocorrencia: string | null;
  hora_ocorrencia: string | null;
  local_ocorrencia: string | null;
  boletim_ocorrencia: string | null;
}

export interface FormFieldData {
  name: string;
  label: string;
  type: string;
  fieldSize: number;
  position: number;
  format: string;
  fieldMaxSize: number | null;
  fieldMinSize: number | null;
  required: boolean;
}

export interface FormTab {
  title: string;
  description: string;
  lasttab: boolean;
  form: {
    title: string;
    description: string;
    fields: FormFieldData[];
  };
}

export interface Product {
  name: string;
  description: string;
  category: string;
  mainProduct: boolean;
  icon: string;
  parentProductId: string | null;
  active: boolean;
  tabs: FormTab[];
  productId: string;
}

export interface ApiResponse<T> {
  info: {
    count: number;
    page: number;
    status: number;
    errors: null | string;
  };
  results: T;
}