import { useTranslation } from 'next-i18next';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ClipboardIcon } from '@/components/icons/clipboard';
import { CheckMarkCircle } from '@/components/icons/checkmark-circle';
import { EditIcon } from '@/components/icons/edit';
import { StarIcon } from '@/components/icons/star-icon';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import { useItemQuery } from '@/data/item';
import { useItemSizesQuery } from '@/data/item-size';

type ViewDetailsModalProps = {
  entityType?: 'category' | 'item' | 'modifier-group' | 'modifier';
};

// Kitchen section id -> display name (for category view)
const KITCHEN_SECTION_NAMES: Record<string, string> = {
  KS_001: 'Appetizers',
  KS_002: 'Main Course',
  KS_003: 'Desserts',
  KS_004: 'Beverages',
};

const getKitchenSectionName = (id: string): string =>
  KITCHEN_SECTION_NAMES[id] ?? id;

/** Generate a short display id from the real id (deterministic, does not expose real id) */
const generateShortId = (realId: string, length = 8): string => {
  if (typeof realId !== 'string' || realId.length === 0) return String(realId);
  const base36 = '0123456789abcdefghijklmnopqrstuvwxyz';
  let hash = 0;
  for (let i = 0; i < realId.length; i++) {
    const c = realId.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash |= 0;
  }
  const abs = Math.abs(hash);
  let short = '';
  let n = abs;
  for (let i = 0; i < length; i++) {
    short = base36[n % 36] + short;
    n = Math.floor(n / 36);
  }
  return short;
};

const isCategoryData = (data: any): boolean =>
  Boolean(data && 'kitchen_section_id' in data && !('category_id' in data));

const formatKey = (key: string): string => {
  if (key === 'quantity_levels') return 'Quantity Pricing Matrix (Δ)';
  if (key === 'prices_by_size') return 'Base Size Pricing (Δ)';
  if (key === 'modifier_group') return 'Parent Modifier Group';
  if (key === 'modifiers') return 'Modifiers in Group';
  if (key === 'modifier_assignment') return 'Default Modifiers';

  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`group flex items-center gap-1.5 text-xs font-medium transition-colors focus:outline-none ${
        copied ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
      }`}
      title="Copy ID"
    >
      {label && <span>{label}</span>}
      {copied ? (
        <CheckMarkCircle className="w-3.5 h-3.5" />
      ) : (
        <ClipboardIcon className="w-3.5 h-3.5" />
      )}
    </button>
  );
};

// Fields to exclude from display
const excludedFields = [
  '__v',
  'password',
  'token',
  'snapshot',
  'deleted_at',
  'business_id',
];

// Extra exclusions for category view modal
const categoryExcludedFields = [
  'translated_languages',
  'icon_public_id',
  'image_public_id',
  'kitchen_section_id',
];

const itemExcludedFields = ['category_id', 'image_public_id'];

const modifierExcludedFields = ['modifier_group_id'];

const ViewDetailsModal = ({ entityType }: ViewDetailsModalProps) => {
  const { t } = useTranslation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const router = useRouter();
  const { locale } = router;

  // FETCH GLOBAL SIZES for lookup
  const { sizes: globalSizes } = useItemSizesQuery(undefined, {
    enabled: true, // Always fetch to ensure we can resolve IDs
  });

  if (!data) {
    return null;
  }

  const isCategory = isCategoryData(data);
  // Simple check for item: has base_price/price and category/category_id
  const isItem = Boolean(
    data &&
    ('base_price' in data || 'price' in data) &&
    ('category_id' in data || 'category' in data),
  );
  const isModifierGroup = Boolean(
    data && 'min_select' in data && 'max_select' in data,
  );
  const isModifier = Boolean(
    data && 'modifier_group_id' in data && !isModifierGroup,
  );

  const { item: fetchedItem, isLoading: loadingItem } = useItemQuery(
    { id: data?.id, language: locale! },
    {
      enabled: isItem && Boolean(data?.id),
      staleTime: 0, // Always check for fresh data
    },
  );

  // Use fetched item if available, otherwise fall back to modal data
  let displayData = isItem && fetchedItem ? fetchedItem : data;

  // Synthesize modifier_assignment if missing but modifier_groups exist (for Default Modifiers display)
  if (
    isItem &&
    displayData &&
    displayData.modifier_groups &&
    !displayData.modifier_assignment
  ) {
    const defaultModifiers: string[] = [];
    displayData.modifier_groups.forEach((mg: any) => {
      if (mg.modifier_overrides) {
        mg.modifier_overrides.forEach((mo: any) => {
          if (mo.is_default) {
            const modId =
              typeof mo.modifier_id === 'object'
                ? mo.modifier_id.id || mo.modifier_id._id
                : mo.modifier_id;
            defaultModifiers.push(modId);
          }
        });
      }
    });

    if (defaultModifiers.length > 0) {
      displayData = {
        ...displayData,
        modifier_assignment: {
          default_modifiers: defaultModifiers,
        },
      };
    }
  }

  const excluded = [
    ...excludedFields,
    ...(isCategory ? categoryExcludedFields : []),
    ...(isItem ? itemExcludedFields : []),
    ...(isModifier ? modifierExcludedFields : []),
    'quantity_levels', // Exclude from basic info grid
  ];

  const entries = Object.entries(displayData).filter(
    ([key]) =>
      !excluded.includes(key) &&
      !key.startsWith('_') &&
      key !== 'id' &&
      key !== 'name' &&
      key !== 'title' &&
      key !== 'description' &&
      key !== 'image' &&
      key !== 'thumbnail' &&
      key !== 'icon' &&
      key !== 'price' &&
      key !== 'base_price' &&
      key !== 'is_active' &&
      key !== 'is_available' &&
      !key.includes('public_id'),
  );

  // Sorting
  const priorityFields = [
    'status',
    'modifier_groups',
    'modifier_assignment',
    'sizes',
    'quantity_levels',
    'prices_by_size',
  ];
  const sortedEntries = entries.sort(([a], [b]) => {
    const aIndex = priorityFields.indexOf(a);
    const bIndex = priorityFields.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  // Hero Data
  const displayName = displayData.name ?? displayData.title;
  const displayDescription = displayData.description;
  const getRepresentativePrice = () => {
    if (isItem) return displayData.base_price ?? displayData.price;
    if (isModifier || isModifierGroup) {
      // Look at the default quantity level price first
      const defaultLevel = displayData.quantity_levels?.find(
        (ql: any) => ql.is_default,
      );
      if (defaultLevel?.price !== undefined) return defaultLevel.price;

      // Fallback to first quantity level
      if (displayData.quantity_levels?.[0]?.price !== undefined)
        return displayData.quantity_levels[0].price;

      // Fallback to standalone price if exists
      return displayData.price ?? null;
    }
    return displayData.price ?? null;
  };

  const displayPrice = getRepresentativePrice();

  const mainImage =
    displayData.image?.thumbnail ?? displayData.image ?? displayData.thumbnail;
  const mainImageSrc =
    typeof mainImage === 'string' ? mainImage : mainImage?.thumbnail;

  const isActive = displayData.is_active;
  const isAvailable = displayData.is_available; // Might only exist on items

  const editUrl = isCategory
    ? Routes.category.edit(displayData.id, locale!)
    : isItem
      ? Routes.item.edit(displayData.id ?? displayData.slug, locale!)
      : isModifierGroup
        ? Routes.modifierGroup.edit(displayData.id, locale!)
        : isModifier
          ? Routes.modifier.edit(displayData.id, locale!)
          : null;

  const getModifierName = (modId: string) => {
    if (
      displayData.modifier_groups &&
      Array.isArray(displayData.modifier_groups)
    ) {
      for (const groupAssignment of displayData.modifier_groups) {
        const group = groupAssignment.modifier_group || groupAssignment;
        if (group) {
          let modifiers = groupAssignment.modifiers;
          if (!modifiers && group.modifiers) modifiers = group.modifiers;
          if (
            !modifiers &&
            group.modifier_group_id &&
            typeof group.modifier_group_id === 'object'
          ) {
            modifiers = group.modifier_group_id.modifiers;
          }
          if (modifiers && Array.isArray(modifiers)) {
            const modifier = modifiers.find(
              (m: any) => m.id === modId || m._id === modId,
            );
            if (modifier) return modifier.name;
          }
        }
      }
    }
    return null;
  };

  const getSizeLabel = (sizeId: string, fallbackCode?: string) => {
    if (fallbackCode) return fallbackCode;
    if (displayData.sizes && Array.isArray(displayData.sizes)) {
      const match = displayData.sizes.find(
        (s: any) => s.size_id === sizeId || s._id === sizeId || s.id === sizeId,
      );
      if (match) return match.code || match.name || match.title;
    }
    if (globalSizes && Array.isArray(globalSizes)) {
      const match = globalSizes.find(
        (s: any) => s.id === sizeId || s._id === sizeId,
      );
      if (match) return match.code || match.name || match.title;
    }
    if (!sizeId) return 'N/A';
    if (sizeId.length <= 12 && !/^[0-9a-fA-F]{24}$/.test(sizeId)) return sizeId;
    return generateShortId(sizeId, 4);
  };

  const renderValue = (key: string, value: any) => {
    if (value === null || value === undefined)
      return <span className="text-gray-300 italic">N/A</span>;

    if (typeof value === 'boolean') {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
            value
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (key === 'kitchen_section_id' && typeof value === 'string') {
      return (
        <span className="font-semibold text-heading">
          {getKitchenSectionName(value)}
        </span>
      );
    }

    if (key === 'modifier_group_id' && displayData?.modifier_group?.name) {
      return (
        <span className="font-semibold text-heading">
          {displayData.modifier_group.name}
        </span>
      );
    }

    if (key === 'modifier_group' && typeof value === 'object' && value?.name) {
      return <span className="font-semibold text-heading">{value.name}</span>;
    }

    if (key === 'modifier_assignment' && typeof value === 'object') {
      const defaultModifiers = value?.default_modifiers;
      if (
        !defaultModifiers ||
        !Array.isArray(defaultModifiers) ||
        defaultModifiers.length === 0
      ) {
        return <span className="text-gray-300 italic">None</span>;
      }

      return (
        <div className="flex flex-wrap gap-2">
          {defaultModifiers.map((modId: string, idx: number) => {
            const name = getModifierName(modId);
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-[11px] font-semibold border border-gray-200 transition-all hover:border-accent/30 hover:bg-white shadow-sm"
              >
                <span>{name || modId}</span>
                {!name && (
                  <span className="text-[9px] text-red-400 bg-red-50 px-1 rounded ml-1">
                    ?
                  </span>
                )}
              </span>
            );
          })}
        </div>
      );
    }

    if (
      key.includes('_at') ||
      key.includes('date') ||
      key.includes('created') ||
      key.includes('updated')
    ) {
      const date = dayjs(value);
      if (date.isValid())
        return (
          <span className="font-medium text-heading">
            {date.format('MMM D, YYYY')}
          </span>
        );
    }
    if (key === 'quantity_levels') return null; // Handled in full-width section below

    if (key === 'prices_by_size' && Array.isArray(value)) {
      if (value.length === 0) return null;

      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((pb: any, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center bg-emerald-50/30 rounded-lg border border-emerald-100/50 p-2.5 min-w-[80px] hover:bg-emerald-50 transition-colors"
            >
              <span className="text-[10px] font-bold text-emerald-700/60 uppercase mb-1 tracking-tight">
                {getSizeLabel(
                  pb.size_id,
                  pb.sizeCode || pb.code || pb.size_code,
                )}
              </span>
              <span className="text-sm font-black text-emerald-600">
                +${Number(pb.priceDelta || 0).toFixed(2)}
              </span>
              <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  Δ Price
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-gray-400 italic">Empty</span>;

      // Helper to extract display name from array item
      const getDisplayName = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item !== 'object' || item === null) return String(item);

        // For modifier_groups array items - look for nested modifier_group.name
        // This matches the ItemRepository population logic
        if (item.modifier_group?.name) return item.modifier_group.name;

        if (item.name) return item.name;
        if (item.title) return item.title;
        if (item.category?.name) return item.category.name;
        // Fallback
        return JSON.stringify(item).slice(0, 15) + '...';
      };

      return (
        <div className="flex flex-wrap gap-2">
          {value.slice(0, 12).map((item, idx) => {
            const name = getDisplayName(item);

            return (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-[11px] font-semibold border border-gray-200 transition-all hover:border-accent/30 hover:bg-white shadow-sm"
              >
                <span>{name}</span>
              </span>
            );
          })}
          {value.length > 12 && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 text-[11px] font-bold border border-gray-100 italic">
              +{value.length - 12} more
            </span>
          )}
        </div>
      );
    }

    if (key === 'sides_config' && typeof value === 'object') {
      const { enabled, allowed_sides } = value;
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Status:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                enabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {enabled && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Active Sides:
              </span>
              <div className="flex flex-wrap gap-1">
                {allowed_sides?.map((side: string) => (
                  <span
                    key={side}
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100"
                  >
                    {side}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      if (value.name)
        return <span className="font-semibold text-heading">{value.name}</span>;
      return (
        <code className="text-xs bg-gray-50 p-1 rounded">
          {JSON.stringify(value).slice(0, 50)}
        </code>
      );
    }

    if (key === 'sizes' && Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-gray-400 italic">Empty</span>;

      return (
        <div className="flex flex-wrap gap-2">
          {value.map((size: any, idx: number) => {
            const sizeLabel =
              size.code || size.name || generateShortId(size.size_id || '', 4);
            const price = Number(size.price || 0).toFixed(2);
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm ${
                  size.is_default
                    ? 'bg-accent/5 border-accent/20'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">
                    {sizeLabel}
                  </span>
                  {size.is_default && (
                    <span className="text-[9px] text-accent font-bold uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <span className="text-sm font-bold text-emerald-600">
                  ${price}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    return <span className="font-semibold text-heading">{String(value)}</span>;
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl ring-1 ring-black/5 flex flex-col h-auto">
      {/* 2-Column Grid */}
      <div className="flex flex-col md:grid md:grid-cols-2 flex-1 min-h-0">
        {/* Left Column: Media */}
        <div className="relative w-full h-64 md:h-full bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 flex items-center justify-center p-8">
          {mainImageSrc ? (
            <div className="relative w-full h-full max-h-[400px] aspect-square rounded-2xl overflow-hidden shadow-lg border border-white bg-white">
              <Image
                src={mainImageSrc}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full max-h-[400px] aspect-square rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16 mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {isCategory
                      ? 'Category'
                      : isItem
                        ? 'Product'
                        : isModifierGroup
                          ? 'Modifier Group'
                          : isModifier
                            ? 'Modifier'
                            : 'Entity'}
                  </span>
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
                    <span className="text-xs font-mono text-gray-400">
                      ID: {generateShortId(displayData.id)}
                    </span>
                    <CopyButton text={displayData.id} />
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-heading mt-2 tracking-tight leading-tight">
                {displayName}
              </h3>

              {displayDescription && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {displayDescription}
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3 mt-6">
              {typeof isActive !== 'undefined' && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </div>
              )}
              {typeof isAvailable !== 'undefined' && (
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${isAvailable ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}
                >
                  {isAvailable ? 'Available' : 'Unavailable'}
                </div>
              )}
            </div>
          </div>

          {/* Data Grid */}
          <div className="p-8 space-y-6">
            {sortedEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {formatKey(key)}
                </span>
                <div className="text-sm">{renderValue(key, value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW SECTION: Quantity Pricing Matrix (Full Width) */}
      {(isModifierGroup || isModifier) &&
        displayData.quantity_levels?.length > 0 && (
          <div className="px-8 py-8 bg-gray-50/30 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-heading tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent rounded-full" />
                Quantity Pricing Matrix (Δ)
              </h4>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                Delta values relative to item base price
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
              <table className="min-w-full divide-y divide-gray-200 text-left border-collapse">
                <thead className="bg-gray-50/70 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                      Qty
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
                      Level Name
                    </th>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right border-b border-gray-200">
                      Base Δ
                    </th>

                    {/* Dynamic Size Columns */}
                    {(() => {
                      const allSizeIds = Array.from(
                        new Set(
                          displayData.quantity_levels.flatMap(
                            (l: any) =>
                              l.prices_by_size?.map((ps: any) => ps.size_id) ||
                              [],
                          ),
                        ),
                      ).filter(Boolean);

                      return allSizeIds.map((sizeId) => (
                        <th
                          key={sizeId as string}
                          className="px-4 py-4 text-[10px] font-bold text-accent uppercase tracking-widest text-right border-b border-gray-200 bg-accent/[2%]"
                        >
                          {getSizeLabel(sizeId as string)} Δ
                        </th>
                      ));
                    })()}

                    <th className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-b border-gray-200">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic-none">
                  {displayData.quantity_levels.map(
                    (level: any, idx: number) => {
                      const allSizeIds = Array.from(
                        new Set(
                          displayData.quantity_levels.flatMap(
                            (l: any) =>
                              l.prices_by_size?.map((ps: any) => ps.size_id) ||
                              [],
                          ),
                        ),
                      ).filter(Boolean);

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors hover:bg-gray-50/50 ${
                            level.is_default
                              ? 'bg-accent/[4%] shadow-[inset_4px_0_0_0_#009f7f]'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-heading font-mono bg-gray-100 px-2 py-1 rounded">
                                {level.quantity}
                              </span>
                              {level.is_default && (
                                <StarIcon className="w-3.5 h-3.5 text-accent" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs font-medium text-heading">
                              {level.name || (
                                <span className="text-gray-300 italic text-[10px]">
                                  Normal No Label
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <span
                              className={`text-sm font-bold font-mono ${
                                Number(level.price) >= 0
                                  ? 'text-emerald-600'
                                  : 'text-red-500'
                              }`}
                            >
                              {Number(level.price) >= 0 ? '+' : ''}$
                              {Number(level.price || 0).toFixed(2)}
                            </span>
                          </td>

                          {/* Size Delta Data */}
                          {allSizeIds.map((sizeId) => {
                            const sizePrice = level.prices_by_size?.find(
                              (ps: any) => ps.size_id === sizeId,
                            );
                            return (
                              <td
                                key={sizeId as string}
                                className="px-4 py-4 text-right whitespace-nowrap bg-accent/[1%]"
                              >
                                {sizePrice ? (
                                  <span
                                    className={`text-sm font-bold font-mono ${
                                      Number(sizePrice.priceDelta) >= 0
                                        ? 'text-emerald-600'
                                        : 'text-red-500'
                                    }`}
                                  >
                                    {Number(sizePrice.priceDelta) >= 0
                                      ? '+'
                                      : ''}
                                    $
                                    {Number(sizePrice.priceDelta || 0).toFixed(
                                      2,
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-200 font-mono text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center">
                              <div
                                className={`w-2 h-2 rounded-full ring-4 ${
                                  level.is_active
                                    ? 'bg-emerald-500 ring-emerald-500/10'
                                    : 'bg-gray-300 ring-gray-100'
                                }`}
                                title={level.is_active ? 'Active' : 'Inactive'}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
        <button
          onClick={closeModal}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          Close
        </button>

        {editUrl && (
          <Link
            href={editUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            onClick={closeModal} // Close modal when navigating
          >
            <EditIcon className="w-4 h-4" />
            <span>
              Edit{' '}
              {isCategory
                ? 'Category'
                : isItem
                  ? 'Item'
                  : isModifierGroup
                    ? 'Modifier Group'
                    : isModifier
                      ? 'Modifier'
                      : 'Entity'}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ViewDetailsModal;
