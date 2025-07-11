/* eslint-disable @typescript-eslint/no-explicit-any */
import { JSX, useEffect, useState } from "react";
import FormHeader from "./FormHeader";
import FormField from "./FormField";
import FormActions from "./FormActions";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { LoadingScreen } from "../../ui/loading-screen";
import { useProductDetails } from "@/hooks/useProdutsDetails";
import { Tabs, TabsContent, TabsList } from "@radix-ui/react-tabs";
import { FaUser, FaUserTie, FaCar, FaCalculator } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const iconMap: Record<string, JSX.Element> = {
  "Dados Pessoais": <FaUser />,
  Tomador: <FaUser />,
  "Condutor Habitual": <FaUserTie />,
  Veículo: <FaCar />,
  Simulação: <FaCalculator />,
};

export default function SimulationForm({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const { product, loading, error } = useProductDetails(productId);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      const initialValues: Record<string, any> = {};
      product.tabs.forEach((tab) => {
        tab.form.fields.forEach((field) => {
          initialValues[field.name] = "";
        });
      });
      setFormValues(initialValues);

      // Define a aba ativa como a primeira do produto
      if (product.tabs.length > 0) {
        setActiveTab(product.tabs[0].title);
      }
    }
  }, [product]);

  const handleFieldChange = (name: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode enviar os dados para o backend
    console.log("Formulário enviado com valores:", formValues);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorState error={error} onClose={onClose} />;
  }

  if (!product) {
    return <EmptyState />;
  }

  const goToNextTab = () => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab) => tab.title === activeTab
    );
    const currentTab = product.tabs[currentIndex];

    // Verifica se todos os campos da aba atual estão preenchidos
    const hasEmptyRequiredFields = currentTab.form.fields.some((field) => {
      const value = formValues[field.name];
      const isRequired = field.required ?? true; // Se não tiver 'required', assume que é obrigatório
      return isRequired && (!value || value.trim() === "");
    });

    if (hasEmptyRequiredFields) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos marcados com *",
        variant: "destructive",
      });
      return;
    }

    // Avança para a próxima aba
    const nextTab = product.tabs[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.title);
    }
  };

  const goToPreviousTab = () => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab) => tab.title === activeTab
    );

    const previousTab = product.tabs[currentIndex - 1];
    if (previousTab) {
      setActiveTab(previousTab.title);
    } else {
      // Se não houver aba anterior, fecha o formulário
      onClose();
    }
  };

  const currentIndex = product.tabs.findIndex((tab) => tab.title === activeTab);

  const handleTabChange = (nextTabTitle: string) => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab) => tab.title === activeTab
    );
    const nextIndex = product.tabs.findIndex(
      (tab) => tab.title === nextTabTitle
    );

    if (nextIndex === currentIndex) {
      // Clicou na aba atual, não faz nada
      return;
    }

    if (nextIndex < currentIndex) {
      // Clicou em aba anterior: permite mudar direto
      setActiveTab(nextTabTitle);
      return;
    }

    // Clicou em aba futura: validar campos da aba atual
    const currentTab = product.tabs[currentIndex];

    const hasEmptyRequiredFields = currentTab.form.fields.some((field) => {
      const value = formValues[field.name];
      const isRequired = field.required ?? true;
      return isRequired && (!value || value.trim() === "");
    });

    if (hasEmptyRequiredFields) {
      toast({
        title: "Campos obrigatórios",
        description:
          "Preencha todos os campos marcados com * antes de continuar.",
        variant: "destructive", // ou "error"
      });
      return;
    }

    // Validação ok, muda para próxima aba
    setActiveTab(nextTabTitle);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#002256] mb-4 uppercase">
        SIMULADOR SEGURO {product.category}
      </h2>
      <TabsList className="flex flex-wrap gap-2">
        {product.tabs.map((tab) => (
          <button
            key={tab.title}
            type="button"
            onClick={() => handleTabChange(tab.title)}
            className={`flex items-center gap-2 sm:px-4 xl:text-lg sm:py-2 px-2 py-1 rounded-md text-[#002256] font-semibold hover:bg-[#002256] hover:text-white transition-colors ${
              activeTab === tab.title ? "bg-[#002256] text-white" : ""
            }`}
          >
            {iconMap[tab.title] || <FaUser />}
            {tab.title}
          </button>
        ))}
      </TabsList>

      <Toaster />
      {product.tabs.map((tab) => (
        <TabsContent key={tab.title} value={tab.title}>
          <form onSubmit={handleSubmit}>
            <FormHeader onClose={onClose} />

            <div className="space-y-8 mt-6">
              <div className="border-b border-gray-200 pb-8 last:border-0">
                <h3 className="text-lg font-semibold text-[#002256] mb-2">
                  {tab.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tab.form.fields
                    .sort((a, b) => a.position - b.position)
                    .map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formValues[field.name] || ""}
                        onChange={handleFieldChange}
                      />
                    ))}
                </div>
              </div>
            </div>

            <FormActions
              onNext={goToNextTab}
              onPrevious={currentIndex > 0 ? goToPreviousTab : undefined}
              onCancel={onClose}
              submitting={false}
            />
          </form>
        </TabsContent>
      ))}
    </Tabs>
  );
}
