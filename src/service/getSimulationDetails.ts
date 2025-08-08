import { SimulationResponse } from "@/types/typesData";

export const getSimulationDetails = async (
    reference: string
): Promise<SimulationResponse> => {
    
    const res = await fetch(`/api/detailsSimulations?reference=${reference}`, {
        method: "GET",
    });

    if (!res.ok) {
    }

    const responseData = await res.json();
    
    if (responseData.simulation) {
        return responseData.simulation;
    }
    
    return responseData;
};
