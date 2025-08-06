/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSession, signIn } from "next-auth/react";


export const fetchSimulation = async (
    formData: any,
    setIsLoading: (loading: boolean) => void,
    setSimulationResult: (result: any) => void
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
        const month = String(now.getMonth() + 1).padStart(2, "0"); // mês começa do 0
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
        return Number(timestamp); // Converte para número
    };


    const idSimulationTel = generateRandomSimulationId();
    console.log(idSimulationTel, "id gerado");
    // Extrai os dados do formulário
    const {
        licensePlate,
        licenseDate,
        brand,
        model,
        seats,
        cylinderCap,
        weight,
        chassis,
        Ilha,
        TipoDeUtilizacao,
        name,
        birthDate,
        driverLicenseNumber,
        driverLicenseDate,
        gender,
        nif,
        bi,
        passport,
        entityType,
        maritalStatus,
        email,
        mobile,
        currentValue
    } = formData;

    // Monta o payload com os dados do formulário
    const payload = {
        idSimulationTel: idSimulationTel,
        producer: 2,
        registerDateSimulationTel: new Date().toISOString(),
        product: "EXTERNAL_AUTO",
        currency: "CVE",
        totalPremium: 0,
        startDate: new Date().toISOString().split('T')[0],
        simulationObjects: [
            {
                properties: {
                    licensePlate: licensePlate,
                    licenseDate: licenseDate,
                    brand: brand,
                    model: model,
                    seats: seats ? parseInt(seats) : undefined,
                    cylinderCap: cylinderCap ? parseInt(cylinderCap) : undefined,
                    weight: weight ? parseInt(weight) : undefined,
                    chassis: chassis,
                    currentValue: currentValue,
                    Ilha: Ilha,
                    TipoDeUtilizacao: TipoDeUtilizacao
                },

                children: [
                    {
                        type: "AUTO_C",
                        properties: {
                            name: name,
                            birthDate: birthDate,
                            driverLicenseNumber: driverLicenseNumber,
                            driverLicenseDate: driverLicenseDate,
                            gender: gender
                        }
                    },
                ]
            }
        ],
        client: {
            nif: nif,
            name: name,
            bi: bi,
            birthDate: birthDate,
            entityType: entityType,
            maritalStatus: maritalStatus,
            passport: passport,
            gender: gender,
            emails: email ? [email] : [],
            mobiles: mobile ? [mobile] : []
        }
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
        return data;
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
