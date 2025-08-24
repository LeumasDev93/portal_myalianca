import { LoadingContainer } from "@/components/ui/loading-container";

export default function DashboardLoading() {
  return (
    <LoadingContainer fullHeight={true} message="CARREGANDO..." />
  );
}
