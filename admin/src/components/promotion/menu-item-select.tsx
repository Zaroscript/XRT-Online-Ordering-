import { useState, useMemo } from 'react';
import { useCategoriesQuery } from '@/data/category';
import { useItemsQuery } from '@/data/item';
import { Popover, Transition, Disclosure } from '@headlessui/react';
import { ChevronDown } from '@/components/icons/chevronDownIcon';
import cn from 'classnames';
import Label from '@/components/ui/label';
import Checkbox from '@/components/ui/checkbox/checkbox';
import Loader from '@/components/ui/loader/loader';

interface MenuItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export default function MenuItemSelect({ value, onChange, label, error, className }: MenuItemSelectProps) {
  const { categories, loading: catLoading } = useCategoriesQuery({ limit: 100 });
  const { items, loading: itemLoading } = useItemsQuery({ limit: 999 });

  const selectedIds = useMemo(() => value ? value.split(',').map(s => s.trim()).filter(Boolean) : [], [value]);

  const handleToggle = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onChange(newSelected.join(','));
  };

  const loading = catLoading || itemLoading;

  return (
    <div className={cn("mb-5", className)}>
      {label && <Label>{label}</Label>}
      
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              type="button"
              className={cn(
                "flex items-center w-full justify-between rounded-md border px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-1 focus:ring-accent",
                open ? "border-accent ring-1 ring-accent" : "border-border-base",
                error ? "border-red-500" : ""
              )}
            >
              <span className="text-body">
                {selectedIds.length > 0 ? `${selectedIds.length} items selected` : "Select items..."}
              </span>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </Popover.Button>

            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
              className="absolute z-10 mt-1 w-full"
            >
              <Popover.Panel static className="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 max-h-[22rem] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center p-8"><Loader text="Loading..." /></div>
                ) : (
                  <div className="py-2">
                    {categories.map((cat) => {
                      const catItems = items.filter(item => item.category_id === cat.id);
                      if (catItems.length === 0) return null;
                      
                      return (
                        <Disclosure key={cat.id} defaultOpen>
                          {({ open }) => (
                            <div className="border-b border-gray-100 last:border-0">
                              <Disclosure.Button type="button" className="flex w-full justify-between items-center bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-heading hover:bg-gray-100">
                                <span>{cat.name}</span>
                                <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", open ? "rotate-180" : "")} />
                              </Disclosure.Button>
                              <Disclosure.Panel className="px-4 py-3 bg-white">
                                <div className="space-y-3">
                                  {catItems.map((item) => (
                                    <div key={item.id} className="flex items-center">
                                      <Checkbox
                                        name={`item-${item.id}`}
                                        id={`item-${item.id}`}
                                        label={item.name}
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleToggle(item.id)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </Disclosure.Panel>
                            </div>
                          )}
                        </Disclosure>
                      );
                    })}
                  </div>
                )}
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
