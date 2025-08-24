"use client";

import React from "react";
import { useNotificationsContext } from "@/contexts/notifications-context";
import { LoadingContainer } from "@/components/ui/loading-container";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, Clock, MessageSquare } from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotificationsContext();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "RESPOSTA_COLABORADOR":
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (lida: boolean) => {
    return lida ? "bg-white" : "bg-blue-50 border-l-4 border-blue-500";
  };

  if (isLoading) {
    return <LoadingContainer message="Carregando notificações..." />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar notificações: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#002856]">Notificações</h1>
          <p className="text-gray-600">
            {notifications.length} notificação
            {notifications.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({unreadCount} não lida{unreadCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma notificação
          </h3>
          <p className="text-gray-600">Você não tem notificações no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border shadow-sm transition-all duration-200 ${getNotificationColor(
                notification.lida
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getNotificationIcon(notification.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.titulo}
                      </h3>
                      {!notification.lida && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">
                      {notification.mensagem}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(notification.data_criacao)}
                      </div>
                      <div className="flex items-center gap-1">
                        {notification.lida ? (
                          <>
                            <CheckCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Lida</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-gray-400" />
                            <span>Não lida</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {!notification.lida && (
                  <Button
                    onClick={() => markAsRead(notification.id)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
