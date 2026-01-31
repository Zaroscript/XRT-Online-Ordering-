import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import {
  ParsedImportData,
  ParsedItemData,
  ParsedItemSizeData,
  ParsedModifierGroupData,
  ParsedModifierData,
  ParsedItemModifierOverrideData,
} from '../../domain/entities/ImportSession';

export class CSVParser {
  /**
   * Parse CSV file or ZIP containing CSV files
   */
  static async parseUpload(
    file: Express.Multer.File
  ): Promise<{ data: ParsedImportData; files: string[] }> {
    const files: string[] = [];
    let parsedData: ParsedImportData = {
      categories: [],
      items: [],
      itemSizes: [],
      modifierGroups: [],
      modifiers: [],
      itemModifierOverrides: [],
    };

    // Check if file is ZIP
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      const zip = new AdmZip(file.buffer);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        if (entry.entryName.endsWith('.csv') && !entry.isDirectory) {
          files.push(entry.entryName);
          const csvContent = entry.getData().toString('utf-8');
          const fileData = this.parseCSVContent(csvContent, entry.entryName);
          parsedData = this.mergeParsedData(parsedData, fileData);
        }
      }
    } else {
      // Single CSV file
      files.push(file.originalname);
      const csvContent = file.buffer.toString('utf-8');
      // Check if it's the new Type-based CSV
      if (this.isTypeBasedCSV(csvContent)) {
        parsedData = this.parseGenericCSV(csvContent, file.originalname);
      } else {
        const fileData = this.parseCSVContent(csvContent, file.originalname);
        parsedData = this.mergeParsedData(parsedData, fileData);
      }
    }

    return { data: parsedData, files };
  }

  /**
   * Parse CSV content and identify entity type by filename or headers
   */
  private static parseCSVContent(content: string, filename: string): ParsedImportData {
    const records: any[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Auto-cast common types
        if (
          context.column === 'price' ||
          context.column === 'base_price' ||
          context.column === 'priceDelta'
        ) {
          return parseFloat(value) || 0;
        }
        if (
          context.column === 'is_sizeable' ||
          context.column === 'is_active' ||
          context.column === 'is_default' ||
          context.column === 'is_available' ||
          context.column === 'is_signature' ||
          context.column === 'is_customizable' ||
          context.column === 'applies_per_quantity'
        ) {
          return value === 'true' || value === '1' || value === 'yes';
        }
        if (
          context.column === 'min_select' ||
          context.column === 'max_select' ||
          context.column === 'max_quantity' ||
          context.column === 'quantity' ||
          context.column === 'display_order' ||
          context.column === 'sort_order' ||
          context.column === 'max_per_order'
        ) {
          return parseInt(value) || 0;
        }
        return value;
      },
    });

    const result: ParsedImportData = {
      categories: [],
      items: [],
      itemSizes: [],
      modifierGroups: [],
      modifiers: [],
      itemModifierOverrides: [],
    };

    // Identify entity type by filename or column presence
    const lowerFilename = filename.toLowerCase();

    for (const record of records) {
      if (
        lowerFilename.includes('item') &&
        !lowerFilename.includes('size') &&
        !lowerFilename.includes('override')
      ) {
        result.items.push(this.parseItem(record));
      } else if (lowerFilename.includes('size') || (record.size_code && record.item_key)) {
        result.itemSizes.push(this.parseItemSize(record));
      } else if (lowerFilename.includes('modifier') && lowerFilename.includes('group')) {
        result.modifierGroups.push(this.parseModifierGroup(record));
      } else if (
        lowerFilename.includes('modifier') &&
        !lowerFilename.includes('group') &&
        !lowerFilename.includes('override')
      ) {
        result.modifiers.push(this.parseModifier(record));
      } else if (
        lowerFilename.includes('override') ||
        (record.item_key && record.group_key && record.modifier_key)
      ) {
        result.itemModifierOverrides.push(this.parseItemModifierOverride(record));
      } else {
        // Try to auto-detect by column presence
        if (record.item_key && record.name && !record.size_code && !record.group_key) {
          result.items.push(this.parseItem(record));
        } else if (record.item_key && record.size_code) {
          result.itemSizes.push(this.parseItemSize(record));
        } else if (record.group_key && record.name && record.display_type) {
          result.modifierGroups.push(this.parseModifierGroup(record));
        } else if (record.group_key && record.modifier_key && record.name) {
          result.modifiers.push(this.parseModifier(record));
        } else if (record.item_key && record.group_key && record.modifier_key) {
          result.itemModifierOverrides.push(this.parseItemModifierOverride(record));
        }
      }
    }

    return result;
  }

  private static isTypeBasedCSV(content: string): boolean {
    const lines = content.split('\n');
    if (lines.length === 0) return false;
    const headers = lines[0].toLowerCase().split(',');
    return headers.includes('type') && headers.includes('name');
  }

  private static parseGenericCSV(content: string, filename: string): ParsedImportData {
    const records: any[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Auto-cast logic (same as before)
        if (
          ['price', 'base_price', 'priceDelta', 'value', 'cost'].includes(context.column as string)
        ) {
          return parseFloat(value) || 0;
        }
        if (
          [
            'is_active',
            'active',
            'is_sizeable',
            'is_customizable',
            'is_available',
            'available',
          ].includes(context.column as string)
        ) {
          return value === 'true' || value === '1' || value === 'yes';
        }
        if (
          [
            'sort_order',
            'display_order',
            'min_select',
            'max_select',
            'max_quantity',
            'quantity',
          ].includes(context.column as string)
        ) {
          return parseInt(value) || 0;
        }
        return value;
      },
    });

    const result: ParsedImportData = {
      categories: [],
      items: [],
      itemSizes: [],
      modifierGroups: [],
      modifiers: [],
      itemModifierOverrides: [],
    };

    for (const record of records) {
      if (!record.type) continue;

      const type = record.type.toUpperCase().trim();
      const name = record.name;
      const parent = record.parent; // Parent Name

      if (!name) continue;

      if (type === 'CATEGORY') {
        result.categories.push({
          business_id: '',
          name: name,
          description: record.description,
          sort_order: record.sort_order,
          is_active: record.active !== undefined ? record.active : true,
        });
      }

      if (type === 'ITEM') {
        result.items.push({
          item_key: name, // Natural key
          business_id: '',
          name: name,
          description: record.description,
          category_name: parent, // Parent column is Category Name
          base_price: record.price || record.value,
          is_active: record.active !== undefined ? record.active : true,
          // Defaults
          is_sizeable: false,
          sort_order: record.sort_order,
        });
      }

      if (type === 'SIZE') {
        // If Parent is Item Name, it's an Item Size. Global sizes might be tricky.
        // User said: "Type: SIZE... Parent: The Name of the parent entity"
        // If Parent is an Item, it is ItemSize.
        if (parent) {
          result.itemSizes.push({
            item_key: parent,
            size_code: name, // 'S', 'M' etc.
            name: name, // 'Small'
            price: record.price || record.value,
            is_active: record.active !== undefined ? record.active : true,
            is_default: record.is_default,
          });
          // Also mark item as sizeable?
        }
      }

      if (type === 'MOD_GROUP') {
        // Parent is usually Item (if specific) or Global?
        // For now, let's treat them as Global groups, but maybe mapped to Item if Parent is present.
        // Or just import them as Global Groups.
        result.modifierGroups.push({
          group_key: name,
          business_id: '',
          name: name,
          display_type: (record.display_type || 'CHECKBOX').toUpperCase(),
          min_select: record.min_select || 0,
          max_select: record.max_select || 1,
          is_active: record.active !== undefined ? record.active : true,
        });

        // If Parent is present (Item Name), we need to Create an ItemLink (ItemModifierOverride or just Assignment)
        if (parent) {
          // We need to link this group to the item.
          // ParsedImportData has itemModifierOverrides, but also we can imply linkage.
          // But ImportSaveService step 7 links items to groups.
          // I'll add a way to represent this linkage.
          // Maybe via itemModifierOverrides with empty modifier_key?
          // Or better, add a new field to ParsedImportData: itemModifierGroups
        }
      }

      if (type === 'MODIFIER') {
        // Parent is Modifier Group Name
        if (parent) {
          result.modifiers.push({
            group_key: parent,
            modifier_key: name,
            name: name,
            max_quantity: record.max_quantity,
            is_active: record.active !== undefined ? record.active : true,
            display_order: record.sort_order,
            // Price? Modifiers have price overrides usually or base price?
            // The Entity Modifier has prices_by_size (in group) or quantity_levels.
            // If simple price:
            // We might need to handle simple price for modifiers
          });
        }
      }
    }

    return result;
  }
  private static parseItem(record: Record<string, any>): ParsedItemData {
    return {
      item_key: record.item_key || record.itemKey || '',
      business_id: record.business_id || record.businessId || '',
      name: record.name || '',
      description: record.description,
      base_price: record.base_price !== undefined ? parseFloat(record.base_price) : undefined,
      category_id: record.category_id || record.categoryId,
      category_name: record.category_name || record.categoryName,
      is_sizeable:
        record.is_sizeable === true || record.is_sizeable === 'true' || record.is_sizeable === '1',
      is_customizable:
        record.is_customizable !== undefined
          ? record.is_customizable === true || record.is_customizable === 'true'
          : undefined,
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
      is_available:
        record.is_available !== undefined
          ? record.is_available === true || record.is_available === 'true'
          : true,
      is_signature:
        record.is_signature === true ||
        record.is_signature === 'true' ||
        record.is_signature === '1',
      max_per_order: record.max_per_order ? parseInt(record.max_per_order) : undefined,
      sort_order: record.sort_order ? parseInt(record.sort_order) : 0,
      default_size_code: record.default_size_code || record.defaultSizeCode,
    };
  }

  private static parseItemSize(record: Record<string, any>): ParsedItemSizeData {
    return {
      item_key: record.item_key || record.itemKey || '',
      size_code: record.size_code || record.sizeCode || '',
      name: record.name || '',
      price: parseFloat(record.price) || 0,
      display_order: record.display_order ? parseInt(record.display_order) : 0,
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
      is_default:
        record.is_default === true || record.is_default === 'true' || record.is_default === '1',
    };
  }

  private static parseModifierGroup(record: Record<string, any>): ParsedModifierGroupData {
    return {
      group_key: record.group_key || record.groupKey || '',
      business_id: record.business_id || record.businessId || '',
      name: record.name || '',
      display_type: (record.display_type || record.displayType || 'RADIO').toUpperCase() as
        | 'RADIO'
        | 'CHECKBOX',
      min_select: parseInt(record.min_select || record.minSelect || '0'),
      max_select: parseInt(record.max_select || record.maxSelect || '1'),
      applies_per_quantity:
        record.applies_per_quantity === true || record.applies_per_quantity === 'true',
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
      sort_order: record.sort_order ? parseInt(record.sort_order) : 0,
      quantity_levels: record.quantity_levels ? JSON.parse(record.quantity_levels) : undefined,
      prices_by_size: record.prices_by_size ? JSON.parse(record.prices_by_size) : undefined,
    };
  }

  private static parseModifier(record: Record<string, any>): ParsedModifierData {
    return {
      group_key: record.group_key || record.groupKey || '',
      modifier_key: record.modifier_key || record.modifierKey || '',
      name: record.name || '',
      is_default:
        record.is_default === true || record.is_default === 'true' || record.is_default === '1',
      max_quantity: record.max_quantity ? parseInt(record.max_quantity) : undefined,
      display_order: record.display_order ? parseInt(record.display_order) : 0,
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
    };
  }

  private static parseItemModifierOverride(
    record: Record<string, any>
  ): ParsedItemModifierOverrideData {
    return {
      item_key: record.item_key || record.itemKey || '',
      group_key: record.group_key || record.groupKey || '',
      modifier_key: record.modifier_key || record.modifierKey || '',
      max_quantity: record.max_quantity ? parseInt(record.max_quantity) : undefined,
      is_default:
        record.is_default === true || record.is_default === 'true' || record.is_default === '1',
      prices_by_size: record.prices_by_size ? JSON.parse(record.prices_by_size) : undefined,
      quantity_levels: record.quantity_levels ? JSON.parse(record.quantity_levels) : undefined,
    };
  }

  private static mergeParsedData(
    existing: ParsedImportData,
    newData: ParsedImportData
  ): ParsedImportData {
    return {
      categories: [...existing.categories, ...newData.categories],
      items: [...existing.items, ...newData.items],
      itemSizes: [...existing.itemSizes, ...newData.itemSizes],
      modifierGroups: [...existing.modifierGroups, ...newData.modifierGroups],
      modifiers: [...existing.modifiers, ...newData.modifiers],
      itemModifierOverrides: [...existing.itemModifierOverrides, ...newData.itemModifierOverrides],
    };
  }
}
