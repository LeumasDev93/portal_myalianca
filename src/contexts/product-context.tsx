"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ProductContextType = {
  showProductCards: boolean;
  setShowProductCards: (show: boolean) => void;
  selectedProduct: string | null;
  setSelectedProduct: (product: string | null) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [showProductCards, setShowProductCards] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  return (
    <ProductContext.Provider
      value={{
        showProductCards,
        setShowProductCards,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
