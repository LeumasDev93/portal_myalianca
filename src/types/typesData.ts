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