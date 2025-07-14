/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSession, signIn } from "next-auth/react";

export const generateRandomSimulationId = (): number => {
    const min = 100000000000; // Menor número de 12 dígitos
    const max = 999999999999; // Maior número de 12 dígitos
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const fetchSimulation = async (formData: any, setIsLoading: (loading: boolean) => void, setSimulationResult: (result: any) => void) => {
    setIsLoading(true);
    const session = await getSession();

    if (!session?.user?.accessToken) {
        console.warn("Nenhum token encontrado - redirecionando para login");
        signIn();
        return null;
    }

    const idSimulationTel = generateRandomSimulationId();
    console.log(idSimulationTel, "id gerado");

    const payload = {
        idSimulationTel: 915650239898,
        producer: 2,
        registerDateSimulationTel: "2025-01-30T10:45:00",
        product: "EXTERNAL_AUTO",
        currency: "CVE",
        totalPremium: 0,
        startDate: "2025-01-30",
        simulationObjects: [
            {
                properties: {
                    licensePlate: "LD-00-DG",
                    licenseDate: "2022-05-22",
                    brand: "Toyota",
                    model: "Corolla",
                    seats: 5,
                    cylinderCap: 1800,
                    weight: 1200,
                    chassis: "47835638",
                    Ilha: "3",
                    TipoDeUtilizacao: "99"
                },
                risks: [
                    {
                        name: "RISK_RC",
                        order: 1,
                        code: "RC",
                        active: true,
                        capitalOption: "G"
                    }
                ],
                children: [
                    {
                        type: "AUTO_C",
                        properties: {
                            name: "teste",
                            birthDate: "1970-06-02",
                            driverLicenseNumber: "123456",
                            driverLicenseDate: "1990-06-02",
                            gender: "M"
                        }
                    },
                    {
                        type: "AUTO_R",
                        properties: {
                            description: "teste"
                        }
                    }
                ]
            }
        ]
    };



    try {
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

        const data = await response.json();
        console.log("Simulação criada:", data.installmentValues);
        setSimulationResult(data.installmentValues);
        setIsLoading(false);
        return data;
    } catch (error) {
        console.error("Falha na simulação:", {
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString(),
        });
        setIsLoading(false);
        if (error instanceof Error && error.message.includes("401")) {
            signIn();
        }
        throw error;
    }
};
