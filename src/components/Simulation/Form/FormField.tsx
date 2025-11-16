/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchVehicleBrands } from "@/service/marcaService";
import { fetchVehicleModels } from "@/service/modeloService";
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
    | "number"
    | "brand"
    | "model"
    | string;
  required?: boolean;
  fieldPlaceholder?: string;
  fieldSize?: number;
}

interface FormFieldProps {
  field: FormFieldData;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  options?: Option[];
}

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
}: FormFieldProps) {
  const { profile } = useUserProfile();
  
  // Hook para buscar dados de domínio quando sourceDataType for "DOMAIN"
  const isDomainField = field.sourceDataType?.toUpperCase() === "DOMAIN";
  const domainName = isDomainField ? field.sourceData : null;
  const { options: domainOptions, loading: loadingDomain, error: errorDomain } = useDomain(domainName);

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

  // Atualiza filtro quando value muda
  useEffect(() => {
    setFilter(value || "");
  }, [value]);

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

  // Carrega marcas apenas uma vez quando o componente monta
  useEffect(() => {
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
          console.error("Erro ao buscar marcas:", err);
          setErrorMarca("Erro ao carregar marcas. Tente novamente mais tarde.");
        } finally {
          setLoadingMarca(false);
        }
      };
      loadBrands();
    }
  }, [field.name, marcaOptions.length]);

  // Sincroniza o estado da marca selecionada com o valor atual
  useEffect(() => {
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
  }, [value, marcaOptions, field.name]);

  // Carrega modelos quando a marca muda e apenas para campos de modelo
  useEffect(() => {
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
        console.error("Erro ao buscar modelos:", err);
        setErrorModel("Erro ao carregar modelos. Tente novamente mais tarde.");
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

  const filteredOptions = options.filter((opt) =>
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
      ) : field.name === "brand" || field.name === "vehicleBrand" ? (
        loadingMarca ? (
          <div className="px-4 py-3 border-2 border-blue-300 rounded-lg bg-blue-50 text-blue-700">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium">Buscando marcas...</span>
            </div>
          </div>
        ) : errorMarca ? (
          <div className="px-4 py-3 border-2 border-red-300 rounded-lg bg-red-50 text-red-700">
            <span className="text-sm">{errorMarca}</span>
          </div>
        ) : (
          <ReactSelect
            id={field.name}
            name={field.name}
            value={value ? { value, label: value } : null}
            onChange={(selectedOption) => {
              const newValue = selectedOption ? selectedOption.value : "";
              onChange(newValue);
              setFilter(newValue);

              // Lógica adicional para marca, se necessário
              if (field.name === "brand" || field.name === "vehicleBrand") {
                const selectedBrand = marcaOptions.find(
                  (m) => m.name === newValue
                );
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
              }
            }}
            options={marcaOptions.map((brand) => ({
              value: brand.name,
              label: brand.name,
            }))}
            className={`react-select-container ${
              error ? "react-select--error" : ""
            }`}
            classNamePrefix="react-select"
            placeholder={field.fieldPlaceholder || "Selecione uma marca"}
            isClearable
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 3
                ? "Digite pelo menos 3 letras"
                : "Nenhuma marca encontrada"
            }
            loadingMessage={() => "Carregando..."}
            isLoading={loadingMarca}
            required={field.required}
          />
        )
      ) : field.sourceData === "modelo" || field.name === "model" || field.name === "vehicleModel" ? (
        /* Campo de Modelo customizado */
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
      ) : field.type === "autocomplete" ? (
        /* Autocomplete */
        <div className="relative">
          <input
            id={field.name}
            name={field.name}
            type="text"
            value={filter}
            placeholder={field.fieldPlaceholder || "Digite para buscar..."}
            onChange={(e) => {
              setFilter(e.target.value);
              onChange(e.target.value);
              setShowOptions(true);
            }}
            onFocus={() => setShowOptions(true)}
            onBlur={() => setTimeout(() => setShowOptions(false), 200)}
            autoComplete="off"
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            required={field.required}
          />
          {showOptions && filteredOptions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full max-h-40 overflow-auto mt-1 shadow-lg">
              {filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  className="px-4 py-2 hover:bg-[#002256] hover:text-white cursor-pointer"
                  onMouseDown={() => handleSelectOption(opt.name)}
                >
                  {opt.name}
                </li>
              ))}
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
