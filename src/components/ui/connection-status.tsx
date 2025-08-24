"use client";

import { useState, useEffect } from "react";
import { WifiOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./button";
import { useConnection } from "@/contexts/connection-context";

export function ConnectionStatus() {
  const { isOnline, isChecking, checkConnection } = useConnection();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Mostrar banner quando a conexão é restaurada
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowBanner(true);
    } else if (wasOffline && isOnline) {
      // Conexão foi restaurada
      setShowBanner(true);
      setWasOffline(false);

      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Se estiver online e não estiver mostrando o banner, não mostrar nada
  if (isOnline && !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  isOnline ? "text-green-800" : "text-red-800"
                }`}
              >
                {isOnline ? "Conexão restaurada" : "Sem conexão com a internet"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={isChecking}
              className="text-xs"
            >
              {isChecking ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                "Testar"
              )}
            </Button>
            {isOnline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="text-xs text-green-600 hover:text-green-800"
              >
                Fechar
              </Button>
            )}
          </div>
        </div>
        {!isOnline && (
          <p className="mt-2 text-xs text-red-700">
            Verifique sua conexão com a internet e tente novamente.
          </p>
        )}
        {isOnline && showBanner && (
          <p className="mt-2 text-xs text-green-700">
            Sua conexão com a internet foi restaurada com sucesso.
          </p>
        )}
      </div>
    </div>
  );
}
