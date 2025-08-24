"use client";

import { useConnection } from "@/contexts/connection-context";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function ConnectionTest() {
  const { isOnline, isChecking, lastChecked, checkConnection } =
    useConnection();

  const formatLastChecked = () => {
    if (!lastChecked) return "Nunca";
    return lastChecked.toLocaleTimeString("pt-BR");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm ${
                isOnline ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Verificando:</span>
          <span className="text-sm text-gray-600">
            {isChecking ? "Sim" : "Não"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Última verificação:</span>
          <span className="text-sm text-gray-600">{formatLastChecked()}</span>
        </div>

        <Button
          onClick={checkConnection}
          disabled={isChecking}
          className="w-full"
          variant="outline"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
