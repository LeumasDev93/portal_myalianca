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
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#002856]">
              Últimas Atividades
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 text-sm">Erro ao carregar atividades</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
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
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#002856]">
            Últimas Atividades
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Carregando atividades...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              Nenhuma atividade encontrada
            </p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const display = getActivityDisplay(activity.action);

            return (
              <div
                key={activity.id}
                className={`flex items-center justify-between p-4 rounded-md bg-white ${
                  index !== activities.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 xl:w-10 xl:h-10 ${display.bgColor} text-white rounded-full flex items-center justify-center`}
                  >
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs xl:text-sm font-semibold uppercase truncate">
                      {activity.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-[10px] xl:text-xs text-gray-600 truncate">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-[10px] xl:text-xs text-gray-500">
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
