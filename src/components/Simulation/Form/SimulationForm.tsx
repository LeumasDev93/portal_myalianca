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
import {
  FaUser,
  FaUserTie,
  FaCar,
  FaCalculator,
  FaChevronDown,
} from "react-icons/fa";

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
      <div className="border-b ">
        <div className="flex flex-col p-2 md:px-6 md:py-4 bg-[#e6e3e3] shadow-xl rounded-t-xl flex-1 md:pb-6 w-full sm:w-96">
          <div className="flex items-center cursor-pointer space-x-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm text-[#002B5B] sm:text-lg md:font-semibold uppercase">
                SIMULADOR SEGURO {product.category}
              </h2>
            </div>
            <FaChevronDown
              className={`text-[#002B5B] transition-transform duration-200 `}
            />
          </div>

          <div className="w-full text-left mt-2">
            <span className="text-sm text-[#002B5B] md:font-semibold">
              Seguro Obrigatório
            </span>
          </div>
        </div>
      </div>
      <div className="border-b w-full">
        <TabsList className="flex items-center justify-center w-full gap-1">
          {product.tabs.map((tab) => (
            <button
              key={tab.title}
              type="button"
              onClick={() => handleTabChange(tab.title)}
              className={`
          relative py-1 md:py-4 px-2 md:px-10 md:w-full 
          transition-all duration-300 font-serif text-xs md:text-xl
          group overflow-hidden
          ${
            activeTab === tab.title
              ? "text-[#002B5B] border-b-2 border-b-[#771c2b] font-medium"
              : "text-[#6f7070] hover:text-[#002B5B] hover:scale-[1.02]"
          }
        `}
            >
              {activeTab !== tab.title && (
                <span className="absolute inset-0 bg-[#767071] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              )}

              <div className="flex justify-center items-center gap-1 md:gap-2 relative z-10">
                <span className="text-lg md:text-2xl">
                  {iconMap[tab.title] || <FaUser />}
                </span>
                <span>{tab.title}</span>
              </div>

              {activeTab !== tab.title && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[2px] bg-[#771c2b] group-hover:w-3/4 transition-all duration-300"></span>
              )}
            </button>
          ))}
        </TabsList>
      </div>
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
