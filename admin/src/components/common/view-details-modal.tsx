import { useTranslation } from 'next-i18next';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Image from 'next/image';
import dayjs from 'dayjs';

type ViewDetailsModalProps = {
  entityType?: 'category' | 'item' | 'modifier-group' | 'modifier';
};

const formatValue = (key: string, value: any, data?: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">N/A</span>;
  }

  // Boolean values
  if (typeof value === 'boolean') {
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    );
  }

  // Handle modifier_group_id by looking up the modifier_group object
  if (key === 'modifier_group_id' && data?.modifier_group?.name) {
    return <span className="font-medium">{data.modifier_group.name}</span>;
  }

  // Handle category_id by looking up the category object
  if (key === 'category_id' && data?.category?.name) {
    return <span className="font-medium">{data.category.name}</span>;
  }

  // Handle modifier_group object directly
  if (key === 'modifier_group' && typeof value === 'object' && value?.name) {
    return <span className="font-medium">{value.name}</span>;
  }

  // Handle category object directly
  if (key === 'category' && typeof value === 'object' && value?.name) {
    return <span className="font-medium">{value.name}</span>;
  }

  // Date fields
  if (
    key.includes('_at') ||
    key.includes('date') ||
    key.includes('Date') ||
    key.includes('created') ||
    key.includes('updated')
  ) {
    const date = dayjs(value);
    if (date.isValid() && typeof value === 'string') {
      return date.format('MMM D, YYYY h:mm A');
    }
  }

  // Image fields
  if (key === 'image' || key === 'thumbnail' || key === 'icon') {
    if (typeof value === 'object' && value?.thumbnail) {
      return (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
          <Image src={value.thumbnail} alt="" fill className="object-cover" />
        </div>
      );
    }
    if (
      typeof value === 'string' &&
      (value.startsWith('http') || value.startsWith('/'))
    ) {
      return (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      );
    }
  }

  // Arrays - special handling for modifier_groups
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty</span>;
    }

    // Helper to extract display name from array item
    const getDisplayName = (item: any): string => {
      if (typeof item === 'string') return item;
      if (typeof item !== 'object' || item === null) return String(item);

      // For modifier_groups array items - look for nested modifier_group.name
      if (item.modifier_group?.name) return item.modifier_group.name;
      // For items with direct name property
      if (item.name) return item.name;
      if (item.title) return item.title;
      // For category items
      if (item.category?.name) return item.category.name;
      // Fallback to ID if no name found
      if (item.id) return `ID: ${String(item.id).slice(0, 8)}...`;
      // Last resort
      return JSON.stringify(item).slice(0, 20);
    };

    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 5).map((item, idx) => (
          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
            {getDisplayName(item)}
          </span>
        ))}
        {value.length > 5 && (
          <span className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
            +{value.length - 5} more
          </span>
        )}
      </div>
    );
  }

  // Objects (nested) - show name if available
  if (typeof value === 'object') {
    if (value.name) {
      return <span className="font-medium">{value.name}</span>;
    }
    if (value.title) {
      return <span className="font-medium">{value.title}</span>;
    }
    // For complex objects, show a compact representation
    const str = JSON.stringify(value);
    if (str.length > 60) {
      return (
        <span className="text-sm text-gray-600">{str.slice(0, 60)}...</span>
      );
    }
    return <span className="text-sm text-gray-600">{str}</span>;
  }

  // Price fields
  if (key.includes('price') || key.includes('Price') || key === 'cost') {
    const num = Number(value);
    if (!isNaN(num)) {
      return (
        <span className="font-semibold text-green-600">${num.toFixed(2)}</span>
      );
    }
  }

  // Default text
  return String(value);
};

const formatKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Fields to exclude from display
const excludedFields = ['__v', 'password', 'token', 'snapshot'];

const ViewDetailsModal = ({ entityType }: ViewDetailsModalProps) => {
  const { t } = useTranslation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  if (!data) {
    return null;
  }

  const entries = Object.entries(data).filter(
    ([key]) => !excludedFields.includes(key) && !key.startsWith('_'),
  );

  // Prioritize important fields first
  const priorityFields = [
    'id',
    'name',
    'title',
    'description',
    'image',
    'price',
    'is_active',
    'is_available',
    'status',
  ];
  const sortedEntries = entries.sort(([a], [b]) => {
    const aIndex = priorityFields.indexOf(a);
    const bIndex = priorityFields.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-heading">
          {t('common:text-view-details')}
        </h2>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        <div className="grid gap-4">
          {sortedEntries.map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0"
            >
              <div className="col-span-1">
                <span className="text-sm font-medium text-gray-500">
                  {formatKey(key)}
                </span>
              </div>
              <div className="col-span-2">{formatValue(key, value, data)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('common:text-close')}
        </button>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
