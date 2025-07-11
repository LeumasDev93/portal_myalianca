/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import EmptyState from "./Form/EmptyState";
import { LoadingScreen } from "../ui/loading-screen";

export default function MySimulationsTab() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      setSimulations([]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;
  if (simulations.length === 0)
    return (
      <EmptyState message="Nenhuma simulação encontrada!" showFilter={false} />
    );

  return (
    <div className="space-y-4">
      {simulations.map((simulation) => (
        <div key={simulation.id} className="p-4 border rounded-lg">
          <p>Data: {simulation.date}</p>
          <p>Tipo: {simulation.type}</p>
        </div>
      ))}
    </div>
  );
}
