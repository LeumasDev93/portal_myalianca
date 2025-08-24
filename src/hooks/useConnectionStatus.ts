/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";

interface ConnectionStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: navigator.onLine, // Usar o status inicial do navegador
    isChecking: false,
    lastChecked: null,
  });

  // Função para testar a conexão com múltiplos endpoints
  const testConnection = useCallback(async (): Promise<boolean> => {
    const endpoints = [
      "https://www.google.com/favicon.ico",
      "https://httpbin.org/status/200",
      "https://api.github.com/zen",
    ];

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduzir timeout para 3 segundos

        const response = await fetch(endpoint, {
          method: "HEAD",
          signal: controller.signal,
          cache: "no-cache",
          mode: "no-cors", // Adicionar modo no-cors para evitar problemas de CORS
        });

        clearTimeout(timeoutId);
        
        // Se chegou até aqui, a conexão está funcionando
        return true;
      } catch (error) {
        console.log(`Falha ao testar endpoint ${endpoint}:`, error);
        // Continuar para o próximo endpoint
        continue;
      }
    }

    // Se todos os endpoints falharam, considerar offline
    return false;
  }, []);

  // Função para verificar conexão
  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const connected = await testConnection();
      
      setStatus({
        isOnline: connected,
        isChecking: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
      }));
    }
  }, [testConnection]);

  // Verificar conexão inicial e configurar listeners
  useEffect(() => {
    const handleOnline = () => {
      console.log("Navegador detectou conexão online");
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date(),
      }));
    };

    const handleOffline = () => {
      console.log("Navegador detectou conexão offline");
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date(),
      }));
    };

    // Verificar conexão inicial imediatamente se o navegador indica offline
    if (!navigator.onLine) {
      console.log("Navegador indica offline, verificando conexão...");
      checkConnection();
    } else {
      // Se o navegador indica online, verificar após um pequeno delay
      const initialCheck = setTimeout(() => {
        console.log("Verificando conexão inicial...");
        checkConnection();
      }, 2000); // Aumentar delay para 2 segundos

      // Event listeners para mudanças de conectividade do navegador
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Verificar periodicamente (a cada 30 segundos para ser mais responsivo)
      const interval = setInterval(checkConnection, 30000);

      return () => {
        clearTimeout(initialCheck);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        clearInterval(interval);
      };
    }

    // Event listeners para mudanças de conectividade do navegador
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar periodicamente (a cada 30 segundos para ser mais responsivo)
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  return {
    ...status,
    checkConnection,
  };
}
