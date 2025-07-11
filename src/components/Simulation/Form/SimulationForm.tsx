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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    if (product) {
      const initialValues: Record<string, any> = {};
      product.tabs.forEach((tab) => {
        tab.form.fields.forEach((field) => {
          initialValues[field.name] = "";
        });
      });
      setFormValues(initialValues);
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

    // Limpa erro se já corrigido
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateTabFields = (tab: any): boolean => {
    const newErrors: Record<string, string> = {};

    tab.form.fields.forEach((field: any) => {
      const value = formValues[field.name];
      const isRequired = field.required ?? true;
      if (isRequired && (!value || value.trim() === "")) {
        newErrors[field.name] = "Este campo é obrigatório.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextTab = () => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab) => tab.title === activeTab
    );
    const currentTab = product.tabs[currentIndex];

    if (!validateTabFields(currentTab)) return;

    const nextTab = product.tabs[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.title);
      setErrors({});
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
      setErrors({});
    } else {
      onClose();
    }
  };

  const handleTabChange = (nextTabTitle: string) => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab) => tab.title === activeTab
    );
    const nextIndex = product.tabs.findIndex(
      (tab) => tab.title === nextTabTitle
    );

    if (nextIndex === currentIndex) return;

    if (nextIndex < currentIndex) {
      setActiveTab(nextTabTitle);
      return;
    }

    const currentTab = product.tabs[currentIndex];
    if (!validateTabFields(currentTab)) return;

    setActiveTab(nextTabTitle);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentTab = product?.tabs.find((tab) => tab.title === activeTab);
    if (!currentTab) return;

    if (!validateTabFields(currentTab)) return;

    console.log("Formulário enviado com valores:", formValues);
    // Aqui você pode enviar os dados para o backend
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorState error={error} onClose={onClose} />;
  if (!product) return <EmptyState />;

  const currentIndex = product.tabs.findIndex((tab) => tab.title === activeTab);

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
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((field: any) => (
                      <div key={field.name}>
                        <FormField
                          field={field}
                          value={formValues[field.name] || ""}
                          onChange={handleFieldChange}
                        />
                        {errors[field.name] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[field.name]}
                          </p>
                        )}
                      </div>
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
