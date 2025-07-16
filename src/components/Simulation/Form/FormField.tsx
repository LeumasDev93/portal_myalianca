/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchVehicleBrands } from "@/service/marcaService";
import { fetchVehicleModels } from "@/service/modeloService";

interface Option {
  id: number | string;
  name: string;
}

interface FormFieldData {
  name: string;
  label: string;
  sourceData: string;
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

const subscribeToGlobalState = (callback: () => void) => {
  globalState.listeners.add(callback);
  return () => globalState.listeners.delete(callback);
};

export default function FormField({
  field,
  value,
  onChange,
  error,
  options = [],
}: FormFieldProps) {
  const [filter, setFilter] = useState(value || "");
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado local das marcas
  const [marcaOptions, setMarcaOptions] = useState<Option[]>([]);
  const [loadingMarca, setLoadingMarca] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [errorMarca, setErrorMarca] = useState<string | null>(null);
  const [errorModel, setErrorModel] = useState<string | null>(null);

  // Estado local que sincroniza com o global
  const [localGlobalState, setLocalGlobalState] = useState(globalState);

  // Função para atualizar estado local
  const updateLocalState = useCallback(() => {
    setLocalGlobalState({ ...globalState });
  }, []);

  // Subscreve às mudanças do estado global
  useEffect(() => {
    const unsubscribe = subscribeToGlobalState(updateLocalState);
    return unsubscribe; // Retorna diretamente a função de unsubscribe
  }, [updateLocalState]);

  // Atualiza filtro quando value muda
  useEffect(() => {
    setFilter(value || "");
  }, [value]);

  // Carrega marcas apenas uma vez quando o componente monta
  useEffect(() => {
    if (field.name === "brand" && marcaOptions.length === 0) {
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
    if (field.name === "brand") {
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
    if (field.sourceData === "modelo") {
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

      if (
        !loadingModel &&
        (globalState.lastLoadedBrandId !== localGlobalState.selectedBrand.id ||
          localGlobalState.modelOptions.length === 0)
      ) {
        loadModels(localGlobalState.selectedBrand.id);
      }
    }
  }, [
    localGlobalState.selectedBrand.id,
    field.sourceData,
    loadingModel,
    value,
    onChange,
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
      className={`md:col-span-${field.fieldSize || 1} relative mb-4`}
    >
      <label
        htmlFor={field.name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Campo de Marca */}
      {field.name === "brand" ? (
        loadingMarca ? (
          <div className="p-2 border rounded-md bg-blue-50 text-blue-600 border-blue-200">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Buscando marcas...
            </div>
          </div>
        ) : errorMarca ? (
          <div className="text-red-500 bg-red-50 p-2 border border-red-300 rounded-md">
            {errorMarca}
          </div>
        ) : (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={handleMarcaChange}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
              error ? "border-red-500" : "border-gray-300"
            }`}
            required={field.required}
          >
            <option value="">
              {field.fieldPlaceholder || "Selecione uma marca"}
            </option>
            {marcaOptions.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        )
      ) : field.sourceData === "modelo" ? (
        /* Campo de Modelo */
        loadingModel ? (
          <div className="p-2 border rounded-md bg-blue-50 text-blue-600 border-blue-200">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Buscando modelos...
            </div>
          </div>
        ) : errorModel ? (
          <div className="text-red-500 bg-red-50 p-2 border border-red-300 rounded-md">
            {errorModel}
            <button
              type="button"
              onClick={() =>
                localGlobalState.selectedBrand.id &&
                loadModels(localGlobalState.selectedBrand.id)
              }
              className="ml-2 text-sm underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={modelFieldState.disabled}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
              error ? "border-red-500" : "border-gray-300"
            } ${
              modelFieldState.disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-500"
                : "bg-white"
            }`}
            required={field.required}
          >
            <option value="">{modelFieldState.placeholder}</option>
            {modelFieldState.showOptions &&
              localGlobalState.modelOptions.map((model) => (
                <option key={model.id} value={model.name}>
                  {model.name}
                </option>
              ))}
          </select>
        )
      ) : field.type === "select" ? (
        /* Select genérico */
        <select
          id={field.name}
          name={field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          required={field.required}
        >
          <option value="">
            {field.fieldPlaceholder || "Selecione uma opção"}
          </option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
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
        /* Input padrão */
        <input
          id={field.name}
          name={field.name}
          type={field.type || "text"}
          value={value}
          placeholder={field.fieldPlaceholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#002256] ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          required={field.required}
        />
      )}

      {/* Mensagem de erro */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
