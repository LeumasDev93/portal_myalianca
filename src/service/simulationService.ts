import { getSession, signIn } from "next-auth/react";

interface SimulationResult {
    installmentValues: unknown;
}

/**
 * Gera um ID de simulação baseado no timestamp atual
 */
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

/**
 * Detecta se o placeholder está dentro de aspas no template
 */
const isPlaceholderInQuotes = (template: string, placeholder: string, index: number): boolean => {
    // Verificar caracteres antes e depois do placeholder
    const before = index > 0 ? template[index - 1] : '';
    const after = index + placeholder.length < template.length ? template[index + placeholder.length] : '';
    
    // Se há aspas duplas antes e depois, está dentro de aspas
    // Também verificar se há dois pontos antes (indicando que é um valor de propriedade JSON)
    const hasColonBefore = index > 1 && template.substring(Math.max(0, index - 10), index).includes(':');
    
    // Se há dois pontos antes e aspas depois, provavelmente está dentro de aspas
    // Se não há dois pontos antes mas há aspas antes e depois, está dentro de aspas
    if (before === '"' && after === '"') {
        return true;
    }
    
    // Se há dois pontos antes e aspas depois, está dentro de aspas
    if (hasColonBefore && after === '"') {
        return true;
    }
    
    return false;
};

/**
 * Substitui placeholders no template pelos valores do formulário
 */
const replaceTemplatePlaceholders = (
    template: string,
    formValues: Record<string, unknown>
): string => {
    const originalTemplate = template; // Manter referência ao template original para verificar contexto
    const allReplacements: Array<{ index: number; length: number; replacement: string }> = [];

    // Valores especiais que precisam ser gerados
    const specialValues: Record<string, string | number> = {
        $idSimulationTel: generateRandomSimulationId(),
        $registerDateSimulationTel: new Date().toISOString(),
        $currency: "CVE",
    };

    // Coletar substituições de valores especiais
    Object.entries(specialValues).forEach(([key, value]) => {
        // Escapar o $ no regex
        const escapedKey = key.replace(/\$/g, '\\$');
        const regex = new RegExp(escapedKey, "g");
        let match;
        let foundCount = 0;
        
        // Coletar todas as ocorrências primeiro
        while ((match = regex.exec(originalTemplate)) !== null) {
            foundCount++;
            const offset = match.index;
            const matchStr = match[0];
            const inQuotes = isPlaceholderInQuotes(originalTemplate, matchStr, offset);
            
            // Se é número (idSimulationTel) e não está em aspas, retornar como número
            let replacement: string;
            if (key === '$idSimulationTel' && !inQuotes) {
                replacement = String(value);
            } else {
                // Para outros casos, usar lógica baseada em aspas
                replacement = inQuotes ? String(value) : JSON.stringify(value);
            }
            
            allReplacements.push({
                index: offset,
                length: matchStr.length,
                replacement
            });
        }
        
        if (foundCount === 0) {
            console.warn(`⚠️ Placeholder ${key} não encontrado no template`);
        }
    });

    // Coletar substituições de valores do formulário
    // Procura por placeholders no formato $fieldName
    const placeholderRegex = /\$(\w+)/g;
    const specialKeys = Object.keys(specialValues);
    let fieldMatch;
    
    // Coletar todas as ocorrências primeiro
    while ((fieldMatch = placeholderRegex.exec(originalTemplate)) !== null) {
        const fieldName = fieldMatch[1];
        const offset = fieldMatch.index;
        const matchStr = fieldMatch[0];
        
        // Pular se já foi processado como valor especial
        if (specialKeys.includes(matchStr)) {
            continue;
        }
        
        // Verificar se o valor existe no formulário
        let value = formValues[fieldName];

        // Se não encontrou, tentar variações comuns
        if (value === undefined || value === null || value === "") {
            // Tentar variações de nome
            const variations = [
                fieldName.toLowerCase(),
                fieldName.toUpperCase(),
                fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase(),
            ];

            for (const variation of variations) {
                if (formValues[variation] !== undefined && formValues[variation] !== null && formValues[variation] !== "") {
                    value = formValues[variation];
                    break;
                }
            }
        }

        // Determinar o tipo esperado baseado no nome do campo
        const isArrayField = fieldName === "emails" || fieldName === "mobiles";
        const isNumericField = ["seats", "cylinderCap", "weight", "currentValue", "idSimulationTel"].some(
            field => fieldName.toLowerCase() === field.toLowerCase()
        );

        // Verificar se o placeholder está dentro de aspas (usar originalTemplate)
        const inQuotes = isPlaceholderInQuotes(originalTemplate, matchStr, offset);

        // Determinar o valor de substituição
        let replacement: string;

        // Se ainda não encontrou, usar valor padrão baseado no tipo
        if (value === undefined || value === null || value === "") {
            if (isArrayField) {
                replacement = "[]";
            } else if (isNumericField) {
                replacement = "0";
            } else {
                replacement = inQuotes ? '' : '""';
            }
        } else {
            // Converter o valor para o formato apropriado
            // Se for array (emails, mobiles), sempre retornar como JSON (não está dentro de aspas)
            if (isArrayField) {
                if (Array.isArray(value)) {
                    replacement = JSON.stringify(value);
                } else if (typeof value === "string") {
                    replacement = JSON.stringify([value]);
                } else {
                    replacement = JSON.stringify([String(value)]);
                }
            } else if (isNumericField) {
                // Se for campo numérico, retornar como número (sem aspas)
                const numValue = typeof value === "number" ? value : Number(value);
                replacement = !isNaN(numValue) ? String(numValue) : "0";
            } else {
                // Para strings: se está dentro de aspas, retornar apenas o valor (sem aspas extras)
                if (inQuotes) {
                    // Escapar caracteres especiais mas sem adicionar aspas
                    replacement = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
                } else {
                    // Para strings, retornar com aspas e escapar caracteres especiais
                    replacement = JSON.stringify(String(value));
                }
            }
        }

        allReplacements.push({
            index: offset,
            length: matchStr.length,
            replacement
        });
    }

    // Ordenar substituições por índice (maior primeiro) para substituir de trás para frente
    allReplacements.sort((a, b) => b.index - a.index);

    // Aplicar todas as substituições de trás para frente
    let result = originalTemplate;
    allReplacements.forEach(({ index, length, replacement }) => {
        result = result.substring(0, index) + replacement + result.substring(index + length);
    });

    // Verificação final: substituir qualquer placeholder restante que possa ter sido perdido
    // Isso garante que não sobrem placeholders no resultado final
    const remainingPlaceholderRegex = /\$(\w+)/g;
    let remainingMatch;
    const finalReplacements: Array<{ index: number; length: number; replacement: string }> = [];
    
    while ((remainingMatch = remainingPlaceholderRegex.exec(result)) !== null) {
        const placeholderName = remainingMatch[1];
        const offset = remainingMatch.index;
        const matchStr = remainingMatch[0];
        
        // Se ainda há um placeholder, tentar substituir por valor padrão
        // Verificar se está em aspas
        const inQuotes = isPlaceholderInQuotes(result, matchStr, offset);
        
        // Tentar encontrar no formValues novamente
        let replacement = '';
        const isNumericField = ['idSimulationTel'].includes(placeholderName);
        
        if (formValues[placeholderName] !== undefined && formValues[placeholderName] !== null) {
            const value = formValues[placeholderName];
            if (isNumericField && !inQuotes) {
                replacement = String(value);
            } else {
                replacement = inQuotes ? String(value) : JSON.stringify(String(value));
            }
        } else if (placeholderName === 'idSimulationTel') {
            const value = generateRandomSimulationId();
            replacement = inQuotes ? String(value) : String(value); // Número sem aspas
        } else if (placeholderName === 'registerDateSimulationTel') {
            const value = new Date().toISOString();
            replacement = inQuotes ? value : JSON.stringify(value);
        } else if (placeholderName === 'currency') {
            const value = 'CVE';
            replacement = inQuotes ? value : JSON.stringify(value);
        } else {
            // Se não encontrou valor, usar string vazia ou 0 dependendo do contexto
            replacement = inQuotes ? '' : '""';
        }
        
        finalReplacements.push({
            index: offset,
            length: matchStr.length,
            replacement
        });
    }
    
    // Aplicar substituições finais de trás para frente
    finalReplacements.sort((a, b) => b.index - a.index);
    finalReplacements.forEach(({ index, length, replacement }) => {
        result = result.substring(0, index) + replacement + result.substring(index + length);
    });

    // Verificação final: se ainda há placeholders, logar um aviso
    const stillRemaining = result.match(/\$(\w+)/g);
    if (stillRemaining && stillRemaining.length > 0) {
        console.warn(`⚠️ Ainda há placeholders não substituídos: ${stillRemaining.join(', ')}`);
    }

    return result;
};

/**
 * Processa o bodyTemplate e retorna o payload da simulação
 */
const buildSimulationPayload = (
    bodyTemplate: string,
    formValues: Record<string, unknown>,
    productId?: string
): Record<string, unknown> => {
    // Substituir placeholders no template
    const templateWithValues = replaceTemplatePlaceholders(bodyTemplate, formValues);

    // Parsear o JSON resultante
    let payload;
    try {
        payload = JSON.parse(templateWithValues);
    } catch (error) {
        console.error("Erro ao parsear template:", error);
        console.error("Template processado:", templateWithValues);
        throw new Error("Erro ao processar template da simulação");
    }

    // Adicionar campos obrigatórios que podem estar faltando
    if (payload.totalPremium === undefined) {
        payload.totalPremium = 0;
    }
    
    if (!payload.startDate) {
        payload.startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Garantir que client.mobiles existe
    if (payload.client) {
        if (!payload.client.mobiles || !Array.isArray(payload.client.mobiles)) {
            // Tentar obter do formValues
            const mobilesValue = formValues.mobiles || formValues.mobile;
            if (mobilesValue) {
                payload.client.mobiles = Array.isArray(mobilesValue) ? mobilesValue : [mobilesValue];
            } else {
                payload.client.mobiles = [];
            }
        }
    }

    // Garantir que simulationObjects[0].children[0].type existe e não está vazio
    if (payload.simulationObjects && Array.isArray(payload.simulationObjects) && payload.simulationObjects.length > 0) {
        const simObj = payload.simulationObjects[0];
        
        // Garantir que currentValue seja string se necessário (algumas APIs esperam string)
        if (simObj.properties && simObj.properties.currentValue !== undefined) {
            // Se for número, converter para string (algumas APIs esperam string)
            if (typeof simObj.properties.currentValue === 'number') {
                simObj.properties.currentValue = String(simObj.properties.currentValue);
            }
        }
        
        if (simObj.children && Array.isArray(simObj.children) && simObj.children.length > 0) {
            const child = simObj.children[0];
            // Se type está vazio ou não existe, usar "AUTO_C" como padrão
            if (!child.type || child.type === "") {
                child.type = formValues.type || "AUTO_C";
            }
            
            // Garantir que gender está nas properties do child se existir no formValues
            if (child.properties && formValues.gender && !child.properties.gender) {
                child.properties.gender = formValues.gender;
            }
        }
    }

    // Adicionar productId se fornecido
    if (productId) {
        payload.productId = productId;
    }

    return payload;
};

export const fetchSimulation = async (
    formValues: Record<string, unknown>,
    bodyTemplate: string,
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

    if (!bodyTemplate) {
        throw new Error("Template da simulação não fornecido");
    }

    // Log para verificar valores recebidos
    console.log("📋 Dados recebidos no fetchSimulation:", {
        formValues,
        bodyTemplate: bodyTemplate.substring(0, 200) + "...",
    });

    // Construir payload dinamicamente a partir do template
    const payload = buildSimulationPayload(bodyTemplate, formValues, productId);

    console.log("📦 Payload gerado:", JSON.stringify(payload, null, 2));

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
