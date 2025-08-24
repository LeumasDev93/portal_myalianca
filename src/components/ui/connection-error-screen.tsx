"use client";

import { useConnection } from "@/contexts/connection-context";
import { Button } from "./button";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

export function ConnectionErrorScreen() {
  const { isOnline, isChecking, checkConnection } = useConnection();

  // Se estiver online, não mostrar a tela de erro
  if (isOnline) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-white z-60 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Ícone de erro */}
        <div className="flex justify-center">
          <div className="relative">
            <WifiOff className="h-24 w-24 text-red-500 mx-auto" />
            <AlertTriangle className="h-8 w-8 text-red-600 absolute -top-2 -right-2" />
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Sem Conexão com a Internet
          </h1>
          <p className="text-gray-600">
            Não foi possível conectar à internet. Verifique sua conexão e tente
            novamente.
          </p>
        </div>

        {/* Lista de verificação */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="font-medium text-gray-900 mb-3">Verifique:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Sua conexão Wi-Fi ou dados móveis está ativa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>O roteador está funcionando corretamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Não há problemas com seu provedor de internet</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Seu firewall não está bloqueando a conexão</span>
            </li>
          </ul>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Button
            onClick={checkConnection}
            disabled={isChecking}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Verificando Conexão...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Tentar Novamente
              </>
            )}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Recarregar Página
          </Button>
        </div>

        {/* Informação adicional */}
        <div className="text-xs text-gray-500">
          <p>
            Esta tela aparecerá automaticamente quando a conexão for restaurada.
          </p>
        </div>
      </div>
    </div>
  );
}
