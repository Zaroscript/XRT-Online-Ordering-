import { CloseIcon } from '@/components/icons/close-icon';
import { Attachment } from '@/types';
import { zipPlaceholder } from '@/utils/placeholders';
import cn from 'classnames';

interface FilePreviewProps {
  files: Attachment[];
  onDelete: (thumbnail: string) => void;
  disabled?: boolean;
}

export default function FilePreview({
  files,
  onDelete,
  disabled,
}: FilePreviewProps) {
  if (!files || files.length === 0) return null;

  return (
    <aside className="flex flex-wrap mt-2">
      {files.map((file, idx) => {
        const isImage = isImageFile(file);
        const { filename, fileType } = extractFileInfo(file);

        return (
          <div
            className={cn(
              'relative mt-2 inline-flex flex-col overflow-hidden rounded me-2',
              isImage ? 'border border-border-200' : '',
              disabled
                ? 'cursor-not-allowed border-[#D4D8DD] bg-[#EEF1F4]'
                : '',
            )}
            key={idx}
          >
            {isImage ? (
              <div className="flex items-center justify-center w-16 h-16 min-w-0 overflow-hidden bg-gray-50 rounded">
                <img
                  src={file.thumbnail || file.original}
                  alt={filename || 'uploaded-image'}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : isVideoFile(file) ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 min-w-0 overflow-hidden bg-gray-800 rounded text-white text-[10px] font-bold">
                  VIDEO
                </div>
                <p className="flex items-baseline p-1 text-xs cursor-default text-body">
                  <span
                    className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                    title={`${filename}.${fileType}`}
                  >
                    {filename}
                  </span>
                  .{fileType}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center min-w-0 overflow-hidden h-14 w-14">
                  <img
                    src={
                      typeof zipPlaceholder === 'string'
                        ? zipPlaceholder
                        : zipPlaceholder.src
                    }
                    width={56}
                    height={56}
                    alt="upload placeholder"
                    className="object-contain"
                  />
                </div>
                <p className="flex items-baseline p-1 text-xs cursor-default text-body">
                  <span
                    className="inline-block max-w-[64px] overflow-hidden overflow-ellipsis whitespace-nowrap"
                    title={`${filename}.${fileType}`}
                  >
                    {filename}
                  </span>
                  .{fileType}
                </p>
              </div>
            )}
            {!disabled && (
              <button
                className="absolute flex items-center justify-center w-4 h-4 text-xs bg-red-600 rounded-full shadow-xl outline-none top-1 text-light end-1"
                onClick={() => onDelete(file.thumbnail)}
                type="button"
              >
                <CloseIcon width={10} height={10} />
              </button>
            )}
          </div>
        );
      })}
    </aside>
  );
}

// Helper functions (extracted from original uploader.tsx)

const imgTypes = [
  'tif',
  'tiff',
  'bmp',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'png',
  'eps',
  'raw',
  'svg',
];
const videoTypes = ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'avi', 'mkv'];

function extractFileInfo(file: Attachment): {
  filename: string;
  fileType: string;
} {
  let fileType = '';
  let filename = '';

  // Try to get file type from file_name first
  if (file?.file_name) {
    const parts = file.file_name.split('.');
    if (parts.length > 1) {
      fileType = parts.pop()?.toLowerCase() || '';
      filename = parts.join('.');
    } else {
      filename = file.file_name;
    }
    return { filename, fileType };
  }

  // Fallback to extracting from thumbnail/original URL
  const url = file?.thumbnail || file?.original;
  if (url) {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    const parts = lastPart.split('.');
    if (parts.length > 1) {
      fileType = parts.pop()?.toLowerCase() || '';
      filename = parts.join('.');
    } else {
      filename = lastPart;
    }
  }

  return { filename, fileType };
}

function isImageFile(file: Attachment): boolean {
  const { fileType } = extractFileInfo(file);
  const hasImageUrl =
    file?.thumbnail?.includes('cloudinary') ||
    file?.original?.includes('cloudinary') ||
    file?.thumbnail?.match(/\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i) ||
    file?.original?.match(/\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i);

  // If it's a known video type, it's not an image file (for preview purposes)
  if (videoTypes.includes(fileType)) return false;

  return (
    !!(file?.thumbnail || file?.original) &&
    (imgTypes.includes(fileType) || !!hasImageUrl)
  );
}

function isVideoFile(file: Attachment): boolean {
  const { fileType } = extractFileInfo(file);
  const hasVideoUrl =
    file?.thumbnail?.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i) ||
    file?.original?.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/i);

  return videoTypes.includes(fileType) || !!hasVideoUrl;
}
