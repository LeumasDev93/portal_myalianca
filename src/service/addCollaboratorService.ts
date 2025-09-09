/* eslint-disable @typescript-eslint/no-explicit-any */
interface AddCollaboratorRequest {
  id_soat: string;
  json_content: string;
}

interface AddCollaboratorResponse {
  info: {
    count: number;
    page: number;
    status: number;
    errors: string | null;
  };
  results?: any;
}

export const addCollaborator = async (data: AddCollaboratorRequest): Promise<AddCollaboratorResponse> => {
  try {
    // Usar a URL base do .env.local - seguindo o padrão do useSoatDetails
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_DEFAULT || 'https://api.aliancaseguros.cv';
    const url = `/soat/1.0.0/add-colaborator`;
    const fullUrl = `${baseUrl}${url}`;
    
    console.log('URL completa para adicionar colaborador:', fullUrl);
    console.log('Dados sendo enviados:', data);
    
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';
    console.log('API Key sendo usado:', apiKey ? `${apiKey.substring(0, 20)}...` : 'Não encontrado');
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta da API:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result: AddCollaboratorResponse = await response.json();
    
    console.log('Resposta da API Add Collaborator:', result);
    
    return result;
  } catch (error: any) {
    console.error('Erro ao adicionar colaborador:', error);
    throw new Error(`Erro na requisição: ${error.message || 'Erro desconhecido'}`);
  }
};
