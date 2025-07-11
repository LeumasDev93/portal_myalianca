/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormFieldData } from "@/types/typesData";

export default function FormField({
  field,
  value,
  onChange,
}: {
  field: FormFieldData;
  value: any;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className={`md:col-span-${field.fieldSize}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={field.type}
        name={field.name}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#002256] focus:border-transparent"
        required={field.required}
      />
    </div>
  );
}
