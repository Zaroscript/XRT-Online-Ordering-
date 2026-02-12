import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';
import {
  ParsedImportData,
  ParsedItemData,
  ParsedItemSizeData,
  ParsedModifierGroupData,
  ParsedModifierData,
  ParsedItemModifierOverrideData,
  ParsedCategoryData,
} from '../../domain/entities/ImportSession';

export class CSVParser {
  /**
   * Parse CSV file or ZIP containing CSV files.
   * @param entityType – When provided, forces all rows to be parsed as that entity
   *                     instead of auto-detecting from filename/headers.
   */
  static async parseUpload(
    file: Express.Multer.File,
    entityType?: 'categories' | 'items' | 'sizes' | 'modifierGroups' | 'modifiers' | null
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

    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new Error(
        'File buffer is missing. Ensure the file is sent as multipart/form-data with field name "file".'
      );
    }

    // Check if file is ZIP
    if (file.mimetype === 'application/zip' || file.originalname?.endsWith('.zip')) {
      try {
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();

        for (const entry of zipEntries) {
          if (entry.entryName.endsWith('.csv') && !entry.isDirectory) {
            files.push(entry.entryName);
            const csvContent = entry.getData().toString('utf-8');
            const fileData = this.parseCSVContent(csvContent, entry.entryName, entityType);
            parsedData = this.mergeParsedData(parsedData, fileData);
          }
        }
      } catch (err: any) {
        const message = err?.message || 'Invalid or corrupt ZIP file.';
        throw new Error(message);
      }
    } else {
      // Single CSV file
      try {
        files.push(file.originalname || 'import.csv');
        const csvContent = file.buffer.toString('utf-8');
        if (this.isTypeBasedCSV(csvContent)) {
          parsedData = this.parseGenericCSV(csvContent, file.originalname || 'import.csv');
        } else {
          const fileData = this.parseCSVContent(
            csvContent,
            file.originalname || 'import.csv',
            entityType
          );
          parsedData = this.mergeParsedData(parsedData, fileData);
        }
      } catch (err: any) {
        const message = err?.message || 'Invalid or corrupt file.';
        throw new Error(message);
      }
    }

    return { data: parsedData, files };
  }

  /**
   * Determine which entity type this file belongs to based on filename.
   * Used to validate and route rows only to the matching data type.
   */
  private static getEntityTypeFromFilename(
    filename: string
  ): 'categories' | 'items' | 'sizes' | 'modifierGroups' | 'modifiers' | null {
    const lower = filename.toLowerCase();
    if (lower.includes('modifier') && lower.includes('group')) return 'modifierGroups';
    if (lower.includes('modifier')) return 'modifiers';
    if (lower.includes('category') || lower.includes('categories')) return 'categories';
    if (lower.includes('size') || lower.includes('sizes')) return 'sizes';
    if (lower.includes('item')) return 'items';
    return null;
  }

  /**
   * Parse CSV content and identify entity type by filename or headers
   */
  private static parseCSVContent(
    content: string,
    filename: string,
    forcedEntityType?: 'categories' | 'items' | 'sizes' | 'modifierGroups' | 'modifiers' | null
  ): ParsedImportData {
    const records: any[] = parse(content, {
      columns: (headers) => headers.map((h: string) => h.toLowerCase().trim()),
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

    // Use explicit entity type if provided, otherwise fall back to filename detection
    const entityFromFilename = forcedEntityType || this.getEntityTypeFromFilename(filename);
    const looksLikeModifierGroup = (r: any) => this.rowLooksLikeModifierGroup(r);
    const looksLikeModifierItem = (r: any) => this.rowLooksLikeModifierItem(r);

    for (const record of records) {
      if (entityFromFilename === 'modifierGroups') {
        const groupKeyVal =
          record.group_key ?? record.groupKey ?? record['group key'] ?? record['Group Key'] ?? '';
        const nameVal = record.name ?? record.Name ?? '';
        const hasGroupKey = !!String(groupKeyVal).trim();
        const hasName = !!String(nameVal).trim();
        // For modifier groups files, if we have a name and it looks like a group (has display_type or min/max_select), accept it
        // Use name as group_key if group_key is not present
        if (
          !looksLikeModifierItem(record) &&
          hasName &&
          (hasGroupKey || looksLikeModifierGroup(record))
        ) {
          // If no group_key, use name as the group_key
          if (!hasGroupKey) {
            record.group_key = nameVal;
          }
          result.modifierGroups.push(this.parseModifierGroup(record));
        }
        continue;
      }
      if (entityFromFilename === 'modifiers') {
        if (looksLikeModifierItem(record)) {
          result.modifiers.push(this.parseModifier(record));
        } else if (looksLikeModifierGroup(record)) {
          result.modifierGroups.push(this.parseModifierGroup(record));
        }
        continue;
      }
      if (entityFromFilename === 'categories') {
        if (record.name && String(record.name).trim()) {
          result.categories.push(this.parseCategory(record));
        }
        continue;
      }
      if (entityFromFilename === 'sizes') {
        const hasSizeCode = !!(
          record.size_code ??
          record.sizeCode ??
          record.code ??
          record.name ??
          ''
        )
          .toString()
          .trim();
        if (hasSizeCode) {
          result.itemSizes.push(this.parseItemSize(record));
        }
        continue;
      }
      if (entityFromFilename === 'items') {
        if (record.name && String(record.name).trim()) {
          result.items.push(this.parseItem(record));
        }
        continue;
      }

      // No entity from filename: auto-detect by column presence
      // Priority 1: Sizes (Check code/size_code first as they are specific to sizes)
      if (record.code || record.size_code || record.sizecode) {
        result.itemSizes.push(this.parseItemSize(record));
      }
      // Priority 2: Modifier Groups
      else if (looksLikeModifierGroup(record) && !looksLikeModifierItem(record)) {
        result.modifierGroups.push(this.parseModifierGroup(record));
      }
      // Priority 3: Modifier Items
      else if (looksLikeModifierItem(record)) {
        result.modifiers.push(this.parseModifier(record));
      }
      // Priority 4: Items
      else if (record.name && !record.group_key) {
        result.items.push(this.parseItem(record));
      }
      // Priority 5: Categories (Generic fallback for rows with name but no other indicators)
      else if (record.name && String(record.name).trim()) {
        const groupKeyVal = record.group_key ?? record.groupkey ?? '';
        const hasGroupKey = !!String(groupKeyVal).trim();
        if (hasGroupKey) {
          result.modifierGroups.push(this.parseModifierGroup(record));
        } else {
          result.categories.push(this.parseCategory(record));
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
      columns: (headers) => headers.map((h: string) => h.toLowerCase().trim()),
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
        result.itemSizes.push({
          item_name: parent || '',
          size_code: name,
          name: name,
          price: record.price || record.value,
          is_active: record.active !== undefined ? record.active : true,
          is_default: record.is_default,
        });
      }

      if (type === 'MOD_GROUP') {
        result.modifierGroups.push({
          group_key: name,
          business_id: '',
          name: name,
          display_name: record.display_name,
          display_type: (record.display_type || 'CHECKBOX').toUpperCase(),
          min_select: record.min_select || 0,
          max_select: record.max_select || 1,
          is_active: record.active !== undefined ? record.active : true,
        });
      }

      if (type === 'MODIFIER') {
        if (parent) {
          result.modifiers.push({
            group_key: parent,
            modifier_key: name,
            name: name,
            max_quantity: record.max_quantity,
            is_active: record.active !== undefined ? record.active : true,
            display_order: record.sort_order,
          });
        }
      }
    }

    return result;
  }

  private static parseCategory(record: Record<string, any>): ParsedCategoryData {
    return {
      business_id: record.business_id || record.businessid || '',
      name: record.name || '',
      description: record.description,
      sort_order: record.sort_order ? parseInt(record.sort_order) : 0,
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
    };
  }

  private static parseItem(record: Record<string, any>): ParsedItemData {
    return {
      business_id: record.business_id || record.businessid || '',
      name: record.name || '',
      description: record.description,
      base_price: record.base_price !== undefined ? parseFloat(record.base_price) : undefined,
      category_id: record.category_id || record.categoryid,
      category_name: record.category_name || record.categoryname,
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
      default_size_code:
        record.default_size_code ||
        record.defaultsizecode ||
        record.default_size ||
        record.defaultsize,
    };
  }

  private static parseItemSize(record: Record<string, any>): ParsedItemSizeData {
    return {
      item_name: record.item_name || record.itemname || record.item_key || record.itemkey || '',
      item_category_name: record.item_category_name || record.itemcategoryname || undefined,
      size_code: record.size_code || record.sizecode || record.code || '',
      name: record.name || record.code || record.sizeCode || '',
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

  /** Row has group_key, name, and display_type (or min/max_select) and no modifier_key */
  private static rowLooksLikeModifierGroup(record: Record<string, any>): boolean {
    const hasGroupKey = !!(record.group_key || record.groupkey || record['group key']);
    const hasName = !!(record.name && String(record.name).trim());
    const hasDisplayType = !!(
      record.display_type ||
      record.displaytype ||
      record['display type'] ||
      record.min_select !== undefined ||
      record.minselect !== undefined ||
      record.max_select !== undefined ||
      record.maxselect !== undefined
    );
    return !!(hasGroupKey && hasName && hasDisplayType);
  }

  /** Row has group_key (or modifier_group_name), name, and modifier_key or max_quantity */
  private static rowLooksLikeModifierItem(record: Record<string, any>): boolean {
    const hasGroupRef = !!(
      record.group_key ||
      record.groupkey ||
      record['group key'] ||
      record.modifier_group_name ||
      record.modifiergroupname ||
      record['modifier group name']
    );
    const hasName = !!(record.name && String(record.name).trim());
    // Only consider it a modifier if there's a non-empty modifier_key OR a positive max_quantity
    const modifierKeyVal = record.modifier_key || record.modifierKey || '';
    const hasModifierKey = !!String(modifierKeyVal).trim();
    const maxQtyVal = record.max_quantity ?? record.maxQuantity;
    const hasPositiveMaxQty =
      maxQtyVal !== undefined && maxQtyVal !== null && maxQtyVal !== '' && Number(maxQtyVal) > 0;
    const hasModifierKeyOrQty = hasModifierKey || hasPositiveMaxQty;
    return !!(hasGroupRef && hasName && hasModifierKeyOrQty);
  }

  private static parseModifierGroup(record: Record<string, any>): ParsedModifierGroupData {
    const groupKey =
      record.group_key || record.groupkey || record['group key'] || record.name || '';
    const name = record.name || '';
    return {
      group_key: String(groupKey).trim(),
      business_id: record.business_id || record.businessid || '',
      name: String(name).trim(),
      display_name:
        record.display_name || record.displayname || record['display name'] || undefined,
      display_type: (
        record.display_type ||
        record.displaytype ||
        record['display type'] ||
        'RADIO'
      ).toUpperCase() as 'RADIO' | 'CHECKBOX',
      min_select: parseInt(record.min_select || record.minselect || record['min select'] || '0'),
      max_select: parseInt(record.max_select || record.maxselect || record['max select'] || '1'),
      applies_per_quantity:
        record.applies_per_quantity === true ||
        record.applies_per_quantity === 'true' ||
        record.appliesperquantity === true,
      is_active:
        record.is_active !== undefined
          ? record.is_active === true || record.is_active === 'true'
          : true,
      sort_order:
        record.sort_order || record.sortorder || record['sort order']
          ? parseInt(record.sort_order || record.sortorder || record['sort order'])
          : 0,
      quantity_levels:
        record.quantity_levels || record.quantitylevels
          ? JSON.parse(record.quantity_levels || record.quantitylevels)
          : undefined,
      prices_by_size:
        record.prices_by_size || record.pricesbysize
          ? JSON.parse(record.prices_by_size || record.pricesbysize)
          : undefined,
    };
  }

  private static parseModifier(record: Record<string, any>): ParsedModifierData {
    return {
      group_key:
        record.group_key ||
        record.groupkey ||
        record['group key'] ||
        record.modifier_group_name ||
        record.modifiergroupname ||
        record['modifier group name'] ||
        '',
      modifier_key:
        record.modifier_key || record.modifierkey || record['modifier key'] || record.name || '',
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
      item_name: record.item_name || record.itemName || record.item_key || record.itemKey || '',
      item_category_name: record.item_category_name || record.itemCategoryName || undefined,
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
