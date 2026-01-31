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
    filename: string = 'import.csv'
  ): {
    errors: ImportValidationError[];
    warnings: ImportValidationWarning[];
  } {
    const errors: ImportValidationError[] = [];
    const warnings: ImportValidationWarning[] = [];

    // Validate Categories
    if (data.categories) {
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
            message: 'name is required',
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
              message: `Duplicate category name: ${cat.name}`,
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
            message: `business_id mismatch. Using session business_id: ${business_id}`,
            value: cat.business_id,
          });
        }
      });
    }

    // Validate Items
    const itemKeys = new Set<string>();
    data.items.forEach((item, index) => {
      const row = index + 2; // +2 because CSV has header and is 1-indexed

      // item_key must be unique
      if (!item.item_key) {
        errors.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'item_key',
          message: 'item_key is required',
          value: item.item_key,
        });
      } else if (itemKeys.has(item.item_key)) {
        errors.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'item_key',
          message: `Duplicate item_key: ${item.item_key}`,
          value: item.item_key,
        });
      } else {
        itemKeys.add(item.item_key);
      }

      // name is required
      if (!item.name || item.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'name',
          message: 'name is required',
          value: item.name,
        });
      }

      // Business rule: if is_sizeable = false → base_price is required
      if (!item.is_sizeable) {
        if (item.base_price === undefined || item.base_price === null) {
          errors.push({
            file: filename,
            row,
            entity: 'Item',
            field: 'base_price',
            message: 'base_price is required when is_sizeable is false',
            value: item.base_price,
          });
        }
      } else {
        // if is_sizeable = true → at least one Item Size is required
        const itemSizes = data.itemSizes.filter((s) => s.item_key === item.item_key);
        if (itemSizes.length === 0) {
          errors.push({
            file: filename,
            row,
            entity: 'Item',
            field: 'is_sizeable',
            message: `Item with is_sizeable=true must have at least one ItemSize. Found 0 sizes for item_key: ${item.item_key}`,
            value: item.is_sizeable,
          });
        }

        // default_size_code must exist when sizable
        if (item.default_size_code) {
          const defaultSize = itemSizes.find((s) => s.size_code === item.default_size_code);
          if (!defaultSize) {
            errors.push({
              file: filename,
              row,
              entity: 'Item',
              field: 'default_size_code',
              message: `default_size_code '${item.default_size_code}' does not exist in ItemSizes for item_key: ${item.item_key}`,
              value: item.default_size_code,
            });
          }
        }
      }

      // business_id validation
      if (item.business_id && item.business_id !== business_id) {
        warnings.push({
          file: filename,
          row,
          entity: 'Item',
          field: 'business_id',
          message: `business_id mismatch. Using session business_id: ${business_id}`,
          value: item.business_id,
        });
      }
    });

    // Validate Item Sizes
    const sizeKeys = new Map<string, Set<string>>(); // item_key -> Set<size_code>
    const defaultSizes = new Map<string, number>(); // item_key -> count of default sizes

    data.itemSizes.forEach((size, index) => {
      const row = index + 2;

      if (!size.item_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'item_key',
          message: 'item_key is required',
          value: size.item_key,
        });
        return;
      }

      if (!size.size_code) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'size_code',
          message: 'size_code is required',
          value: size.size_code,
        });
        return;
      }

      // size_code unique per item
      if (!sizeKeys.has(size.item_key)) {
        sizeKeys.set(size.item_key, new Set());
      }
      const itemSizeCodes = sizeKeys.get(size.item_key)!;
      if (itemSizeCodes.has(size.size_code)) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'size_code',
          message: `Duplicate size_code '${size.size_code}' for item_key: ${size.item_key}`,
          value: size.size_code,
        });
      } else {
        itemSizeCodes.add(size.size_code);
      }

      // price > 0
      if (!size.price || size.price <= 0) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'price',
          message: 'price must be greater than 0',
          value: size.price,
        });
      }

      // name required
      if (!size.name || size.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'ItemSize',
          field: 'name',
          message: 'name is required',
          value: size.name,
        });
      }

      // Track default sizes
      if (size.is_default) {
        const count = defaultSizes.get(size.item_key) || 0;
        defaultSizes.set(size.item_key, count + 1);
      }
    });

    // Validate exactly ONE default size per item
    defaultSizes.forEach((count, item_key) => {
      if (count === 0) {
        const itemSizes = data.itemSizes.filter((s) => s.item_key === item_key);
        if (itemSizes.length > 0) {
          warnings.push({
            file: filename,
            row: 0, // General warning
            entity: 'ItemSize',
            field: 'is_default',
            message: `No default size set for item_key: ${item_key}. First size will be used as default.`,
            value: item_key,
          });
        }
      } else if (count > 1) {
        errors.push({
          file: filename,
          row: 0,
          entity: 'ItemSize',
          field: 'is_default',
          message: `Multiple default sizes found for item_key: ${item_key}. Exactly one default size is required.`,
          value: item_key,
        });
      }
    });

    // Validate Modifier Groups
    const groupKeys = new Set<string>();
    data.modifierGroups.forEach((group, index) => {
      const row = index + 2;

      // group_key unique
      if (!group.group_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'group_key',
          message: 'group_key is required',
          value: group.group_key,
        });
      } else if (groupKeys.has(group.group_key)) {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'group_key',
          message: `Duplicate group_key: ${group.group_key}`,
          value: group.group_key,
        });
      } else {
        groupKeys.add(group.group_key);
      }

      // name required
      if (!group.name || group.name.trim() === '') {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'name',
          message: 'name is required',
          value: group.name,
        });
      }

      // min_select ≤ max_select
      if (group.min_select > group.max_select) {
        errors.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'min_select',
          message: `min_select (${group.min_select}) must be less than or equal to max_select (${group.max_select})`,
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
          message: `display_type must be 'RADIO' or 'CHECKBOX'`,
          value: group.display_type,
        });
      }

      // max_select ≤ modifiers count (validate after modifiers are processed)
      const groupModifiers = data.modifiers.filter((m) => m.group_key === group.group_key);
      if (group.max_select > groupModifiers.length) {
        warnings.push({
          file: filename,
          row,
          entity: 'ModifierGroup',
          field: 'max_select',
          message: `max_select (${group.max_select}) is greater than number of modifiers (${groupModifiers.length})`,
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
          message: `business_id mismatch. Using session business_id: ${business_id}`,
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
          message: 'group_key is required',
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
            message: `Duplicate modifier_key '${modifier.modifier_key}' in group_key: ${modifier.group_key}`,
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
          message: 'name is required',
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
          message: 'max_quantity must be greater than or equal to 1',
          value: modifier.max_quantity,
        });
      }

      // Validate group exists
      const groupExists = data.modifierGroups.some((g) => g.group_key === modifier.group_key);
      if (!groupExists) {
        errors.push({
          file: filename,
          row,
          entity: 'Modifier',
          field: 'group_key',
          message: `ModifierGroup with group_key '${modifier.group_key}' not found`,
          value: modifier.group_key,
        });
      }
    });

    // Validate Item Modifier Overrides
    data.itemModifierOverrides.forEach((override, index) => {
      const row = index + 2;

      if (!override.item_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemModifierOverride',
          field: 'item_key',
          message: 'item_key is required',
          value: override.item_key,
        });
      } else {
        // Validate item exists
        const itemExists = data.items.some((i) => i.item_key === override.item_key);
        if (!itemExists) {
          errors.push({
            file: filename,
            row,
            entity: 'ItemModifierOverride',
            field: 'item_key',
            message: `Item with item_key '${override.item_key}' not found`,
            value: override.item_key,
          });
        }
      }

      if (!override.group_key) {
        errors.push({
          file: filename,
          row,
          entity: 'ItemModifierOverride',
          field: 'group_key',
          message: 'group_key is required',
          value: override.group_key,
        });
      } else {
        // Validate group exists
        const groupExists = data.modifierGroups.some((g) => g.group_key === override.group_key);
        if (!groupExists) {
          errors.push({
            file: filename,
            row,
            entity: 'ItemModifierOverride',
            field: 'group_key',
            message: `ModifierGroup with group_key '${override.group_key}' not found`,
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
          message: 'modifier_key is required',
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
            message: `Modifier with modifier_key '${override.modifier_key}' not found in group_key: ${override.group_key}`,
            value: override.modifier_key,
          });
        }
      }

      // Validate size_code exists for item (if prices_by_size provided)
      if (override.prices_by_size && override.prices_by_size.length > 0) {
        const itemSizes = data.itemSizes.filter((s) => s.item_key === override.item_key);
        const itemSizeCodes = new Set(itemSizes.map((s) => s.size_code));

        override.prices_by_size.forEach((priceOverride) => {
          if (!itemSizeCodes.has(priceOverride.sizeCode)) {
            errors.push({
              file: filename,
              row,
              entity: 'ItemModifierOverride',
              field: 'prices_by_size',
              message: `sizeCode '${priceOverride.sizeCode}' does not exist in ItemSizes for item_key: ${override.item_key}`,
              value: priceOverride.sizeCode,
            });
          }
        });
      }
    });

    return { errors, warnings };
  }
}
