import { useEffect, useState, useRef } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { Attachment } from '@/types';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { useUploadMutation } from '@/data/upload';
import { ACCEPTED_FILE_TYPES } from '@/utils/constants';
import classNames from 'classnames';
import { UploadIcon } from '@/components/icons/upload-icon';
import FilePreview from './uploader-preview';

interface UploaderProps {
  onChange: (value: Attachment[] | Attachment | null) => void;
  value: Attachment[] | Attachment | File | null;
  name?: string;
  multiple?: boolean;
  helperText?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  accept?: string | Record<string, string[]>;
  acceptFile?: boolean; // Legacy prop, can be deprecated
  section?: string;
  skipImmediateUpload?: boolean;
}

const getPreviewImage = (value: any): Attachment[] => {
  let images: any[] = [];
  if (value) {
    images = Array.isArray(value) ? value : [{ ...value }];
  }
  return images;
};

export default function Uploader({
  onChange,
  value,
  multiple,
  acceptFile,
  helperText,
  maxSize,
  maxFiles,
  disabled,
  accept,
  section,
  name,
  skipImmediateUpload = false,
}: UploaderProps) {
  const { t } = useTranslation();

  // Initialize state
  const [files, setFiles] = useState<Attachment[]>(() => {
    if (skipImmediateUpload && value instanceof File) {
      return [
        {
          thumbnail: URL.createObjectURL(value),
          original: URL.createObjectURL(value),
          id: 'local',
          file_name: value.name,
        } as Attachment,
      ];
    }
    return getPreviewImage(value);
  });

  const objectUrlRef = useRef<string[]>([]);
  const { mutate: upload, isPending: loading } = useUploadMutation();
  const [error, setError] = useState<string | null>(null);

  // Sync state with props
  useEffect(() => {
    if (value instanceof File) {
      // Prevent infinite loop by checking if files are already same as value
      if (
        files.length === 1 &&
        files[0].file_name === value.name &&
        files[0].id === 'local'
      ) {
        return;
      }
      const url = URL.createObjectURL(value);
      objectUrlRef.current.push(url);
      setFiles([
        {
          thumbnail: url,
          original: url,
          id: 'local',
          file_name: value.name,
        } as Attachment,
      ]);
      return () => {
        URL.revokeObjectURL(url);
        objectUrlRef.current = objectUrlRef.current.filter((u) => u !== url);
      };
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof File)
    ) {
      setFiles(getPreviewImage(value));
      return;
    }

    if (Array.isArray(value) && value.length > 0) {
      setFiles(getPreviewImage(value));
      return;
    }

    if (!value || (Array.isArray(value) && value.length === 0)) {
      setFiles([]);
    }
  }, [value, skipImmediateUpload]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlRef.current = [];
    };
  }, []);

  const resolveAccept = (): DropzoneOptions['accept'] => {
    if (accept) {
      if (accept === 'image/svg+xml') {
        return { 'image/svg+xml': ['.svg'] };
      }
      if (accept === 'image/*') {
        return {
          'image/jpeg': [],
          'image/png': [],
          'image/webp': [],
          'image/svg+xml': ['.svg'],
          'image/gif': [],
          'image/bmp': [],
        };
      }
      return typeof accept === 'string' ? { [accept]: [] } : accept;
    }
    if (!acceptFile) {
      return {
        'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
        'image/svg+xml': ['.svg'],
      };
    }
    return ACCEPTED_FILE_TYPES;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    if (skipImmediateUpload) {
      setError(null);
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      objectUrlRef.current.push(url);
      setFiles([
        {
          thumbnail: url,
          original: url,
          id: 'local',
          file_name: file.name,
        } as Attachment,
      ]);
      onChange(multiple ? (acceptedFiles as any) : file);
      return;
    }

    upload(
      { files: acceptedFiles, section, field: name },
      {
        onSuccess: (data: any) => {
          // data is Attachment[] based on our recent fix in uploadClient
          // However, we should be robust
          const raw = data?.data !== undefined ? data.data : data;
          const filesData = Array.isArray(raw)
            ? raw
            : raw &&
                typeof raw === 'object' &&
                (raw.thumbnail || raw.original || raw.path)
              ? [raw]
              : [];

          if (filesData.length === 0) {
            return;
          }

          const processed = filesData.map((file: any) => ({
            id: file.id || file.filename || file.public_id,
            thumbnail: file.thumbnail || file.original,
            original: file.original || file.thumbnail,
            file_name: file.file_name || file.name,
          }));

          const mergedData = multiple ? files.concat(processed) : processed[0];
          setFiles(multiple ? files.concat(processed) : processed);
          onChange(mergedData);
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            t('error-upload-failed');
          setError(errorMessage);
        },
      },
    );
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: resolveAccept(),
    multiple,
    onDrop,
    maxSize,
    maxFiles,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file?.errors?.forEach((error) => {
          if (error?.code === 'file-too-large') {
            setError(t('error-file-too-large'));
          } else if (error?.code === 'file-invalid-type') {
            setError(t('error-invalid-file-type'));
          } else {
            setError(error?.message || 'Error uploading file');
          }
        });
      });
    },
  });

  const handleDelete = (thumbnail: string) => {
    // If it's a local preview object URL, revoke it
    if (skipImmediateUpload && objectUrlRef.current.includes(thumbnail)) {
      URL.revokeObjectURL(thumbnail);
      objectUrlRef.current = objectUrlRef.current.filter(
        (u) => u !== thumbnail,
      );
    }

    const newFiles = files.filter((file) => file.thumbnail !== thumbnail);
    setFiles(newFiles);

    // If multiple, pass array. If single, pass null if empty, or undefined (preserving original logic)
    // Actually, for single file uploader, if we delete, clearly it's null.
    onChange(multiple ? newFiles : null);
  };

  return (
    <section className="upload">
      <div
        {...getRootProps({
          className: classNames(
            'border-dashed border-2 border-border-base h-36 rounded flex flex-col justify-center items-center cursor-pointer focus:border-accent-400 focus:outline-none relative',
            disabled
              ? 'pointer-events-none select-none opacity-80 bg-[#EEF1F4]'
              : 'cursor-pointer',
          ),
        })}
      >
        {!disabled ? <input {...getInputProps()} /> : ''}
        <UploadIcon className="text-muted-light" />
        <p className="mt-4 text-sm text-center text-body">
          {helperText ? (
            <span className="font-semibold text-gray-500">{helperText}</span>
          ) : (
            <>
              <span className="font-semibold text-accent">
                {t('text-upload-highlight')}
              </span>{' '}
              {t('text-upload-message')} <br />
              <span className="text-xs text-body">{t('text-img-format')}</span>
            </>
          )}
        </p>
        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}
      </div>

      {(!!files.length || loading) && (
        <>
          <FilePreview
            files={files}
            onDelete={handleDelete}
            disabled={disabled}
          />
          {loading && (
            <div className="flex items-center h-16 mt-2 ms-2">
              <Loader simple={true} className="w-6 h-6" />
            </div>
          )}
        </>
      )}
    </section>
  );
}
