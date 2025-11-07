/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  objeto_seguro: string | null;
  tipo_apolice: string;
  id_anexos: string | null;
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
  url?: string; // URL direta para download da imagem
}

export interface FormFieldData {
  name: string;
  label: string;
  type: string;
  fieldSize: number;
  position: number;
  format: string;
  fieldPlaceholder: string;
  sourceDataType: string;
  sourceData: string;
  fieldMaxSize: number | null;
  fieldMinSize: number | null;
  required: boolean;
}

export interface FormTab {
  title: string;
  description: string;
  webIcon: string;
  mobileIcon: string;
  lasttab: boolean;
  form: {
    title: string;
    description: string;
    mobileGridSize: string;
    webGridSize: string;
    fields: FormFieldData[];
  };
}

export interface Product {
  name: string;
  description: string;
  category: string;
  webIcon: string;
  mainProduct: boolean;
  icon: string;
  mobileIcon: string;
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


//---------------------------------Simulaction-----------------------------------//


interface Taxes {
  [key: string]: number;
}

interface InstallmentValue {
  name: string;
  value: number;
  annualValue: number;
  taxes: Taxes;
}

interface SimulationObjectProperty {
  name: string;
  type: string;
  value: string;
  rank: number;
  translationCode: string;
}

interface PropertyGroup {
  name: string;
  values: SimulationObjectProperty[];
}

interface Risk {
  name: string;
  order: number;
  code: string;
  active: boolean;
  capital: number;
  capitalOption: string;
  premium: number;
  taxes: Taxes;
  bonusMalus: any;
  deductibleValue: number;
}

interface SimulationObject {
  idSimulationObject: number | null;
  reference: string;
  capital: number;
  premium: number;
  premiumTotal: number | null;
  startDate: string;
  endDate: string | null;
  code: string | null;
  status: string;
  description: string | null;
  type: string | null;
  discount: number;
  franchise: number | null;
  propertyGroup: {
    name: string;
    values: {
      name: string;
      type: string;
      value: string;
      rank: number;
      translationCode: string;
    }[];
  } | null;
  risks: {
    name: string;
    order: number;
    code: string;
    active: boolean;
    capital: number;
    capitalOption: string | null;
    premium: number;
    taxes: Record<string, number>;
    bonusMalus: number | null;
    deductibleValue: number;
  }[];
  children: any[];
  dependents: any | null;
}

export interface SimulationResponse {
  idSimulationTel: number;
  idContract: number;
  reference: string;
  totalPremium: number;
  premium: number;
  renewalDate: string;
  continuedDate: string | null;
  clientReference: string | null;
  producerReference: string;
  product: any;
  propertyGroup: any;
  installmentValues: InstallmentValue[];
  simulationObjects: SimulationObject[];
  currency: string;
  currencySymbol: string;
  hasError: boolean;
  errors: string[];
  hasWarnings: boolean;
  warnings: string[];
}

export interface Simulation {
  productName: string;
  clientName: string;
  birthdate: string | null;
  primaryMobileContact: string;
  primaryEmailContact: string | null;
  producerName: string;
  contractStatus: string;
  simulationNumber: number;
  registration: string | null;
  premium: number;
  totalPremium: number;
  startDate: string | null;
  endDate: string | null;
  atm: string | null;
  contacts: string[];
  invoices: any[];
}

//---------------------------------SOAT-----------------------------------//

export interface SoatContent {
  id: string;
  id_soat: string;
  json_content: string;
}

export interface SoatData {
  id: string;
  estado: string;
  situacao: string;
  contents: SoatContent[];
  nome_ficheiro: string;
  mes_referente: string;
  data_criacao: string;
  total_colaborador: number;
  valor_total: string | null;
}

export interface SoatApiResponse {
  info: {
    count: number;
    page: number;
    status: number;
    errors: null | string;
  };
  results: SoatData[];
}

export interface SoatDetailsApiResponse {
  info: {
    count: number;
    page: number;
    status: number;
    errors: null | string;
  };
  results: SoatData;
}