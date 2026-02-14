import {
  ParsedImportData,
  ImportValidationError,
  ImportValidationWarning,
} from '../../domain/entities/ImportSession';

export class ImportValidationService {
  /**
   * Validate all parsed data and return errors and warnings
   */
  static validate(
    data: ParsedImportData,
    business_id: string,
    filename: string = 'import.csv',
    existingKitchenSectionNames?: Set<string>
  ): {
    errors: ImportValidationError[];
    warnings: ImportValidationWarning[];
  } {
    const errors: ImportValidationError[] = [];
    const warnings: ImportValidationWarning[] = [];

    // Normalize to avoid "Cannot read property 'forEach' of undefined" when saving draft with partial data
    const safe: ParsedImportData = {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      items: Array.isArray(data?.items) ? data.items : [],
      itemSizes: Array.isArray(data?.itemSizes) ? data.itemSizes : [],
      modifierGroups: Array.isArray(data?.modifierGroups) ? data.modifierGroups : [],
      modifiers: Array.isArray(data?.modifiers) ? data.modifiers : [],
      itemModifierOverrides: Array.isArray(data?.itemModifierOverrides) ? data.itemModifierOverrides : [],
    };
    data = safe;

    // Validate Categories
    if (data.categories && data.categories.length > 0) {
      const categoryNames = new Set<string>();
      data.categories.forEach((cat, index) => {
        const row = index + 2;

        // name is required
        if (!cat.name || cat.name.trim() === '') {
          errors.push({
            file: filename,
            row,
            entity: 'Category',
            field: 'name',
            message: 'Name required',
            value: cat.name,
          });
        } else {
          const lowerName = cat.name.toLowerCase().trim();
          if (categoryNames.has(lowerName)) {
            errors.push({
              file: filename,
              row,
              entity: 'Category',
              field: 'name',
              message: 'Duplicate name',
              value: cat.name,
            });
          } else {
            categoryNames.add(lowerName);
          }
        }

        // business_id validation
        if (cat.business_id && cat.business_id !== business_id) {
          warnings.push({
            file: filename,
            row,
            entity: 'Category',
            field: 'business_id',
            message: 'Using current business',
            value: cat.business_id,
          });
        }
      });
    }

    // Helper: composite key for item (name + category_name)
    const itemCompositeKey = (name: string, categoryName?: string) =>
      `${(name || '').trim()}|${(categoryName || '').trim()}`;

    // Validate Items (unique by name + category_name)
    const itemKeys = new Set<string>();
    data.items.forEach((item, index) => {
      const row = index + 2; // +2 because CSV has header and is 1-indexed

      // name is required
      if (!item.name || item.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'name',
          message: 'Name required',
          value: item.name,
        });
      } else {
        const key = itemCompositeKey(item.name, item.category_name);
        if (itemKeys.has(key)) {
          errors.push({
            file: filename,
            row,
            entity: 'Item',
            field: 'name',
            message: 'Duplicate name in same category',
            value: item.name,
          });
        } else {
          itemKeys.add(key);
        }
      }

      // Basics-only: skip pricing/sizing validation. base_price defaults to 0, is_sizeable to false.

      // business_id validation
      if (item.business_id && item.business_id !== business_id) {
        warnings.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'business_id',
          message: 'Using current business',
          value: item.business_id,
        });
      }
    });

    // Validate Item Sizes (global sizes: size_code, name, display_order, is_active only)
    const sizeCodes = new Set<string>();

    data.itemSizes.forEach((size, index) => {
      const row = index + 2;

      if (!size.size_code) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'size_code',
          message: 'Size code required',
          value: size.size_code,
        });
        return;
      }

      if (sizeCodes.has(size.size_code)) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'size_code',
          message: 'Duplicate size code',
          value: size.size_code,
        });
      } else {
        sizeCodes.add(size.size_code);
      }

      if (!size.name || size.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'name',
          message: 'Name required',
          value: size.name,
        });
      }
    });

    // Validate Modifier Groups
    const groupNames = new Set<string>();
    data.modifierGroups.forEach((group, index) => {
      const row = index + 2;

      if (!group.name || group.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'name',
          message: 'Name required',
          value: group.name,
        });
      } else if (groupNames.has(group.name.toLowerCase())) {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'name',
          message: 'Duplicate name',
          value: group.name,
        });
      } else {
        groupNames.add(group.name.toLowerCase());
      }

      // min_select ≤ max_select
      if (group.min_select > group.max_select) {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'min_select',
          message: 'Min must be ≤ max',
          value: group.min_select,
        });
      }

      // valid display_type
      if (group.display_type !== 'RADIO' && group.display_type !== 'CHECKBOX') {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'display_type',
          message: 'Use RADIO or CHECKBOX',
          value: group.display_type,
        });
      }

      // max_select ≤ modifiers count (validate after modifiers are processed)
      const groupModifiers = data.modifiers.filter((m) => m.group_key === group.name);
      if (group.max_select > groupModifiers.length) {
        warnings.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'max_select',
          message: 'Max select exceeds modifier count',
          value: group.max_select,
        });
      }

      // business_id validation
      if (group.business_id && group.business_id !== business_id) {
        warnings.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'business_id',
          message: 'Using current business',
          value: group.business_id,
        });
      }
    });

    // Validate Modifiers
    const modifierKeys = new Map<string, Set<string>>(); // group_key -> Set<modifier_key>
    data.modifiers.forEach((modifier, index) => {
      const row = index + 2;

      if (!modifier.group_key) {
        errors.push({
          file: filename,
          row,
          entity: 'Modifier',
          field: 'group_key',
          message: 'Group key required',
          value: modifier.group_key,
        });
        return;
      }

      // modifier_key unique per group
      if (!modifierKeys.has(modifier.group_key)) {
        modifierKeys.set(modifier.group_key, new Set());
      }
      const groupModifierKeys = modifierKeys.get(modifier.group_key)!;
      if (modifier.modifier_key) {
        if (groupModifierKeys.has(modifier.modifier_key)) {
          errors.push({
            file: filename,
            row,
            entity: 'Modifier',
            field: 'modifier_key',
            message: 'Duplicate modifier in group',
            value: modifier.modifier_key,
          });
        } else {
          groupModifierKeys.add(modifier.modifier_key);
        }
      }

      // name required
      if (!modifier.name || modifier.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'Modifier',
          field: 'name',
          message: 'Name required',
          value: modifier.name,
        });
      }

      // max_quantity ≥ 1
      if (modifier.max_quantity !== undefined && modifier.max_quantity < 1) {
        errors.push({
          file: filename,
          row,
          entity: 'Modifier',
          field: 'max_quantity',
          message: 'Max quantity at least 1',
          value: modifier.max_quantity,
        });
      }

      // Validate group exists (modifiers reference groups by name via group_key)
      const groupExists = data.modifierGroups.some((g) => g.name === modifier.group_key);
      if (!groupExists) {
        errors.push({
          file: filename,
          row,
          entity: 'Modifier',
          field: 'group_key',
          message: 'Group not found',
          value: modifier.group_key,
        });
      }
    });

    // Validate Item Modifier Overrides
    data.itemModifierOverrides.forEach((override, index) => {
      const row = index + 2;

      if (!override.item_name || override.item_name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'ItemModifierOverride',
          field: 'item_name',
          message: 'Item name required',
          value: override.item_name,
        });
      } else {
        // Validate item exists
        const itemExists = data.items.some(
          (i) =>
            itemCompositeKey(i.name, i.category_name) ===
            itemCompositeKey(override.item_name, override.item_category_name)
        );
        if (!itemExists) {
          errors.push({
            file: filename,
            row,
            entity: 'ItemModifierOverride',
            field: 'item_name',
            message: 'Item not found',
            value: override.item_name,
          });
        }
      }

      if (!override.group_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemModifierOverride',
          field: 'group_key',
          message: 'Group key required',
          value: override.group_key,
        });
      } else {
        // Validate group exists (overrides reference groups by name via group_key)
        const groupExists = data.modifierGroups.some((g) => g.name === override.group_key);
        if (!groupExists) {
          errors.push({
            file: filename,
            row,
            entity: 'ItemModifierOverride',
            field: 'group_key',
            message: 'Group not found',
            value: override.group_key,
          });
        }
      }

      if (!override.modifier_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemModifierOverride',
          field: 'modifier_key',
          message: 'Modifier key required',
          value: override.modifier_key,
        });
      } else {
        // Validate modifier exists and belongs to group
        const modifierExists = data.modifiers.some(
          (m) => m.modifier_key === override.modifier_key && m.group_key === override.group_key
        );
        if (!modifierExists) {
          errors.push({
            file: filename,
            row,
            entity: 'ItemModifierOverride',
            field: 'modifier_key',
            message: 'Modifier not found in group',
            value: override.modifier_key,
          });
        }
      }

      // Validate size_code exists for item (if prices_by_size provided)
      if (override.prices_by_size && override.prices_by_size.length > 0) {
        const itemSizes = data.itemSizes.filter(
          (s) =>
            itemCompositeKey(s.item_name, s.item_category_name) ===
            itemCompositeKey(override.item_name, override.item_category_name)
        );
        const itemSizeCodes = new Set(itemSizes.map((s) => s.size_code));

        override.prices_by_size.forEach((priceOverride) => {
          if (!itemSizeCodes.has(priceOverride.sizeCode)) {
            errors.push({
              file: filename,
              row,
              entity: 'ItemModifierOverride',
              field: 'prices_by_size',
              message: 'Size not found for item',
              value: priceOverride.sizeCode,
            });
          }
        });
      }
    });

    return { errors, warnings };
  }
}
