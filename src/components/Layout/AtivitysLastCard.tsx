"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useActivities } from "@/hooks/useActivities";
import { getActivityDisplay, formatActivityDateTime } from "@/lib/activityMapper";
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AtivitysLastCard = () => {
  const {
    activities,
    loading,
    error,
    currentPage,
    totalPages,
    totalActivities,
    fetchActivities,
    goToPage,
    clearActivities,
  } = useActivities();

  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    fetchActivities();
  };

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      await clearActivities();
      toast({
        title: "Sucesso",
        description: "Todas as atividades foram limpas.",
        variant: "default",
      });
      setShowClearConfirm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao limpar atividades",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
  };
  if (error) {
    return (
      <Card className="flex-1 bg-gray-50">
        <CardHeader className="px-3 sm:px-4 md:px-6">
          <CardTitle className="text-base sm:text-lg md:text-xl font-semibold flex items-center justify-between">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#002856]">
              Últimas Atividades
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6">
          <div className="text-center py-6 sm:py-8">
            <p className="text-red-600 text-xs sm:text-sm">
              Erro ao carregar atividades
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 text-xs sm:text-sm"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 bg-gray-50">
      <Card className="h-full">
        <CardHeader className="px-3 sm:px-4 md:px-6">
          <CardTitle className="text-base sm:text-lg md:text-xl font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#002856]">
                Últimas Atividades
              </h1>
              {totalActivities > 0 && (
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {totalActivities} total
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {totalActivities > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearClick}
                  disabled={loading || isClearing}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Limpar todas as atividades"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="Atualizar atividades"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 md:px-6">
          {loading && activities.length === 0 ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500 text-xs sm:text-sm">
                Carregando atividades...
              </span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 text-xs sm:text-sm">
                Nenhuma atividade encontrada
              </p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const display = getActivityDisplay(activity.action);
              const { date, time } = formatActivityDateTime(activity.created_at);

              return (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-md bg-white ${
                    index !== activities.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 ${display.bgColor} text-white rounded-full flex items-center justify-center flex-shrink-0`}
                    >
                      {display.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm md:text-base font-semibold uppercase truncate text-gray-800">
                        {activity.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">
                      {date}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 whitespace-nowrap mt-0.5">
                      {time}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Paginação - Fora do Card */}
      {totalPages > 1 && (
        <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* Botão Anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots de paginação */}
            <div className="flex items-center gap-1 sm:gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm font-medium cursor-pointer ${
                      currentPage === page
                        ? "bg-[#002856] text-white border-[#002856]"
                        : "text-gray-600 hover:text-[#002856]"
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            {/* Botão Próximo */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 " />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Limpeza */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg">Limpar todas as atividades?</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              Esta ação não pode ser desfeita. Todas as suas {totalActivities} atividades serão permanentemente removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleClearCancel}
              disabled={isClearing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearConfirm}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AtivitysLastCard;
