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
import { fetchVehicleBrands } from "@/service/marcaService";
import { getSession } from "next-auth/react";
import { SimulationResults } from "../SimulationResults";

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
  reset: () => void;
}

export default function SimulationForm({
  productId,
  onClose,
  reset,
}: SimulationFormProps) {
  const { product, loading, error } = useProductDetails(productId);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("");
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setError] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const session = await getSession();
      setToken(session?.user.accessToken || null);
    };
    loadToken();
  }, []);

  // Load vehicle brands when token available or brand changes
  useEffect(() => {
    if (!token) return;

    const loadBrands = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchVehicleBrands(); // Passa token se precisar autenticar
        setBrands(data);

        // Se o campo brand já estiver preenchido no formValues, atualiza selectedBrandId
        if (formValues.brand) {
          const selectedBrand = data.find(
            (brand) => brand.name === formValues.brand
          );
          if (selectedBrand) {
            setSelectedBrandId(selectedBrand.id);
            // Aqui poderia chamar fetchModels(selectedBrand.id) se tiver essa função
          } else {
            setSelectedBrandId(null);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar marcas:", err);
        setError("Erro ao carregar marcas. Tente novamente mais tarde.");
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrands();
  }, [token, formValues.brand]);

  // Inicializa valores do formulário quando o produto carregar
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

  // Atualiza valores do formulário e limpa erro no campo
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

  // Valida campos obrigatórios de uma aba
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

  // Avança para a próxima aba ou finaliza a simulação
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
          setIsLoading,
          setSimulationResult
        );
        setSimulationResult(data);
        setIsModalOpen(true);
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

  // Volta para a aba anterior ou fecha o formulário
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

  // Muda a aba ao clicar no menu de abas, validando antes se for avanço
  const handleTabChange = (nextTabTitle: string) => {
    if (!product) return;

    const currentIndex = product.tabs.findIndex(
      (tab: any) => tab.title === activeTab
    );
    const nextIndex = product.tabs.findIndex(
      (tab: any) => tab.title === nextTabTitle
    );

    if (nextIndex === currentIndex) return;

    // Se for para aba anterior, permite direto
    if (nextIndex < currentIndex) {
      setActiveTab(nextTabTitle);
      return;
    }

    // Se for para aba seguinte, valida os campos da aba atual
    const currentTab = product.tabs[currentIndex];
    if (!validateTabFields(currentTab)) return;

    setActiveTab(nextTabTitle);
    setErrors({});
  };

  // Submit no formulário atual (não usado no seu fluxo, mas mantido)
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      {/* Header */}
      <div className="border-b flex  justify-between">
        <div className="flex flex-col p-2 md:px-6 md:py-4 bg-[#e6e3e3] shadow-xl rounded-t-xl w-full sm:w-96">
          <h2 className="text-sm text-[#002B5B] sm:text-lg md:font-semibold uppercase">
            SIMULADOR SEGURO {product.category}
          </h2>
          <span className="text-sm text-[#002B5B] md:font-semibold mt-2">
            Seguro Obrigatório
          </span>
        </div>
        <FormHeader onClose={onClose} />
      </div>

      {/* Tabs List */}
      <div className="border-b w-full">
        <TabsList className="flex items-center justify-center w-full gap-1">
          {product.tabs.map((tab: any) => (
            <button
              key={tab.title}
              type="button"
              onClick={() => handleTabChange(tab.title)}
              className={`
                relative py-1 md:py-4 px-2 md:px-10 md:w-full transition-all duration-300 font-serif text-xs md:text-xl group overflow-hidden
                ${
                  activeTab === tab.title
                    ? "text-white bg-[#002B5B] font-medium"
                    : "text-[#6f7070] hover:text-[#002B5B] hover:scale-[1.02] bg-[#e6e3e3]"
                }
              `}
            >
              <div className="flex justify-center items-center gap-1 md:gap-2 relative z-10">
                <span className="text-lg md:text-2xl">
                  {getDynamicIcon(tab.webIcon) || defaultIconMap[tab.title]}
                </span>
                <span>{tab.title}</span>
              </div>
            </button>
          ))}
        </TabsList>
      </div>

      {/* Tabs Content */}
      {product.tabs.map((tab: any) => (
        <TabsContent key={tab.title} value={tab.title}>
          <form onSubmit={handleSubmit}>
            <FormHeader
              description={tab.form.description}
              title={tab.form.title}
            />
            <div className="space-y-8 mt-6">
              <div className="border-b border-gray-200 pb-8 last:border-0">
                <div className={getSafeGridClass(tab.form.webGridSize)}>
                  {tab.form.fields
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((field: any) => (
                      <FormField
                        key={field.name}
                        field={field}
                        value={formValues[field.name]}
                        error={errors[field.name]}
                        onChange={(value: string) =>
                          handleFieldChange(field.name, value)
                        }
                        options={[]}
                      />
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
                  ? "SIMULAR"
                  : "AVANÇAR ▶"
              }
            />
          </form>
        </TabsContent>
      ))}

      {/* Mostrar resultado da simulação, se houver */}
      {isModalOpen && (
        <SimulationResults
          reset={reset}
          data={simulationResult}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            onClose();
          }}
        />
      )}
    </Tabs>
  );
}
