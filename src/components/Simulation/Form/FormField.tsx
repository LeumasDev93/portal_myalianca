/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchVehicleBrands } from "@/service/marcaService";
import { fetchVehicleModels } from "@/service/modeloService";
import { fetchDynamicApiData } from "@/service/dynamicApiService";
import ReactSelect from "react-select";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDomain } from "@/hooks/useDomain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface Option {
  id: number | string;
  name: string;
}

interface FormFieldData {
  name: string;
  label: string;
  sourceData: string;
  sourceDataType?: string;
  type:
    | "text"
    | "date"
    | "select"
    | "autocomplete"
    | "auto-complete"
    | "number"
    | "brand"
    | "model"
    | string;
  required?: boolean;
  fieldPlaceholder?: string;
  fieldSize?: number;
  provider?: string | null;
  targetField?: string | null;
}

interface FormFieldProps {
  field: FormFieldData;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  options?: Option[];
  formValues?: Record<string, unknown>; // Valores do formulário para campos dependentes
}

// Helper function para verificar se o tipo é autocomplete (aceita "autocomplete" e "auto-complete")
const isAutocompleteType = (type: string | undefined): boolean => {
  return type === "autocomplete" || type === "auto-complete";
};

// Estado global compartilhado
const globalState = {
  selectedBrand: {
    id: null as number | null,
    name: "" as string,
    options: [] as Option[],
  },
  modelOptions: [] as Option[],
  lastLoadedBrandId: null as number | null,
  listeners: new Set<() => void>(),
};

// Funções para gerenciar o estado global
const setGlobalBrandState = (brand: {
  id: number | null;
  name: string;
  options: Option[];
}) => {
  globalState.selectedBrand = brand;
  globalState.listeners.forEach((listener) => listener());
};

const setGlobalModelOptions = (models: Option[]) => {
  globalState.modelOptions = models;
  globalState.listeners.forEach((listener) => listener());
};

export default function FormField({
  field,
  value,
  onChange,
  error,
  options = [],
  formValues = {},
}: FormFieldProps) {
  const { profile } = useUserProfile();
  
  // Hook para buscar dados de domínio quando sourceDataType for "DOMAIN"
  const isDomainField = field.sourceDataType?.toUpperCase() === "DOMAIN";
  const domainName = isDomainField ? field.sourceData : null;
  const { options: domainOptions, loading: loadingDomain, error: errorDomain } = useDomain(domainName);

  // Estado para campos de API dinâmica
  const isApiField = field.sourceDataType?.toUpperCase() === "API";
  const [apiOptions, setApiOptions] = useState<Option[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const [filter, setFilter] = useState(value || "");
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado local das marcas
  const [marcaOptions, setMarcaOptions] = useState<Option[]>([]);
  const [loadingMarca, setLoadingMarca] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [errorMarca, setErrorMarca] = useState<string | null>(null);
  const [errorModel, setErrorModel] = useState<string | null>(null);
  // Estado local para o erro da data
  const [dateError, setDateError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [licenseDateError, setLicenseDateError] = useState("");
  // Estado local que sincroniza com o global
  const [localGlobalState, setLocalGlobalState] = useState(globalState);
  const [licenseDuration, setLicenseDuration] = useState<{
    years: number;
    months: number;
    days: number;
  } | null>(null);
  
  // Refs para os campos de data
  const licenseDateRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLInputElement>(null);
  const driverLicenseDateRef = useRef<HTMLInputElement>(null);
  
  // Função para atualizar estado local
  const updateLocalState = useCallback(() => {
    setLocalGlobalState({ ...globalState });
  }, []);

  const subscribeToGlobalState = (callback: () => void): void => {
    globalState.listeners.add(callback);
    // Não retorna nada
  };

  const unsubscribeFromGlobalState = (callback: () => void): void => {
    globalState.listeners.delete(callback);
  };
  useEffect(() => {
    subscribeToGlobalState(updateLocalState);
    return () => {
      unsubscribeFromGlobalState(updateLocalState);
    };
  }, [updateLocalState]);

  // Atualiza filtro quando value muda externamente (não quando o usuário está digitando)
  // Usar uma ref para rastrear se a mudança veio do usuário ou externamente
  const isUserTypingRef = useRef(false);
  
  useEffect(() => {
    // Só atualizar o filter se a mudança não veio do usuário digitando
    if (!isUserTypingRef.current) {
      setFilter(value || "");
    }
    // Resetar a flag após processar
    isUserTypingRef.current = false;
  }, [value]);

  // Mostrar opções automaticamente quando dados são carregados (para autocomplete de API)
  useEffect(() => {
    if (isAutocompleteType(field.type) && isApiField && apiOptions.length > 0 && !loadingApi) {
      // Se há opções disponíveis e o campo está focado, mostrar opções
      const inputElement = document.getElementById(field.name) as HTMLInputElement;
      if (inputElement && document.activeElement === inputElement) {
        if (field.name === 'brand' || field.name === 'vehicleBrand') {
          console.log(`🔄 [${field.name}] Dados carregados e campo focado - Mostrando opções`);
        }
        setShowOptions(true);
      }
    }
  }, [field.type, field.name, isApiField, apiOptions.length, loadingApi]);
  
  // Log quando showOptions muda
  useEffect(() => {
    if ((field.name === 'brand' || field.name === 'vehicleBrand') && isApiField) {
      const availableOpts = isApiField ? apiOptions : options;
      const filteredOpts = filter.trim() === "" 
        ? availableOpts 
        : availableOpts.filter((opt) =>
            opt.name.toLowerCase().includes(filter.toLowerCase())
          );
      console.log(`🔄 [${field.name}] showOptions mudou:`, {
        showOptions,
        apiOptionsCount: apiOptions.length,
        filteredOptionsCount: filteredOpts.length
      });
    }
  }, [showOptions, field.name, isApiField, apiOptions.length]);

  useEffect(() => {
    if (!value && profile) {
      if (field.name === "name" && profile.user.nome) {
        onChange(profile.user.nome);
      }
      if (field.name === "nif" && profile.user.nif) {
        onChange(profile.user.nif);
      }
      if (field.name === "emails" && profile.user.email) {
        onChange(profile.user.email);
      }
      if (field.name === "mobiles" && profile.user.telemovel) {
        onChange(profile.user.telemovel);
      }
    }
  }, [profile, field.name, value, onChange]);

  // Obter valor do campo dependente para usar como dependência
  const targetField = field.targetField;
  const targetFieldValue = targetField ? formValues?.[targetField] : undefined;

  // Busca dados de API dinamicamente quando sourceDataType for "API"
  useEffect(() => {
    if (!isApiField || !field.sourceData) return;

    // Se o campo tem targetField, verificar se o campo dependente tem valor
    if (targetField) {
      // Verificar se o valor está vazio ou é null/undefined
      if (!targetFieldValue || targetFieldValue === '' || targetFieldValue === null || targetFieldValue === undefined) {
        // Se não há valor no campo dependente, limpar opções e valor
        setApiOptions([]);
        if (value) {
          onChange(""); // Limpar valor quando o campo dependente não tem valor
        }
        return;
      }
    }

    const loadApiData = async () => {
      setLoadingApi(true);
      setErrorApi(null);
      try {
        let targetValue: string | number | undefined = undefined;
        
        // Converter targetFieldValue para string | number | undefined
        if (targetFieldValue !== undefined && targetFieldValue !== null) {
          if (typeof targetFieldValue === 'string' || typeof targetFieldValue === 'number') {
            targetValue = targetFieldValue;
          } else {
            targetValue = String(targetFieldValue);
          }
        }
        
        // Se o targetField é "brand" e temos o valor, precisamos obter o ID
        // Primeiro, tentar buscar as opções de marca para encontrar o ID
        if (targetField === "brand" && targetValue) {
          // Se targetValue é um nome, precisamos encontrar o ID correspondente
          // Vamos buscar as marcas primeiro para obter o ID
          try {
            const brandData = await fetchDynamicApiData(
              "private/mobile/vehicle/brands",
              field.provider || null,
              undefined,
              {}
            );
            const brandOption = brandData.find((opt: Option) => opt.name === targetValue);
            if (brandOption) {
              targetValue = brandOption.id; // Usar o ID em vez do nome
            }
          } catch (err) {
            console.warn("Erro ao buscar ID da marca:", err);
            // Continuar com o valor original se não conseguir encontrar o ID
          }
        }
        
        const provider = field.provider || null;
        
        const data = await fetchDynamicApiData(
          field.sourceData,
          provider,
          targetValue,
          formValues
        );
        
        setApiOptions(data);
        
        // Log temporário para debug
        if (field.name === 'brand' || field.name === 'vehicleBrand') {
          console.log(`✅ [${field.name}] Dados carregados:`, {
            count: data.length,
            showOptions: showOptions,
            isApiField,
            fieldType: field.type
          });
        }
        
        // Não limpar o valor automaticamente - deixar o usuário digitar livremente
        // A limpeza só acontece quando o campo dependente está vazio (linha 223-225)
      } catch (err) {
        // Mensagem amigável para o cliente, especialmente para o campo "Marca"
        if (field.name === 'brand' || field.name === 'vehicleBrand') {
          setErrorApi('Não foi possível carregar as marcas.');
        } else {
          setErrorApi('Nenhum modelo disponível para esta marca.');
        }
      } finally {
        setLoadingApi(false);
      }
    };

    loadApiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isApiField, 
    field.sourceData, 
    field.name, 
    targetField, 
    targetFieldValue, // Valor específico do campo dependente
    field.provider
    // Removido value e onChange das dependências para não recarregar quando o usuário digita
    // Removido formValues para evitar recarregamentos desnecessários
  ]);

  // Carrega marcas apenas uma vez quando o componente monta (mantido para compatibilidade)
  // NOTA: Esta lógica só é usada se o campo NÃO for dinâmico (isApiField === false)
  useEffect(() => {
    // Se é um campo de API dinâmico, não usar a lógica antiga
    if (isApiField) {
      return;
    }
    
    if ((field.name === "brand" || field.name === "vehicleBrand") && marcaOptions.length === 0) {
      const loadBrands = async () => {
        setLoadingMarca(true);
        setErrorMarca(null);
        try {
          const brands = await fetchVehicleBrands();
          setMarcaOptions(brands);
          setGlobalBrandState({
            ...globalState.selectedBrand,
            options: brands,
          });
        } catch (err) {
          setErrorMarca("Nenhuma marca disponível no momento.");
        } finally {
          setLoadingMarca(false);
        }
      };
      loadBrands();
    }
  }, [field.name, marcaOptions.length, isApiField]);

  // Sincroniza o estado da marca selecionada com o valor atual
  // NOTA: Esta lógica só é usada se o campo NÃO for dinâmico (isApiField === false)
  useEffect(() => {
    // Se é um campo de API dinâmico, não usar a lógica antiga
    if (isApiField) {
      return;
    }
    
    if (field.name === "brand" || field.name === "vehicleBrand") {
      if (value && marcaOptions.length > 0) {
        const marca = marcaOptions.find((m) => m.name === value);
        if (marca) {
          const brandId = Number(marca.id);
          setGlobalBrandState({
            id: brandId,
            name: marca.name,
            options: marcaOptions,
          });
        }
      } else if (!value) {
        setGlobalBrandState({
          id: null,
          name: "",
          options: marcaOptions,
        });
      }
    }
  }, [value, marcaOptions, field.name, isApiField]);

  // Carrega modelos quando a marca muda e apenas para campos de modelo
  // NOTA: Esta lógica só é usada se o campo NÃO for dinâmico (isApiField === false)
  useEffect(() => {
    // Se é um campo de API dinâmico, não usar a lógica antiga
    if (isApiField) {
      return;
    }
    
    if (field.sourceData === "modelo" || field.name === "model" || field.name === "vehicleModel") {
      // Se não há marca selecionada, limpa os modelos
      if (!localGlobalState.selectedBrand.id) {
        if (localGlobalState.modelOptions.length > 0) {
          setGlobalModelOptions([]);
        }
        return;
      }

      // Se a marca mudou, limpa o valor do modelo
      if (
        value &&
        globalState.lastLoadedBrandId !== localGlobalState.selectedBrand.id
      ) {
        onChange("");
      }

      if (!loadingModel && (globalState.lastLoadedBrandId !== localGlobalState.selectedBrand.id || localGlobalState.modelOptions.length === 0)) {
        loadModels(localGlobalState.selectedBrand.id);
      }
    }
  }, [
    localGlobalState.selectedBrand.id,
    field.sourceData,
    loadingModel,
    value,
    onChange,
    field.name,
    isApiField,
  ]);

  const loadModels = useCallback(
    async (brandId: number) => {
      if (
        loadingModel ||
        (globalState.lastLoadedBrandId === brandId &&
          localGlobalState.modelOptions.length > 0)
      ) {
        return;
      }

      setLoadingModel(true);
      setErrorModel(null);
      setGlobalModelOptions([]);
      globalState.lastLoadedBrandId = brandId;

      try {
        const models = await fetchVehicleModels(brandId);
        setGlobalModelOptions(models);
      } catch (err) {
        setErrorModel("Nenhum modelo disponível no momento.");
        globalState.lastLoadedBrandId = null;
      } finally {
        setLoadingModel(false);
      }
    },
    [loadingModel, localGlobalState.modelOptions.length]
  );

  // Handler para seleção de marca
  const handleMarcaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
    setFilter(selectedValue);

    const selectedBrand = marcaOptions.find((m) => m.name === selectedValue);

    if (selectedBrand) {
      const brandId = Number(selectedBrand.id);
      setGlobalBrandState({
        id: brandId,
        name: selectedBrand.name,
        options: marcaOptions,
      });
    } else {
      setGlobalBrandState({
        id: null,
        name: "",
        options: marcaOptions,
      });
    }
  };

  const handleSelectOption = (name: string) => {
    onChange(name);
    setFilter(name);
    setShowOptions(false);
  };

  // Usar apiOptions se for campo de API, senão usar options
  const availableOptions = isApiField ? apiOptions : options;
  
  // Para o campo "Modelo", só filtrar após 3 letras. Para "Marca", filtrar imediatamente
  const isModelField = field.name === 'model' || field.name === 'vehicleModel' || field.name === 'Modelo';
  const minLengthForFilter = isModelField ? 3 : 0;
  const shouldFilter = filter.trim().length >= minLengthForFilter;
  
  const filteredOptions = filter.trim() === "" || !shouldFilter
    ? availableOptions 
    : availableOptions.filter((opt) =>
        opt.name.toLowerCase().includes(filter.toLowerCase())
      );

  const getModelFieldState = () => {
    if (loadingModel) {
      return {
        disabled: true,
        placeholder: `Carregando modelos para ${localGlobalState.selectedBrand.name}...`,
        showOptions: false,
      };
    }

    if (!localGlobalState.selectedBrand.id) {
      return {
        disabled: true,
        placeholder: "Selecione uma marca primeiro",
        showOptions: false,
      };
    }

    if (errorModel) {
      return {
        disabled: true,
        placeholder: "Erro ao carregar modelos",
        showOptions: false,
      };
    }

    if (localGlobalState.modelOptions.length === 0) {
      return {
        disabled: true,
        placeholder: `Nenhum modelo encontrado para ${localGlobalState.selectedBrand.name}`,
        showOptions: false,
      };
    }

    return {
      disabled: false,
      placeholder: field.fieldPlaceholder || "Selecione um modelo",
      showOptions: true,
    };
  };

  const modelFieldState = getModelFieldState();

  return (
    <div
      ref={containerRef}
      className={`w-full sm:col-span-${
        field.fieldSize || 1
      } relative mb-3 sm:mb-4`}
    >
      <div className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      {field.name === "licenseDate" ? (
        <>
          <div className="relative">
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={value}
              ref={licenseDateRef}
              className="pr-14 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate) {
                  const licenseDate = new Date(selectedDate);
                  licenseDate.setHours(0, 0, 0, 0);

                  if (licenseDate > today) {
                    setLicenseDateError("A data da carta não pode ser futura");
                    onChange("");
                    return;
                  }

                  const minDate = new Date(1900, 0, 1);
                  if (licenseDate < minDate) {
                    setLicenseDateError("Data inválida");
                    onChange("");
                    return;
                  }

                  setLicenseDateError("");
                  onChange(selectedDate);
                } else {
                  onChange("");
                }
              }}
              required={field.required}
              max={new Date().toISOString().split("T")[0]}
              min="1900-01-01"
            />
            <button
              type="button"
              onClick={() => {
                licenseDateRef.current?.showPicker?.();
                licenseDateRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md bg-[#002256] px-3"
              aria-label="Selecionar data"
            >
              <Calendar className="h-4 w-4 text-white" />
            </button>
          </div>
          {licenseDateError && (
            <p className="text-red-500 text-sm mt-1">{licenseDateError}</p>
          )}
        </>
      ) : field.name === "birthDate" ? (
        <>
          <div className="relative">
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={value}
              ref={birthDateRef}
              className="pr-14 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate) {
                  const birthDate = new Date(selectedDate);
                  birthDate.setHours(0, 0, 0, 0);

                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();

                  if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                  ) {
                    age--;
                  }

                  if (age < 18) {
                    setBirthDateError(
                      "É necessário ter pelo menos 18 anos de idade"
                    );
                    onChange("");
                    return;
                  } else {
                    setBirthDateError("");
                  }

                  onChange(selectedDate);
                } else {
                  onChange("");
                }
              }}
              required={field.required}
              max={
                new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split("T")[0]
              }
            />
            <button
              type="button"
              onClick={() => {
                birthDateRef.current?.showPicker?.();
                birthDateRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md bg-[#002256] px-3"
              aria-label="Selecionar data"
            >
              <Calendar className="h-4 w-4 text-white" />
            </button>
          </div>
          {birthDateError && (
            <p className="text-red-500 text-sm mt-1">{birthDateError}</p>
          )}
        </>
      ) : field.name === "driverLicenseDate" ? (
        <>
          <div className="relative">
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={value}
              ref={driverLicenseDateRef}
              className="pr-14 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              onChange={(e) => {
                const selectedDate = e.target.value;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate) {
                  const licenseDate = new Date(selectedDate);
                  licenseDate.setHours(0, 0, 0, 0);

                  if (licenseDate > today) {
                    setDateError(
                      "A data da carta de condução não pode ser futura"
                    );
                    onChange("");
                    setLicenseDuration(null);
                    return;
                  } else {
                    setDateError("");
                  }

                  let years = today.getFullYear() - licenseDate.getFullYear();
                  let months = today.getMonth() - licenseDate.getMonth();
                  let days = today.getDate() - licenseDate.getDate();

                  if (days < 0) {
                    months--;
                    const lastDayOfMonth = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      0
                    ).getDate();
                    days += lastDayOfMonth;
                  }

                  if (months < 0) {
                    years--;
                    months += 12;
                  }

                  setLicenseDuration({ years, months, days });
                  onChange(selectedDate);
                } else {
                  setLicenseDuration(null);
                  onChange("");
                }
              }}
              required={field.required}
              max={new Date().toISOString().split("T")[0]}
            />
            <button
              type="button"
              onClick={() => {
                driverLicenseDateRef.current?.showPicker?.();
                driverLicenseDateRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md bg-[#002256] px-3"
              aria-label="Selecionar data"
            >
              <Calendar className="h-4 w-4 text-white" />
            </button>
          </div>
          {licenseDuration && (
            <p className="text-sm text-gray-600 mt-1">
              Tem{" "}
              {licenseDuration.years > 0 &&
                `${licenseDuration.years} ano${
                  licenseDuration.years !== 1 ? "s" : ""
                }`}
              {licenseDuration.years > 0 && licenseDuration.months > 0 && ", "}
              {licenseDuration.months > 0 &&
                `${licenseDuration.months} mês${
                  licenseDuration.months !== 1 ? "es" : ""
                }`}
              {(licenseDuration.years > 0 || licenseDuration.months > 0) &&
                licenseDuration.days > 0 &&
                " e "}
              {licenseDuration.days > 0 &&
                `${licenseDuration.days} dia${
                  licenseDuration.days !== 1 ? "s" : ""
                }`}
              {" com carta de condução"}
            </p>
          )}
          {dateError && (
            <p className="text-red-500 text-sm mt-1">{dateError}</p>
          )}
        </>
      ) : (field.sourceData === "modelo" || field.name === "model" || field.name === "vehicleModel") && !isApiField ? (
        /* Campo de Modelo customizado (lógica antiga - apenas se NÃO for dinâmico) */
        loadingModel ? (
          <div className="px-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium">Buscando modelos...</span>
            </div>
          </div>
        ) : errorModel ? (
          <div className="px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 text-red-700">
            <span className="text-sm">{errorModel}</span>
            <button
              type="button"
              onClick={() =>
                localGlobalState.selectedBrand.id &&
                loadModels(localGlobalState.selectedBrand.id)
              }
              className="ml-2 text-sm font-medium underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <Select
            value={value || ""}
            onValueChange={(newValue) => onChange(newValue)}
            disabled={modelFieldState.disabled}
            required={field.required}
          >
            <SelectTrigger className={error ? "border-red-500" : ""} disabled={modelFieldState.disabled}>
              <SelectValue placeholder={modelFieldState.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {modelFieldState.showOptions &&
                localGlobalState.modelOptions.map((model) => (
                  <SelectItem key={model.id} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )
      ) : isApiField && !isAutocompleteType(field.type) ? (
        /* Campo com dados de API dinâmica (Select) */
        loadingApi ? (
          <div className="px-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium">Carregando opções...</span>
            </div>
          </div>
        ) : errorApi ? (
          <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            <span className="text-sm">{errorApi}</span>
          </div>
        ) : apiOptions.length > 0 ? (
          <Select
            value={value || ""}
            onValueChange={(newValue) => {
              onChange(newValue);
            }}
            required={field.required}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.fieldPlaceholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {apiOptions.map((opt) => (
                <SelectItem key={String(opt.id)} value={String(opt.name)}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            <span className="text-sm">
              {field.name === 'model' || field.name === 'vehicleModel'
                ? 'Nenhum modelo disponível no momento.'
                : 'Nenhuma opção disponível no momento.'}
            </span>
          </div>
        )
      ) : isDomainField ? (
        /* Campo com dados de domínio dinâmico customizado */
        loadingDomain ? (
          <div className="px-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium">Carregando opções...</span>
            </div>
          </div>
        ) : errorDomain ? (
          <div className="px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 text-red-700">
            <span className="text-sm">Erro ao carregar opções: {errorDomain}</span>
          </div>
        ) : (
          <Select
            value={value || ""}
            onValueChange={(newValue) => onChange(newValue)}
            required={field.required}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.fieldPlaceholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {domainOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : field.type === "select" ? (
        /* Select genérico customizado */
        <Select
          value={value || ""}
          onValueChange={(newValue) => onChange(newValue)}
          required={field.required}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={field.fieldPlaceholder || "Selecione uma opção"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.name}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isAutocompleteType(field.type) ? (
        /* Autocomplete */
        <div className="relative">
          <input
            id={field.name}
            name={field.name}
            type="text"
            value={filter}
            placeholder={field.fieldPlaceholder || "Digite para buscar..."}
            onChange={(e) => {
              isUserTypingRef.current = true; // Marcar que o usuário está digitando
              setFilter(e.target.value);
              onChange(e.target.value);
              setShowOptions(true);
            }}
            onClick={() => {
              // Mostrar opções quando clicar no campo
              if (isApiField) {
                // Para campos de API, verificar apiOptions
                if (apiOptions.length > 0 && !loadingApi) {
                  setShowOptions(true);
                }
              } else {
                // Para campos normais, verificar availableOptions
                if (availableOptions.length > 0 && !loadingApi) {
                  setShowOptions(true);
                }
              }
            }}
            onFocus={() => {
              // Mostrar todas as opções quando receber foco (se houver opções)
              if (isApiField) {
                // Para campos de API, verificar apiOptions
                if (apiOptions.length > 0 && !loadingApi) {
                  console.log(`🎯 [${field.name}] onFocus - Mostrando opções:`, {
                    apiOptionsCount: apiOptions.length,
                    showOptions: true
                  });
                  setShowOptions(true);
                } else {
                  console.log(`⚠️ [${field.name}] onFocus - Não pode mostrar opções:`, {
                    apiOptionsCount: apiOptions.length,
                    loadingApi
                  });
                }
              } else {
                // Para campos normais, verificar availableOptions
                if (availableOptions.length > 0 && !loadingApi) {
                  setShowOptions(true);
                }
              }
            }}
            onKeyDown={(e) => {
              // Mostrar opções quando começar a digitar
              if (isApiField) {
                if (apiOptions.length > 0 && !loadingApi && !showOptions) {
                  setShowOptions(true);
                }
              } else {
                if (availableOptions.length > 0 && !loadingApi && !showOptions) {
                  setShowOptions(true);
                }
              }
            }}
            onBlur={() => setTimeout(() => setShowOptions(false), 300)}
            autoComplete="off"
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
              error ? "border-red-500" : "border-gray-300"
            } ${isApiField && (loadingApi || availableOptions.length > 0) ? "pr-20" : ""}`}
            required={field.required}
            disabled={isApiField && loadingApi}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isApiField && loadingApi && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent"></div>
            )}
            {isApiField && !loadingApi && availableOptions.length > 0 && (
              <span className="text-xs text-gray-500">{availableOptions.length}</span>
            )}
          </div>
          {isApiField && errorApi && (
            <div className="mt-1 text-xs text-gray-500">
              {field.name === 'brand' || field.name === 'vehicleBrand' 
                ? 'Não foi possível carregar as marcas.'
                : `Sem opções disponíveis no momento.`}
            </div>
          )}
          {isApiField && !loadingApi && !errorApi && apiOptions.length === 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {field.name === 'brand' || field.name === 'vehicleBrand'
                ? 'Nenhuma marca disponível no momento.'
                : 'Sem opções disponíveis no momento.'}
            </div>
          )}
          {showOptions && filteredOptions.length > 0 && shouldFilter && (
            <ul className="absolute z-50 bg-white border border-gray-300 rounded-md w-full max-h-40 overflow-auto mt-1 shadow-lg">
              {(() => {
                if (field.name === 'brand' || field.name === 'vehicleBrand') {
                  console.log(`📋 [${field.name}] Renderizando opções:`, {
                    showOptions,
                    filteredOptionsCount: filteredOptions.length,
                    availableOptionsCount: availableOptions.length,
                    apiOptionsCount: apiOptions.length
                  });
                }
                return null;
              })()}
              {filteredOptions.map((opt) => (
                <li
                  key={String(opt.id)}
                  className="px-4 py-2 hover:bg-[#002256] hover:text-white cursor-pointer"
                  onMouseDown={() => handleSelectOption(opt.name)}
                >
                  {opt.name}
                </li>
              ))}
            </ul>
          )}
          {showOptions && !loadingApi && shouldFilter && filteredOptions.length === 0 && availableOptions.length > 0 && (
            <ul className="absolute z-50 bg-white border border-gray-300 rounded-md w-full mt-1 shadow-lg">
              <li className="px-4 py-2 text-gray-500 text-sm">Nenhum resultado encontrado</li>
            </ul>
          )}
          {showOptions && !shouldFilter && isModelField && (
            <ul className="absolute z-50 bg-white border border-gray-300 rounded-md w-full mt-1 shadow-lg">
              <li className="px-4 py-2 text-gray-500 text-sm">Digite pelo menos 3 letras para pesquisar</li>
            </ul>
          )}
        </div>
      ) : (
        /* Input padrão customizado */
        <Input
          id={field.name}
          name={field.name}
          type={field.type || "text"}
          value={value || ""}
          placeholder={field.fieldPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${error ? "border-red-500" : ""} ${
            ["nif", "emails"].includes(field.name) ? "bg-gray-50" : ""
          }`}
          required={field.required}
          disabled={["nif", "emails"].includes(field.name)}
        />
      )}
      {/* Mensagem de erro */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <style jsx>{`
        .react-select-container {
          width: 100%;
        }
        .react-select__control {
          min-height: 42px;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
        }
        .react-select__control--is-focused {
          box-shadow: 0 0 0 2px #002256;
          border-color: #002256;
        }
        .react-select--error .react-select__control {
          border-color: #ef4444;
        }
      `}</style>
    </div>
  );
}
