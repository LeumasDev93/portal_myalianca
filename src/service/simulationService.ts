import { getSession, signIn } from "next-auth/react";

interface SimulationFormData {
    licensePlate: string;
    licenseDate: string;
    brand: string;
    model: string;
    seats?: string;
    cylinderCap?: string;
    weight?: string;
    chassis: string;
    Ilha: string;
    TipoDeUtilizacao: string;
    ilha?: string;
    tipo_veiculo?: string;
    name: string;
    name_condutor?: string;
    birthDate: string;
    driverLicenseNumber: string;
    driverLicenseDate: string;
    gender: string;
    nif: string;
    bi: string;
    passport: string;
    entityType: string;
    maritalStatus: string;
    email?: string;
    emails?: string;
    mobile?: string;
    mobiles?: string;
    currentValue: string;
}

interface SimulationResult {
    installmentValues: unknown;
}

export const fetchSimulation = async (
    formData: SimulationFormData,
    setIsLoading: (loading: boolean) => void,
    setSimulationResult: (result: SimulationResult) => void,
    productId?: string
) => {
    setIsLoading(true);
    const session = await getSession();

    if (!session?.user?.accessToken) {
        console.warn("Nenhum token encontrado - redirecionando para login");
        signIn();
        return null;
    }

    const generateRandomSimulationId = (): number => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
        return Number(timestamp);
    };

    const idSimulationTel = generateRandomSimulationId();

    const payload = {
        productId: productId,
        idSimulationTel,
        producer: 2,
        registerDateSimulationTel: new Date().toISOString(),
        product: "EXTERNAL_AUTO",
        currency: "CVE",
        totalPremium: 0,
        startDate: new Date().toISOString().split('T')[0],
        simulationObjects: [
            {
                properties: {
                    licensePlate: formData.licensePlate || "",
                    licenseDate: formData.licenseDate || "",
                    brand: formData.brand || "",
                    model: formData.model || "",
                    seats: formData.seats ? parseInt(formData.seats) : 0,
                    cylinderCap: formData.cylinderCap ? parseInt(formData.cylinderCap) : 0,
                    weight: formData.weight ? parseInt(formData.weight) : 0,
                    chassis: formData.chassis || "",
                    currentValue: formData.currentValue || "0",
                    Ilha: formData.ilha || "",
                    TipoDeUtilizacao: formData.tipo_veiculo || ""
                },
                children: [
                    {
                        type: "AUTO_C",
                        properties: {
                            name: formData.name_condutor || formData.name,
                            birthDate: formData.birthDate,
                            driverLicenseNumber: formData.driverLicenseNumber,
                            driverLicenseDate: formData.driverLicenseDate,
                            gender: formData.gender
                        }
                    },
                ]
            }
        ],
        client: {
            nif: formData.nif,
            name: formData.name,
            bi: formData.bi,
            birthDate: formData.birthDate,
            entityType: formData.entityType,
            maritalStatus: formData.maritalStatus,
            passport: formData.passport,
            gender: formData.gender,
            emails: formData.emails ? [formData.emails] : formData.email ? [formData.email] : [],
            mobiles: formData.mobiles ? [formData.mobiles] : formData.mobile ? [formData.mobile] : []
        }
    };

    try {
        // Simulação local
        const response = await fetch("/api/simulation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                token: session.user.accessToken,
                ...payload,
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erro ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const simulationResult = await response.json();
        setSimulationResult(simulationResult.installmentValues);

        try {
            // Enviar resultado da simulação com productId para a API da Aliança
            const dataToSend = {
                ...simulationResult,
                productId: productId
            };
            
            const externalRes = await fetch("/api/sendToAlianca", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!externalRes.ok) {
                const externalError = await externalRes.json().catch(() => ({}));
                console.error("Erro ao enviar para a API da Aliança (via backend):", externalError);
            } else {
                const externalData = await externalRes.json();
                console.log("Resposta da Aliança (via backend):", externalData);
            }
        } catch (err) {
            console.error("Erro ao chamar /api/sendToAlianca:", err);
        }

        return simulationResult;
    } catch (error) {
        console.error("Falha na simulação:", {
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString(),
        });
        if (error instanceof Error && error.message.includes("401")) {
            signIn();
        }
        throw error;
    } finally {
        setIsLoading(false);
    }
};
