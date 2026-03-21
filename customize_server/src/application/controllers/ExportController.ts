import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetCategoriesUseCase } from '../../domain/usecases/categories/GetCategoriesUseCase';
import { GetItemsUseCase } from '../../domain/usecases/items/GetItemsUseCase';
import { GetItemSizesUseCase } from '../../domain/usecases/item-sizes/GetItemSizesUseCase';
import { GetModifierGroupsUseCase } from '../../domain/usecases/modifier-groups/GetModifierGroupsUseCase';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { ItemSizeRepository } from '../../infrastructure/repositories/ItemSizeRepository';
import { ModifierGroupRepository } from '../../infrastructure/repositories/ModifierGroupRepository';
import { ModifierRepository } from '../../infrastructure/repositories/ModifierRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import AdmZip from 'adm-zip';

export class ExportController {
  private getCategoriesUseCase: GetCategoriesUseCase;
  private getItemsUseCase: GetItemsUseCase;
  private getItemSizesUseCase: GetItemSizesUseCase;
  private getModifierGroupsUseCase: GetModifierGroupsUseCase;
  private modifierRepository: ModifierRepository;

  constructor() {
    this.getCategoriesUseCase = new GetCategoriesUseCase(new CategoryRepository());
    this.getItemsUseCase = new GetItemsUseCase(new ItemRepository());
    this.getItemSizesUseCase = new GetItemSizesUseCase(new ItemSizeRepository());
    this.getModifierGroupsUseCase = new GetModifierGroupsUseCase(new ModifierGroupRepository());
    this.modifierRepository = new ModifierRepository();
  }

  exportAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id;

    // Helper to safely stringify values for CSV
    const safeString = (val: any) => `"${(val || '').toString().replace(/"/g, '""')}"`;

    // 1. Categories
    const categoriesResult: any = await this.getCategoriesUseCase.execute({
      business_id: business_id as string,
      limit: 1000,
      page: 1,
    } as any);
    const categories = categoriesResult.data || categoriesResult;
    const categoriesCsvRows = [
      ['name', 'description', 'sort_order', 'is_active', 'kitchen_section_name'].join(','),
      ...categories.map((cat: any) =>
        [
          safeString(cat.name),
          safeString(cat.description),
          cat.sort_order ?? 0,
          cat.is_active ?? true,
          safeString(cat.kitchen_section_data?.name || ''),
        ].join(',')
      ),
    ];
    const categoriesCsv = categoriesCsvRows.join('\n');

    // 2. Items
    const itemsResult: any = await this.getItemsUseCase.execute({
      page: 1,
      limit: 1000,
      orderBy: 'sort_order',
      sortedBy: 'asc',
    });
    const itemsList = itemsResult.items || [];
    const itemsCsvRows = [
      ['name', 'description', 'category_name', 'sort_order', 'is_active'].join(','),
      ...itemsList.map((item: any) =>
        [
          safeString(item.name),
          safeString(item.description),
          safeString(item.category?.name),
          item.sort_order ?? 0,
          item.is_active ?? true,
        ].join(',')
      ),
    ];
    const itemsCsv = itemsCsvRows.join('\n');

    // 3. Sizes
    const sizesResult: any = await this.getItemSizesUseCase.execute({
      business_id: business_id as string,
    });
    const sizesList = Array.isArray(sizesResult) ? sizesResult : [];
    const sizesCsvRows = [
      ['name', 'size_code', 'display_order', 'is_active'].join(','),
      ...sizesList.map((size: any) =>
        [
          safeString(size.name),
          safeString(size.code),
          size.display_order || 0,
          size.is_active ?? true,
        ].join(',')
      ),
    ];
    const sizesCsv = sizesCsvRows.join('\n');

    // 4. Modifier Groups
    const groupsResult: any = await this.getModifierGroupsUseCase.execute({
      business_id: business_id as string,
      limit: 1000,
      page: 1,
    });
    let modifierGroups = groupsResult.data || groupsResult.modifierGroups || groupsResult;
    if (!Array.isArray(modifierGroups)) modifierGroups = [];
    const groupsCsvRows = [
      ['name', 'display_name', 'display_type', 'min_select', 'max_select', 'sort_order', 'is_active'].join(','),
      ...modifierGroups.map((group: any) =>
        [
          safeString(group.name),
          safeString(group.display_name),
          group.display_type || 'CHECKBOX',
          group.min_select || 0,
          group.max_select || 1,
          group.sort_order || 0,
          group.is_active ?? true,
        ].join(',')
      ),
    ];
    const groupsCsv = groupsCsvRows.join('\n');

    // 5. Modifiers
    const modifiersList = await this.modifierRepository.findAll({
      is_active: undefined, // get all
    });
    const modifiersCsvRows = [
      ['group_key', 'modifier_key', 'name', 'max_quantity', 'is_default', 'display_order', 'is_active'].join(','),
      ...modifiersList.map((mod: any) =>
        [
          safeString(mod.modifier_group?.name || mod.modifier_group_id),
          safeString(mod.name),
          safeString(mod.name),
          1,
          false,
          mod.display_order ?? 0,
          mod.is_active ?? true,
        ].join(',')
      ),
    ];
    const modifiersCsv = modifiersCsvRows.join('\n');

    // Build ZIP
    const zip = new AdmZip();
    zip.addFile('categories.csv', Buffer.from(categoriesCsv, 'utf8'));
    zip.addFile('items.csv', Buffer.from(itemsCsv, 'utf8'));
    zip.addFile('sizes.csv', Buffer.from(sizesCsv, 'utf8'));
    zip.addFile('modifier-groups.csv', Buffer.from(groupsCsv, 'utf8'));
    zip.addFile('modifiers.csv', Buffer.from(modifiersCsv, 'utf8'));

    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="export-all-${new Date().toISOString().slice(0, 10)}.zip"`);
    res.send(zipBuffer);
  });
}
