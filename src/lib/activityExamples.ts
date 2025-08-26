// Hooks especializados para registrar atividades em diferentes partes do sistema

import { useActivities } from "@/hooks/useActivities";

// 1. Hook para registrar ocorrências
export const useOcorrenciaActivity = () => {
  const { registerActivity } = useActivities();

  const registerOcorrenciaActivity = async (ocorrenciaType: string, description: string) => {
    try {
      await registerActivity({
        action: "OCORRENCIA_REGISTRADA",
        description: `Ocorrência ${ocorrenciaType} - ${description}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de ocorrência:", error);
    }
  };

  return { registerOcorrenciaActivity };
};

// 2. Hook para registrar pagamentos
export const usePaymentActivity = () => {
  const { registerActivity } = useActivities();

  const registerPaymentActivity = async (amount: string, productName: string) => {
    try {
      await registerActivity({
        action: "PAGAMENTO_REALIZADO",
        description: `Pagamento de ${amount} - ${productName}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de pagamento:", error);
    }
  };

  return { registerPaymentActivity };
};

// 3. Hook para registrar simulações
export const useSimulationActivity = () => {
  const { registerActivity } = useActivities();

  const registerSimulationActivity = async (productName: string, simulationType: string) => {
    try {
      await registerActivity({
        action: "SIMULACAO_REALIZADA",
        description: `Simulação de ${simulationType} - ${productName}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de simulação:", error);
    }
  };

  return { registerSimulationActivity };
};

// 4. Hook para registrar download de recibos
export const useReciboActivity = () => {
  const { registerActivity } = useActivities();

  const registerReciboDownloadActivity = async (reciboNumber: string, amount: string) => {
    try {
      await registerActivity({
        action: "RECIBO_GERADO",
        description: `Download do recibo ${reciboNumber} - ${amount}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de recibo:", error);
    }
  };

  return { registerReciboDownloadActivity };
};

// 5. Hook para registrar alteração de foto de perfil
export const useProfileActivity = () => {
  const { registerActivity } = useActivities();

  const registerProfilePhotoActivity = async () => {
    try {
      await registerActivity({
        action: "PERFIL_ATUALIZADO",
        description: "Foto de perfil alterada",
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de perfil:", error);
    }
  };

  const registerProfileUpdateActivity = async (fieldName: string) => {
    try {
      await registerActivity({
        action: "PERFIL_ATUALIZADO",
        description: `Campo ${fieldName} atualizado`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de perfil:", error);
    }
  };

  return { registerProfilePhotoActivity, registerProfileUpdateActivity };
};

// 6. Hook para registrar consultas de histórico
export const useHistoricoActivity = () => {
  const { registerActivity } = useActivities();

  const registerHistoricoActivity = async (consultaType: string) => {
    try {
      await registerActivity({
        action: "CONSULTA_HISTORICO",
        description: `Consulta de histórico - ${consultaType}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de histórico:", error);
    }
  };

  return { registerHistoricoActivity };
};

// 7. Hook para registrar consultas de agências
export const useAgenciaActivity = () => {
  const { registerActivity } = useActivities();

  const registerAgenciaActivity = async (location: string) => {
    try {
      await registerActivity({
        action: "CONSULTA_AGENCIA",
        description: `Consulta de agências em ${location}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de agência:", error);
    }
  };

  return { registerAgenciaActivity };
};

// 8. Hook para registrar sinistros
export const useSinistroActivity = () => {
  const { registerActivity } = useActivities();

  const registerSinistroActivity = async (sinistroType: string, vehicleInfo?: string) => {
    try {
      await registerActivity({
        action: "SINISTRO_REGISTRADO",
        description: `Sinistro ${sinistroType}${vehicleInfo ? ` - ${vehicleInfo}` : ''}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de sinistro:", error);
    }
  };

  return { registerSinistroActivity };
};

// 9. Hook para registrar apólices
export const useApoliceActivity = () => {
  const { registerActivity } = useActivities();

  const registerApoliceActivity = async (action: 'NOVA_APOLICE' | 'RENOVACAO_APOLICE', productName: string) => {
    try {
      await registerActivity({
        action,
        description: `${action === 'NOVA_APOLICE' ? 'Nova apólice' : 'Renovação de apólice'} - ${productName}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de apólice:", error);
    }
  };

  return { registerApoliceActivity };
};

// 10. Hook para registrar mensagens
export const useMessageActivity = () => {
  const { registerActivity } = useActivities();

  const registerMessageSentActivity = async (messageType: string, subject?: string) => {
    try {
      await registerActivity({
        action: "MENSAGEM_ENVIADA",
        description: `Mensagem ${messageType} enviada${subject ? ` - ${subject}` : ''}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de mensagem enviada:", error);
    }
  };

  const registerMessageRepliedActivity = async (messageType: string, subject?: string) => {
    try {
      await registerActivity({
        action: "MENSAGEM_RESPONDIDA",
        description: `Resposta a mensagem ${messageType}${subject ? ` - ${subject}` : ''}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de resposta a mensagem:", error);
    }
  };

  const registerMessageForwardedActivity = async (messageType: string, subject?: string) => {
    try {
      await registerActivity({
        action: "MENSAGEM_ENCAMINHADA",
        description: `Mensagem ${messageType} encaminhada${subject ? ` - ${subject}` : ''}`,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade de mensagem encaminhada:", error);
    }
  };

  return { 
    registerMessageSentActivity, 
    registerMessageRepliedActivity, 
    registerMessageForwardedActivity 
  };
};

// 11. Hook genérico para qualquer tipo de atividade
export const useGenericActivity = () => {
  const { registerActivity } = useActivities();

  const registerGenericActivity = async (action: string, description: string) => {
    try {
      await registerActivity({
        action,
        description,
      });
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);
    }
  };

  return { registerGenericActivity };
};
