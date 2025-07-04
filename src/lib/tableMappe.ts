

import { formatCurrency, formatDate, getApolicesStatusText, getSinistroStatusText, getStatusApolicesColors, getStatusReciverColors, getStatusSinistrosColors, getTipoRecibo } from "@/lib/utils";
import { ApoliceData, ReciboData, SinistroData } from "@/types/typesData";

export const tableMappeData = () => {
    const formatRecibos = (recibos: ReciboData[]) => {
        return recibos.map(recibo => ({
            ramo: getRamoFromType(recibo.type),
            number: recibo.number,
            clientName: recibo.clientName,
            type: getTipoRecibo(recibo.type),
            date: recibo.from,
            value: formatCurrency(recibo.value),
            status: getStatusReciboText(recibo.status),
            statusClass: getStatusReciverColors(recibo.status),
            rawData: recibo
        }));
    };

    const formatSinistros = (sinistros: SinistroData[]) => {
        return sinistros.map(sinistro => ({
            ramo: sinistro.insuredObjectName,
            clientName: sinistro.product,
            reference: sinistro.claimNumber,
            numberapolice: sinistro.contractNumber,
            occurrenceDate: formatDate(sinistro.occurenceDate),
            status: getSinistroStatusText(sinistro.status),
            statusClass: getStatusSinistrosColors(sinistro.status),
            rawData: sinistro
        }));
    };

    const formatApolices = (apolices: ApoliceData[]) => {
        return apolices.map(apolice => ({
            ramo: apolice.contractNumber,
            numberapolice: apolice.contractNumber,
            dateEnd: formatDate(apolice.endDate),
            value: formatCurrency(apolice.premium),
            status: getApolicesStatusText(apolice.contractStatus),
            statusClass: getStatusApolicesColors(apolice.contractStatus),
            action: apolice.contractNumber === 2 ? 'Pagar' : '',
            rawData: apolice
        }));
    };

    // Funções auxiliares (implemente conforme sua necessidade)
    const getRamoFromType = (type: number) => {
        const ramos = ['Automóvel', 'Habitação', 'Viagem', 'Vida', 'Saúde'];
        return ramos[type] || 'Outros';
    };

    const getStatusReciboText = (status: number) => {
        const statusMap: Record<number, string> = {
            1: 'Em Cobrança',
            2: 'Em Cobrança',
            5: 'Cobrado',
            8: 'Regularizado',
            9: 'Anulado'
        };
        return statusMap[status] || 'Desconhecido';
    };

    // ... outras funções auxiliares

    return { formatRecibos, formatSinistros, formatApolices };
};


