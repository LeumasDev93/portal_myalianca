import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useProducts } from "@/hooks/useProducts";
import SimulationForm from "./Form/SimulationForm";
import ProductsTab from "./ProductsTab";
import MySimulationsTab from "./MySimulationsTab";
import { Product } from "@/types/typesData";

export default function SimulationScreen() {
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="container p-6 relative">
      <div className="mb-8">
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2 text-[#002256]">
          Simulação
        </h1>
      </div>

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList className="flex justify-start sm:space-x-2 space-x-0.5">
          <TabsTrigger
            value="types"
            className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
          >
            Produtos
          </TabsTrigger>
          <TabsTrigger
            value="mySimulations"
            className="sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white data-[state=active]:bg-[#002256] data-[state=active]:text-white transition-colors"
          >
            Minhas Simulações
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="types"
          className="bg-white rounded-lg shadow-xl p-4 xl:p-8"
        >
          {selectedProduct ? (
            <SimulationForm
              productId={selectedProduct.productId}
              onClose={() => setSelectedProduct(null)}
            />
          ) : (
            <>
              <p className="text-[#002256] mb-6">
                Escolha um Produto e faça uma simulação.
              </p>
              <ProductsTab
                loading={loading}
                error={error}
                products={products}
                onSelect={setSelectedProduct}
              />
            </>
          )}
        </TabsContent>

        <TabsContent
          value="mySimulations"
          className="bg-white rounded-lg shadow-xl p-4 xl:p-8"
        >
          <MySimulationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
