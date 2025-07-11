import { Product } from "@/types/typesData";
import { LoadingScreen } from "../ui/loading-screen";
import Card from "./Card";
import EmptyState from "./Form/EmptyState";

export default function ProductsTab({
  loading,
  error,
  products,
  onSelect,
}: {
  loading: boolean;
  error: string | null;
  products: Product[];
  onSelect: (product: Product) => void;
}) {
  if (loading) return <LoadingScreen />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (products.length === 0) return <EmptyState />;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.productId}
          onClick={() => onSelect(product)}
          className="cursor-pointer"
        >
          <Card product={product} />
        </div>
      ))}
    </div>
  );
}
