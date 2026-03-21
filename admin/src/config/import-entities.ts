import {
  FolderIcon,
  CubeIcon,
  AdjustmentsIcon,
  StackIcon,
} from '@/components/icons/import-export-icons';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export const IMPORT_ENTITIES = [
  {
    id: 'categories',
    name: 'Categories',
    description: 'Menu categories and kitchen sections',
    icon: FolderIcon,
    exportEndpoint: API_ENDPOINTS.CATEGORY_EXPORT,
    importEndpoint: API_ENDPOINTS.CATEGORY_IMPORT,
    validationEntityName: 'Category',
    labelKey: 'common:sidebar-nav-item-categories',
    descriptionKey: 'common:import-type-desc-categories',
    template: '/templates/categories-template.csv',
  },
  {
    id: 'items',
    name: 'Items',
    description: 'Menu items and products',
    icon: CubeIcon,
    exportEndpoint: 'items/export',
    importEndpoint: 'items/import',
    validationEntityName: 'Item',
    labelKey: 'common:sidebar-nav-item-menu',
    descriptionKey: 'common:import-type-desc-items',
    template: '/templates/items-template.csv',
  },
  {
    id: 'modifierGroups',
    name: 'Modifier Groups',
    description: 'Modifier groups configuration',
    icon: AdjustmentsIcon,
    exportEndpoint: 'modifier-groups/export',
    importEndpoint: 'modifier-groups/import',
    validationEntityName: 'ModifierGroup',
    labelKey: 'common:sidebar-nav-item-modifiers-management',
    descriptionKey: 'common:import-type-desc-modifier-groups',
    template: '/templates/modifier-groups-template.csv',
  },
  {
    id: 'modifiers',
    name: 'Modifier Items',
    description: 'Individual modifier options (basics only)',
    icon: AdjustmentsIcon,
    exportEndpoint: 'modifiers/export',
    importEndpoint: 'modifiers/import',
    validationEntityName: 'Modifier',
    labelKey: 'common:sidebar-nav-item-modifier-items',
    descriptionKey: 'common:import-type-desc-modifiers',
    template: '/templates/modifiers-template.csv',
  },
  {
    id: 'sizes',
    name: 'Sizes',
    description: 'Item size variations',
    icon: StackIcon,
    exportEndpoint: 'sizes/export',
    importEndpoint: 'sizes/import',
    validationEntityName: 'ItemSize',
    labelKey: 'common:sidebar-nav-item-items-sizes',
    descriptionKey: 'common:import-type-desc-sizes',
    template: '/templates/sizes-template.csv',
  },
] as const;

export type EntityTypeId = (typeof IMPORT_ENTITIES)[number]['id'];
export type ImportEntity = (typeof IMPORT_ENTITIES)[number];
