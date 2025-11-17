// src/service/dynamicApiService.ts
import { getSession } from "next-auth/react";

/**
 * URLs base para diferentes providers
 */
const API_BASE_URLS = {
  Anywhere: '/api/anywhere',
  Alianca: process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATOR || 'https://api.aliancaseguros.cv',
};

export interface ApiOption {
  id: number | string;
  name: string;
}

/**
 * Busca dados de API dinamicamente baseado no provider e sourceData
 */
export async function fetchDynamicApiData(
  sourceData: string,
  provider: string | null,
  targetFieldValue?: string | number,
  formValues?: Record<string, unknown>
): Promise<ApiOption[]> {
  // Determinar a base URL baseada no provider
  const providerName = provider || 'Anywhere'; // Default para Anywhere
  
  // Para Anywhere, precisamos do token da sessão
  const session = providerName === 'Anywhere' ? await getSession() : null;
  const baseUrl = API_BASE_URLS[providerName as keyof typeof API_BASE_URLS] || API_BASE_URLS.Anywhere;

  // Construir o endpoint (sem baseUrl ainda)
  let endpoint = sourceData;
  
  // Substituir placeholders como {{id}} ou {{brand}}
  if (targetFieldValue !== undefined && targetFieldValue !== null) {
    endpoint = endpoint.replace(/\{\{id\}\}/g, String(targetFieldValue));
    endpoint = endpoint.replace(/\{\{brand\}\}/g, String(targetFieldValue));
  }

  // Substituir outros placeholders do formValues se necessário
  if (formValues) {
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        endpoint = endpoint.replace(placeholder, String(value));
      }
    });
  }

  // Preparar headers baseado no provider
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  let apiUrl: string;

  // Se for Anywhere, usar token do Anywhere
  if (providerName === 'Anywhere') {
    if (!session?.user.accessToken) {
      throw new Error("Token de acesso do Anywhere não disponível");
    }
    headers.Authorization = `Bearer ${session.user.accessToken}`;
    
    // Construir URL completa para Anywhere
    // O rewrite em next.config.ts redireciona /api/anywhere/:path* para https://aliancacvtest.rtcom.pt/anywhere/:path*
    // Então precisamos construir: /api/anywhere/api/v1/{endpoint}
    if (!endpoint.startsWith('http')) {
      // Remover barra inicial se existir
      let cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      // Se o endpoint não começa com 'api/v1', adicionar
      if (!cleanEndpoint.startsWith('api/v1/')) {
        cleanEndpoint = `api/v1/${cleanEndpoint}`;
      }
      
      // Construir URL usando a rota proxy
      const baseUrlClean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      apiUrl = `${baseUrlClean}/${cleanEndpoint}`;
    } else {
      apiUrl = endpoint;
    }
  }
  // Se for Alianca, usar rota API intermediária (ApiKey não deve ser exposta no cliente)
  else if (providerName === 'Alianca') {
    // Para Alianca, vamos usar uma rota API intermediária
    // A rota /api/alianca será criada para fazer a chamada com ApiKey
    apiUrl = `/api/alianca?endpoint=${encodeURIComponent(endpoint)}`;
    // Não precisa de Authorization header aqui, será tratado na rota API
  } else {
    // Fallback para Anywhere
    if (!session?.user.accessToken) {
      throw new Error("Token de acesso não disponível");
    }
    headers.Authorization = `Bearer ${session.user.accessToken}`;
    const baseUrlClean = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    apiUrl = `${baseUrlClean}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;
  }

  // Validar URL antes de fazer a chamada
  if (!apiUrl || apiUrl.trim() === '') {
    throw new Error(`URL inválida: ${apiUrl}`);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalizar a resposta para o formato esperado
    // Pode ser um array direto ou um objeto com propriedades
    let normalizedData: ApiOption[] = [];
    
    interface ApiResponseItem {
      id?: string | number;
      value?: string | number;
      code?: string | number;
      name?: string;
      label?: string;
    }

    if (Array.isArray(data)) {
      normalizedData = (data as ApiResponseItem[]).map((item) => ({
        id: item.id || item.value || item.code || item.name || '',
        name: String(item.name || item.label || item.value || item.id || ''),
      }));
    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      // Se for um objeto com propriedade data
      normalizedData = (data.data as ApiResponseItem[]).map((item) => ({
        id: item.id || item.value || item.code || item.name || '',
        name: String(item.name || item.label || item.value || item.id || ''),
      }));
    } else if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      // Se for um objeto com propriedade results
      normalizedData = (data.results as ApiResponseItem[]).map((item) => ({
        id: item.id || item.value || item.code || item.name || '',
        name: String(item.name || item.label || item.value || item.id || ''),
      }));
    } else {
      // Tentar retornar como está se não for array
      normalizedData = [];
    }
    
    return normalizedData;
  } catch (error) {
    
    // Se for um erro de fetch (Failed to fetch), dar mensagem mais específica
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Falha ao conectar com a API. Verifique se a rota ${apiUrl} está acessível e se há problemas de CORS.`);
    }
    
    throw new Error(`Falha ao conectar com a API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

