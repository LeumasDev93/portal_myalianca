"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useActivities } from "@/hooks/useActivities";
import { getActivityDisplay, formatActivityDate } from "@/lib/activityMapper";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

const AtivitysLastCard = () => {
  const { activities, loading, error, fetchActivities } = useActivities();

  const handleRefresh = () => {
    fetchActivities();
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
            disabled={loading}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
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
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 whitespace-nowrap">
                    {formatActivityDate(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AtivitysLastCard;
