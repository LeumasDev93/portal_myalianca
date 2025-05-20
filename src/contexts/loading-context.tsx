"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface LoadingContextType {
  isLoading: boolean
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Limpa o timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [loadingTimeout])

  const showLoading = useCallback(() => {
    // Limpa qualquer timeout existente
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      setLoadingTimeout(null)
    }

    // Mostra o loading imediatamente
    setIsLoading(true)

    // Define um timeout de segurança para esconder o loading após 10 segundos
    // (caso algo dê errado e o hideLoading não seja chamado)
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 10000)

    setLoadingTimeout(timeout)
  }, [loadingTimeout])

  const hideLoading = useCallback(() => {
    // Adiciona um pequeno atraso antes de esconder o loading
    // para evitar flashes muito rápidos
    setTimeout(() => {
      setIsLoading(false)
    }, 500)

    // Limpa o timeout de segurança
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      setLoadingTimeout(null)
    }
  }, [loadingTimeout])

  return <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>{children}</LoadingContext.Provider>
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
