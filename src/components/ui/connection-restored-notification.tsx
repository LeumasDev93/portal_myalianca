"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@/contexts/connection-context";
import { CheckCircle, X } from "lucide-react";

export function ConnectionRestoredNotification() {
  const { isOnline } = useConnection();
  const [showNotification, setShowNotification] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowNotification(false);
    } else if (wasOffline && isOnline) {
      // Conexão foi restaurada
      setShowNotification(true);
      setWasOffline(false);

      // Auto-hide após 5 segundos
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right duration-300">
      <div className="flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800">
            Conexão Restaurada
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Sua conexão com a internet foi restaurada com sucesso.
          </p>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-green-400 hover:text-green-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
