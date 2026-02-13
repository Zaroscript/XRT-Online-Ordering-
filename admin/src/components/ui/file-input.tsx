import Uploader from '@/components/common/uploader';
import TooltipLabel from '@/components/ui/tooltip-label';
import { Controller } from 'react-hook-form';
import ValidationError from '@/components/ui/form-validation-error';

interface FileInputProps {
  control: any;
  name: string;
  multiple?: boolean;
  acceptFile?: boolean;
  helperText?: string;
  defaultValue?: any;
  maxSize?: number;
  disabled?: boolean;
  toolTipText?: string;
  label?: string;
  required?: boolean;
  error?: string;
  accept?: string; // New prop for custom accept types
  section?: string; // New prop for folder organization
  skipImmediateUpload?: boolean;
}

const FileInput = ({
  control,
  name,
  multiple = true,
  acceptFile = false,
  helperText,
  defaultValue = [],
  maxSize,
  disabled,
  label,
  toolTipText,
  required,
  error,
  accept,
  section,
  skipImmediateUpload,
}: FileInputProps) => {
  return (
    <>
      {label && (
        <TooltipLabel
          htmlFor={name}
          toolTipText={toolTipText}
          label={label}
          required={required}
        />
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { ref, ...rest } }) => (
          <Uploader
            {...rest}
            name={name}
            multiple={multiple}
            acceptFile={acceptFile}
            helperText={helperText}
            maxSize={maxSize}
            disabled={disabled}
            accept={accept}
            section={section}
            skipImmediateUpload={skipImmediateUpload}
          />
        )}
      />
      {error ? <ValidationError message={error} /> : ''}
    </>
  );
};

export default FileInput;
