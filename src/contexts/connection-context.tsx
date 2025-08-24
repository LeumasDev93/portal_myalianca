"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

interface ConnectionContextType {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  checkConnection: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const connectionStatus = useConnectionStatus();

  return (
    <ConnectionContext.Provider value={connectionStatus}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
}
