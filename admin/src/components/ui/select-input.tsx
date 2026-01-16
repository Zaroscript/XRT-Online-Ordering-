import Select from '@/components/ui/select/select';
import TooltipLabel from '@/components/ui/tooltip-label';
import { Controller } from 'react-hook-form';
import { GetOptionLabel } from 'react-select';

interface SelectInputProps {
  control: any;
  rules?: any;
  name: string;
  options: object[];
  getOptionLabel?: GetOptionLabel<unknown>;
  getOptionValue?: GetOptionLabel<unknown>;
  isMulti?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  [key: string]: unknown;
  placeholder?: string;
  required?: boolean;
  label?: string;
  toolTipText?: string;
  error?: string;
}

const SelectInput = ({
  control,
  options,
  name,
  rules,
  getOptionLabel,
  getOptionValue,
  disabled,
  isMulti,
  isClearable,
  isLoading,
  placeholder,
  label,
  required,
  toolTipText,
  error,
  ...rest
}: SelectInputProps) => {
  return (
    <>
      {label ? (
        <TooltipLabel
          htmlFor={name}
          toolTipText={toolTipText}
          label={label}
          required={required}
        />
      ) : (
        ''
      )}
      <Controller
        control={control}
        name={name}
        rules={rules}
        {...rest}
        render={({ field: { onChange, value, ...field } }) => {
          // Handle value for both single and multi-select
          let selectedValue: any = null;
          if (isMulti) {
            // For multi-select, value is an array (of IDs or objects)
            if (Array.isArray(value)) {
              selectedValue = value.map((val: any) => {
                // If val is already an object, return it
                if (typeof val === 'object' && val !== null) {
                  return val;
                }
                // Otherwise, find the option by ID
                return options?.find((opt: any) => {
                  const optValue = getOptionValue ? getOptionValue(opt) : (opt as any).id || (opt as any).value;
                  return optValue === val || optValue === (val?.id || val);
                });
              }).filter(Boolean);
            }
          } else {
            // For single select
            if (value) {
              // If value is already an object, return it
              if (typeof value === 'object' && value !== null) {
                selectedValue = value;
              } else {
                // Otherwise, find the option by ID
                selectedValue = options?.find((opt: any) => {
                  const optValue = getOptionValue ? getOptionValue(opt) : (opt as any).id || (opt as any).value;
                  return optValue === value || optValue === (value?.id || value);
                });
              }
            }
          }

          return (
            <Select
              {...field}
              value={selectedValue}
              onChange={(val: any) => {
                if (isMulti) {
                  // For multi-select, val is an array of selected option objects
                  // We want to store the full objects, not just IDs
                  onChange(val || []);
                } else {
                  // For single select, val is a single option object or null
                  onChange(val || null);
                }
              }}
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              placeholder={placeholder}
              isMulti={isMulti}
              isClearable={isClearable}
              isLoading={isLoading}
              options={options}
              isDisabled={disabled as boolean}
            />
          );
        }}
      />
      {error && <p className="my-2 text-xs text-red-500 text-start">{error}</p>}
    </>
  );
};

export default SelectInput;
