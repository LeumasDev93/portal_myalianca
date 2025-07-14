/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSX, useEffect, useState } from "react";
import FormHeader from "./FormHeader";
import FormField from "./FormField";
import FormActions from "./FormActions";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { LoadingScreen } from "../../ui/loading-screen";
import { useProductDetails } from "@/hooks/useProdutsDetails";
import { Tabs, TabsContent, TabsList } from "@radix-ui/react-tabs";
import * as Icons from "react-icons/fc";
import { FaUser, FaUserTie, FaCar, FaCalculator } from "react-icons/fa";
import { fetchSimulation } from "@/service/simulationService";
import { getSafeGridClass } from "@/lib/utils";

const defaultIconMap: Record<string, JSX.Element> = {
  "Dados Pessoais": <FaUser />,
  Tomador: <FaUser />,
  "Condutor Habitual": <FaUserTie />,
  Veículo: <FaCar />,
  Simulação: <FaCalculator />,
};

function getDynamicIcon(iconName: string): JSX.Element {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <FaUser />;
}

interface SimulationFormProps {
  productId: string;
  onClose: () => void;
}

export default function SimulationForm({
  productId,
  onClose,
}: SimulationFormProps) {
  const { product, loading, error } = useProductDetails(productId);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      const initialValues: Record<string, any> = {};
      product.tabs.forEach((tab: any) => {
        tab.form.fields.forEach((field: any) => {
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

  const goToNextTab = async () => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab: any) => tab.title === activeTab
    );
    const currentTab = product.tabs[currentIndex];

    if (!validateTabFields(currentTab)) return;

    if (currentIndex === product.tabs.length - 1) {
      try {
        setIsLoadingSimulation(true);
        setSimulationError(null);

        const data = await fetchSimulation(
          formValues,
          setIsLoadingSimulation,
          setSimulationError
        );

        setSimulationResult(data);
        alert("Simulação realizada com sucesso!");
      } catch (error: any) {
        setSimulationError(error.message || "Erro ao executar simulação.");
      } finally {
        setIsLoadingSimulation(false);
      }
      return;
    }

    const nextTab = product.tabs[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.title);
      setErrors({});
    }
  };

  const goToPreviousTab = () => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab: any) => tab.title === activeTab
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
      (tab: any) => tab.title === activeTab
    );
    const nextIndex = product.tabs.findIndex(
      (tab: any) => tab.title === nextTabTitle
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

    const currentTab = product?.tabs.find(
      (tab: any) => tab.title === activeTab
    );
    if (!currentTab) return;

    if (!validateTabFields(currentTab)) return;

    console.log("Formulário enviado com valores:", formValues);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorState error={error} onClose={onClose} />;
  if (!product) return <EmptyState />;

  const currentIndex = product.tabs.findIndex(
    (tab: any) => tab.title === activeTab
  );
  const activeTabObject = product.tabs.find(
    (tab: any) => tab.title === activeTab
  );
  console.log("clasName:", activeTabObject?.form.webGridSize);
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
          {product.tabs.map((tab: any) => (
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
                    ? "text-white bg-[#002B5B] font-medium"
                    : "text-[#6f7070] hover:text-[#002B5B] hover:scale-[1.02] bg-[#e6e3e3]"
                }
              `}
            >
              {activeTab !== tab.title && (
                <span className="absolute inset-0 bg-[#767071] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              )}

              <div className="flex justify-center items-center gap-1 md:gap-2 relative z-10">
                <span
                  className={`${
                    activeTab === tab.title ? "text-white" : ""
                  } text-lg md:text-2xl`}
                >
                  {getDynamicIcon(tab.webIcon) || defaultIconMap[tab.title]}
                </span>
                <span>{tab.title}</span>
              </div>

              {activeTab !== tab.title && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[2px] bg-[#002B5B] group-hover:w-3/4 transition-all duration-300"></span>
              )}
            </button>
          ))}
        </TabsList>
      </div>
      {product.tabs.map((tab: any) => (
        <TabsContent key={tab.title} value={tab.title}>
          <form onSubmit={handleSubmit}>
            <FormHeader
              onClose={onClose}
              description={activeTabObject?.form.description || ""}
              title={activeTabObject?.form.title || ""}
            />
            <div className="space-y-8 mt-6">
              <div className="border-b border-gray-200 pb-8 last:border-0">
                <div className={getSafeGridClass(tab.form.webGridSize)}>
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
              submitting={isLoadingSimulation}
              nextLabel={
                currentIndex === product.tabs.length - 1
                  ? "FINALIZAR"
                  : "AVANÇAR ▶"
              }
            />
          </form>
        </TabsContent>
      ))}
    </Tabs>
  );
}
