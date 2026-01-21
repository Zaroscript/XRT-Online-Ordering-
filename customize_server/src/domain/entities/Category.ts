import { ItemModifierGroupAssignment } from './Item';

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  kitchen_section_id?: string;
  sort_order: number;
  is_active: boolean;
  image?: string;
  image_public_id?: string; // Cloudinary public_id for deletion
  icon?: string;
  icon_public_id?: string;
  translated_languages: string[];
  modifier_groups?: ItemModifierGroupAssignment[]; // Using ItemModifierGroupAssignment from Item entity
  created_at: Date;
  updated_at: Date;
}

export interface CreateCategoryDTO {
  business_id: string;
  name: string;
  description?: string;
  kitchen_section_id?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: string;
  image_public_id?: string;
  icon?: string;
  icon_public_id?: string;
  language?: string;
  modifier_groups?: ItemModifierGroupAssignment[];
  apply_modifier_groups_to_items?: boolean;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  kitchen_section_id?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: string;
  image_public_id?: string;
  icon?: string;
  icon_public_id?: string;
  language?: string;
  modifier_groups?: ItemModifierGroupAssignment[];
  apply_modifier_groups_to_items?: boolean;
}

export interface CategoryFilters {
  business_id?: string; // Optional for super admins to get all categories
  is_active?: boolean;
  kitchen_section_id?: string;
}
