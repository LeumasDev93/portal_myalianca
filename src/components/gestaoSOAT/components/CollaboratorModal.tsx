import { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

interface Field {
  id: string;
  name: string;
  label: string | null;
  type: string;
  position: number;
  format: string | null;
  required: boolean | null;
  field_max_size: number | null;
  field_min_size: number | null;
  field_placeholder: string | null;
}

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collaborator: Record<string, string | number>) => void;
  loading?: boolean;
  fields: Field[];
  mode: "add" | "edit";
  collaborator?: Record<string, string | number> | null;
}

export default function CollaboratorModal({
  isOpen,
  onClose,
  onSave,
  loading = false,
  fields,
  mode,
  collaborator = null,
}: CollaboratorModalProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currencyInputs, setCurrencyInputs] = useState<Record<string, string>>(
    {}
  );

  // Função simples para converter valor para número
  const parseCurrencyValue = (value: string): number => {
    if (!value) return 0;

    // Remover tudo exceto números
    const numbers = value.replace(/\D/g, "");

    return parseFloat(numbers) || 0;
  };

  // Inicializar formData baseado no modo e dados
  useEffect(() => {
    if (mode === "edit" && collaborator) {
      // Modo edição: carregar dados do colaborador
      const processedData: Record<string, string | number> = {};

      // Processar cada campo do colaborador
      Object.keys(collaborator).forEach((key) => {
        const value = collaborator[key];

        // Verificar se é um campo numérico baseado nos fields
        const field = fields.find((f) => f.name === key);

        if (field && field.type === "number") {
          // Para campos numéricos, garantir que seja um número
          if (typeof value === "string") {
            // Se for string, tentar converter para número
            const numericValue = parseFloat(value) || 0;
            processedData[key] = numericValue;
          } else if (typeof value === "number") {
            processedData[key] = value;
          } else {
            processedData[key] = 0;
          }
        } else {
          // Para campos não numéricos, manter como string
          processedData[key] = value || "";
        }
      });

      setFormData(processedData);
      setErrors({});

      // Inicializar inputs de moeda para campos numéricos
      const currencyInputsData: Record<string, string> = {};
      fields.forEach((field) => {
        if (field.type === "number" && processedData[field.name]) {
          // Mostrar o valor original sem formatação
          currencyInputsData[field.name] = String(processedData[field.name]);
        }
      });
      setCurrencyInputs(currencyInputsData);
    } else if (mode === "add" && fields && fields.length > 0) {
      // Modo adição: inicializar com valores padrão
      const initialData: Record<string, string | number> = {};
      const currencyInputsData: Record<string, string> = {};

      fields.forEach((field) => {
        if (field.type === "number") {
          initialData[field.name] = 0;
          currencyInputsData[field.name] = "";
        } else {
          initialData[field.name] = "";
        }
      });

      setFormData(initialData);
      setCurrencyInputs(currencyInputsData);
      setErrors({});
    }
  }, [mode, collaborator, fields]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fields || fields.length === 0) {
      return true; // Se não há fields, não há validação
    }

    fields.forEach((field) => {
      const value = formData[field.name];
      const fieldLabel = field.label || field.name;

      // Validação de campo obrigatório
      if (
        field.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        newErrors[field.name] = `${fieldLabel} é obrigatório`;
        return;
      }

      // Validação de tamanho mínimo
      if (
        field.field_min_size &&
        typeof value === "string" &&
        value.length < field.field_min_size
      ) {
        newErrors[
          field.name
        ] = `${fieldLabel} deve ter pelo menos ${field.field_min_size} caracteres`;
        return;
      }

      // Validação de tamanho máximo
      if (
        field.field_max_size &&
        typeof value === "string" &&
        value.length > field.field_max_size
      ) {
        newErrors[
          field.name
        ] = `${fieldLabel} deve ter no máximo ${field.field_max_size} caracteres`;
        return;
      }

      // Validação específica para NIF (apenas 9 dígitos numéricos)
      if (
        field.format === "XXX.XXX.XXX" &&
        value &&
        typeof value === "string"
      ) {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length !== 9) {
          newErrors[field.name] = `${fieldLabel} deve ter exatamente 9 dígitos`;
          return;
        }
      }

      // Validação para campos numéricos
      if (field.type === "number" && typeof value === "number" && value <= 0) {
        newErrors[field.name] = `${fieldLabel} deve ser maior que zero`;
        return;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (fieldName: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const formatFieldValue = (value: string, field: Field) => {
    if (!field.format || !value) return value;

    const numbers = value.replace(/\D/g, "");

    // Aplicar formatação apenas para NIF (XXX.XXX.XXX)
    if (field.format === "XXX.XXX.XXX" && numbers.length <= 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    }

    return value;
  };

  // Função simples para lidar com entrada de moeda
  const handleCurrencyInput = (fieldName: string, inputValue: string) => {
    // Atualizar o input visual
    setCurrencyInputs((prev) => ({
      ...prev,
      [fieldName]: inputValue,
    }));

    // Converter para número e salvar
    const numericValue = parseCurrencyValue(inputValue);
    handleInputChange(fieldName, numericValue);
  };

  const handleClose = () => {
    // Resetar formulário ao fechar
    setFormData({});
    setErrors({});
    setCurrencyInputs({});
    onClose();
  };

  if (!isOpen) return null;

  // Se não há fields, não renderizar o modal
  if (!fields || fields.length === 0) {
    return null;
  }

  const modalTitle =
    mode === "add" ? "Adicionar Colaborador" : "Editar Colaborador";
  const modalDescription =
    mode === "add"
      ? "Preencha as informações do novo colaborador."
      : "Edite as informações do colaborador selecionado.";
  const buttonText =
    mode === "add" ? "Adicionar Colaborador" : "Salvar Alterações";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#002256] mb-2">
              {modalTitle}
            </h2>
            <p className="text-sm text-gray-600">{modalDescription}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields
              .sort((a, b) => a.position - b.position)
              .map((field) => {
                const fieldLabel = field.label || field.name;
                const isRequired = field.required;
                const hasError = errors[field.name];

                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fieldLabel}{" "}
                      {isRequired && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === "number" ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={currencyInputs[field.name] || ""}
                          onChange={(e) => {
                            handleCurrencyInput(field.name, e.target.value);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] ${
                            hasError ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder={field.field_placeholder || "0,00 CVE"}
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => {
                          const value = field.format
                            ? formatFieldValue(e.target.value, field)
                            : e.target.value;
                          handleInputChange(field.name, value);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] ${
                          hasError ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder={
                          field.field_placeholder ||
                          `Digite ${fieldLabel.toLowerCase()}`
                        }
                        maxLength={field.field_max_size || undefined}
                        minLength={field.field_min_size || undefined}
                      />
                    )}

                    {hasError && (
                      <p className="text-red-500 text-sm mt-1">{hasError}</p>
                    )}
                  </div>
                );
              })}

            {/* Botões */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#002256] text-white rounded-lg hover:bg-[#002256]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
