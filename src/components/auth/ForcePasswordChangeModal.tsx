"use client";

import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  userId: string;
  onSuccess: () => void;
}

export function ForcePasswordChangeModal({
  isOpen,
  userId,
  onSuccess,
}: ForcePasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 8) {
      setError("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (newPassword === currentPassword) {
      setError("A nova senha deve ser diferente da senha atual");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          senha_atual: currentPassword,
          nova_senha: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao alterar senha");
        return;
      }

      // Sucesso
      onSuccess();
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
            <LockKeyhole className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
            ALTERAÇÃO DE SENHA OBRIGATÓRIA
          </h1>
          <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full mb-3"></div>
          <p className="text-sm text-gray-600">
            Por motivos de segurança, você precisa alterar sua senha antes de continuar.
          </p>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 animate-fade-in-down">
            <div className="flex items-center justify-center w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Senha Atual */}
          <div className="relative group">
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer pr-20"
              placeholder=" "
              disabled={isLoading}
            />
            <label
              htmlFor="currentPassword"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Senha Atual
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-gray-400 hover:text-blue-500 transition-colors z-10"
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <LockKeyhole className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Nova Senha */}
          <div className="relative group">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer pr-20"
              placeholder=" "
              disabled={isLoading}
            />
            <label
              htmlFor="newPassword"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Nova Senha
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-gray-400 hover:text-blue-500 transition-colors z-10"
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <LockKeyhole className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-1 ml-1">Mínimo de 8 caracteres</p>

          {/* Confirmar Nova Senha */}
          <div className="relative group">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="block w-full px-3 md:px-4 py-2.5 md:py-3 text-sm bg-white border border-gray-200 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent peer pr-20"
              placeholder=" "
              disabled={isLoading}
            />
            <label
              htmlFor="confirmPassword"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-3 left-4 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
            >
              Confirmar Nova Senha
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-blue-500 transition-colors z-10"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              <LockKeyhole className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 md:py-3 px-4 inline-flex justify-center items-center gap-2 rounded-lg font-medium text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Alterando senha...</span>
              </>
            ) : (
              "Alterar Senha"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

