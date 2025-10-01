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
  const [nifInputs, setNifInputs] = useState<Record<string, string>>({});

  // Função simples para converter valor para número
  const parseCurrencyValue = (value: string): number => {
    if (!value) return 0;

    // Remover tudo exceto números
    const numbers = value.replace(/\D/g, "");

    return parseFloat(numbers) || 0;
  };

  // Inicializar formData baseado no modo e dados
  useEffect(() => {
    if (mode === "edit" && collaborator && fields && fields.length > 0) {
      // Modo edição: carregar dados do colaborador
      const processedData: Record<string, string | number> = {};
      const currencyInputsData: Record<string, string> = {};
      const nifInputsData: Record<string, string> = {};

      // Inicializar todos os campos baseado na definição dos fields
      fields.forEach((field) => {
        const value = collaborator[field.name];

        if (field.name === "nif") {
          // Para NIF (prioridade sobre type)
          if (value !== undefined && value !== null) {
            // Converter para string, removendo formatação se existir
            const nifValue = String(value).replace(/\D/g, "");
            processedData[field.name] = nifValue;
            nifInputsData[field.name] = nifValue;
          } else {
            processedData[field.name] = "";
            nifInputsData[field.name] = "";
          }
        } else if (field.type === "number") {
          // Para campos numéricos (exceto NIF), garantir que seja um número
          if (value !== undefined && value !== null) {
            if (typeof value === "string") {
              const numericValue = parseFloat(value) || 0;
              processedData[field.name] = numericValue;
              currencyInputsData[field.name] = String(numericValue);
            } else if (typeof value === "number") {
              processedData[field.name] = value;
              currencyInputsData[field.name] = String(value);
            } else {
              processedData[field.name] = 0;
              currencyInputsData[field.name] = "0";
            }
          } else {
            processedData[field.name] = 0;
            currencyInputsData[field.name] = "0";
          }
        } else {
          // Para outros campos de texto
          if (value !== undefined && value !== null) {
            processedData[field.name] = String(value);
          } else {
            processedData[field.name] = "";
          }
        }
      });

      setFormData(processedData);
      setCurrencyInputs(currencyInputsData);
      setNifInputs(nifInputsData);
      setErrors({});
    } else if (mode === "add" && fields && fields.length > 0) {
      // Modo adição: inicializar com valores padrão
      const initialData: Record<string, string | number> = {};
      const currencyInputsData: Record<string, string> = {};
      const nifInputsData: Record<string, string> = {};

      fields.forEach((field) => {
        if (field.type === "number") {
          initialData[field.name] = 0;
          currencyInputsData[field.name] = "";
        } else if (field.name === "nif") {
          initialData[field.name] = "";
          nifInputsData[field.name] = "";
        } else {
          initialData[field.name] = "";
        }
      });

      setFormData(initialData);
      setCurrencyInputs(currencyInputsData);
      setNifInputs(nifInputsData);
      setErrors({});
    }
  }, [mode, collaborator, fields]);

  // Função para validar NIF usando algoritmo de validação
  const validateNIF = (nif: string): boolean => {
    // Verificar se tem exatamente 9 dígitos
    if (!/^\d{9}$/.test(nif)) {
      return false;
    }

    // Verificar se não são todos os dígitos iguais
    if (/^(\d)\1{8}$/.test(nif)) {
      return false;
    }

    // Algoritmo de validação do NIF
    const checkDigit = parseInt(nif[8]);
    const firstEightDigits = nif.substring(0, 8);

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(firstEightDigits[i]) * (9 - i);
    }

    const remainder = sum % 11;
    const calculatedCheckDigit = remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === calculatedCheckDigit;
  };

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

      // Validação específica para NIF (algoritmo de validação completo)
      if (field.name === "nif" && typeof value === "string") {
        const numbers = value.replace(/\D/g, "");

        // Se o campo está vazio e é obrigatório, já foi validado acima
        if (!value || numbers.length === 0) {
          return;
        }

        // Verificar se tem exatamente 9 dígitos
        if (numbers.length !== 9) {
          newErrors[
            field.name
          ] = `${fieldLabel} deve ter exatamente 9 dígitos numéricos`;
          return;
        }

        // Verificar se são apenas números
        if (!/^\d{9}$/.test(numbers)) {
          newErrors[field.name] = `${fieldLabel} deve conter apenas números`;
          return;
        }

        // Validar NIF usando algoritmo de validação
        const isValidNIF = validateNIF(numbers);
        if (!isValidNIF) {
          newErrors[field.name] = `${fieldLabel} não é um NIF válido`;
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

  // Função específica para lidar com input do NIF
  const handleNifInput = (fieldName: string, value: string) => {
    // Remover tudo exceto números
    const numbers = value.replace(/\D/g, "");

    // Limitar a 9 dígitos
    const limitedNumbers = numbers.slice(0, 9);

    // Atualizar o input visual (sem formatação)
    setNifInputs((prev) => ({
      ...prev,
      [fieldName]: limitedNumbers,
    }));

    // Salvar apenas os números no formData para validação
    handleInputChange(fieldName, limitedNumbers);
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
    setNifInputs({});
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
      <div className="bg-white rounded-lg shadow-xl max-w-md sm:max-w-xl w-full">
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#002256] mb-2">
              {modalTitle}
            </h2>
            <p className="text-sm text-gray-600">{modalDescription}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {" "}
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

                      {field.name === "nif" ? (
                        <input
                          type="text"
                          value={nifInputs[field.name] || ""}
                          onChange={(e) => {
                            handleNifInput(field.name, e.target.value);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002256] ${
                            hasError ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Digite apenas 9 dígitos"
                          maxLength={9} // 9 dígitos numéricos
                          inputMode="numeric"
                        />
                      ) : field.type === "number" ? (
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
                          type={field.type === "date" ? "date" : "text"}
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
            </div>

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
