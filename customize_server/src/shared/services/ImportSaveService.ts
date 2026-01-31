import mongoose from 'mongoose';
import { ParsedImportData } from '../../domain/entities/ImportSession';
import { IItemRepository } from '../../domain/repositories/IItemRepository';
import { IItemSizeRepository } from '../../domain/repositories/IItemSizeRepository';
import { IModifierGroupRepository } from '../../domain/repositories/IModifierGroupRepository';
import { IModifierRepository } from '../../domain/repositories/IModifierRepository';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CreateItemDTO } from '../../domain/entities/Item';
import { CreateItemSizeDTO } from '../../domain/entities/ItemSize';
import { CreateModifierGroupDTO } from '../../domain/entities/ModifierGroup';
import { CreateModifierDTO } from '../../domain/entities/Modifier';
import { ValidationError } from '../errors/AppError';

export class ImportSaveService {
  constructor(
    private itemRepository: IItemRepository,
    private itemSizeRepository: IItemSizeRepository,
    private modifierGroupRepository: IModifierGroupRepository,
    private modifierRepository: IModifierRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  /**
   * Save all import data in a single transaction
   */
  /**
   * Save all import data in a single transaction with Upsert logic
   */
  async saveAll(data: ParsedImportData, business_id: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Maps to track entities by Natural Keys (Name/Parent) -> ID
      const categoryNameToId = new Map<string, string>();
      const itemKeyToId = new Map<string, string>(); // item_key (Name in Generic CSV) -> ID
      const groupKeyToId = new Map<string, string>();
      const modifierKeyToId = new Map<string, string>();
      const sizeCodeToId = new Map<string, string>();
      const itemKeyToDefaultSizeCode = new Map<string, string>();

      // 0. Upsert Categories (New Step)
      if (data.categories && data.categories.length > 0) {
        for (const catData of data.categories) {
          const existingCats = await this.categoryRepository.findAll({
            business_id,
            // We need to filter by name, but findAll might not support 'name' filter.
            // If not, we fetch all and find in memory, or use a new 'findByName' method if exists.
            // Assuming we fetch all later, but for now let's query specific or efficient way.
            // Actually, later in Step 4 we fetch all categories. Let's start by fetching all categories once.
          });
          // Optimisation: Fetch all categories once at start?
          // But we might create new ones.
          // Let's rely on finding by name one by one or caching.
        }
      }

      // Optimization: Fetch all existing Categories for Business
      const allCategories = await this.categoryRepository.findAll({ business_id });
      for (const cat of allCategories) {
        // Build map: Lowercase Name -> ID
        categoryNameToId.set(cat.name.toLowerCase(), cat.id);
      }

      // Process Categories from Import
      if (data.categories) {
        for (const catData of data.categories) {
          const lowerName = catData.name.trim().toLowerCase();
          const existingId = categoryNameToId.get(lowerName);

          if (existingId) {
            // Update
            await this.categoryRepository.update(existingId, business_id, {
              description: catData.description,
              sort_order: catData.sort_order,
              is_active: catData.is_active,
            });
          } else {
            // Create
            const createdCat = await this.categoryRepository.create({
              business_id,
              name: catData.name,
              description: catData.description,
              sort_order: catData.sort_order ?? 0,
              is_active: catData.is_active ?? true,
            });
            categoryNameToId.set(lowerName, createdCat.id);
          }
        }
      }

      // 1. Upsert Item Sizes (Global)
      for (const sizeData of data.itemSizes) {
        let sizeId: string;
        // Check by Code (Natural Key for Sizes)
        const existingSize = await this.itemSizeRepository.exists(sizeData.size_code, business_id);

        if (existingSize) {
          const sizes = await this.itemSizeRepository.findAll({ business_id });
          const foundSize = sizes.find((s) => s.code === sizeData.size_code);
          if (foundSize) {
            sizeId = foundSize.id;
            // Update
            await this.itemSizeRepository.update(sizeId, {
              name: sizeData.name,
              display_order: sizeData.display_order,
              is_active: sizeData.is_active,
            });
          } else {
            throw new Error(`Size ${sizeData.size_code} check failed.`);
          }
        } else {
          const createdSize = await this.itemSizeRepository.create({
            business_id: business_id,
            name: sizeData.name,
            code: sizeData.size_code,
            display_order: sizeData.display_order ?? 0,
            is_active: sizeData.is_active ?? true,
          });
          sizeId = createdSize.id;
        }

        sizeCodeToId.set(sizeData.size_code, sizeId);

        if (sizeData.is_default && sizeData.item_key) {
          itemKeyToDefaultSizeCode.set(sizeData.item_key, sizeData.size_code);
        }
      }

      // 2. Upsert Modifier Groups
      for (const groupData of data.modifierGroups) {
        // Check if group exists by name
        const existingGroups = await this.modifierGroupRepository.findAll({
          business_id,
          name: groupData.name,
          page: 1,
          limit: 1,
        });

        const existingGroup =
          existingGroups.modifierGroups.length > 0 ? existingGroups.modifierGroups[0] : null;

        if (existingGroup) {
          groupKeyToId.set(groupData.group_key, existingGroup.id);
          // Update
          await this.modifierGroupRepository.update(existingGroup.id, business_id, {
            display_type: groupData.display_type,
            min_select: groupData.min_select,
            max_select: groupData.max_select,
            is_active: groupData.is_active,
            sort_order: groupData.sort_order,
            // Merge or Replace quantity_levels / prices_by_size?
            // For now, replacing logic is safer for strict imports.
            quantity_levels: groupData.quantity_levels,
            prices_by_size: groupData.prices_by_size
              ?.map((p) => ({
                size_id: sizeCodeToId.get(p.sizeCode)!,
                priceDelta: p.priceDelta,
              }))
              .filter((p) => p.size_id),
          });
        } else {
          const createGroupDTO: CreateModifierGroupDTO = {
            business_id,
            name: groupData.name,
            display_type: groupData.display_type,
            min_select: groupData.min_select,
            max_select: groupData.max_select,
            is_active: groupData.is_active ?? true,
            sort_order: groupData.sort_order ?? 0,
            quantity_levels: groupData.quantity_levels,
            prices_by_size: groupData.prices_by_size
              ?.map((p) => ({
                size_id: sizeCodeToId.get(p.sizeCode)!,
                priceDelta: p.priceDelta,
              }))
              .filter((p) => p.size_id),
          };

          const createdGroup = await this.modifierGroupRepository.create(createGroupDTO);
          groupKeyToId.set(groupData.group_key, createdGroup.id);
        }
      }

      // 3. Upsert Modifiers (depends on Modifier Groups)
      for (const modifierData of data.modifiers) {
        const groupId = groupKeyToId.get(modifierData.group_key);
        if (!groupId) {
          throw new ValidationError(`ModifierGroup '${modifierData.group_key}' not found/created.`);
        }

        // Check if modifier exists by name in group
        const existingModifiers = await this.modifierRepository.findAll({
          modifier_group_id: groupId,
          name: modifierData.name,
        });

        const existingModifier = existingModifiers.length > 0 ? existingModifiers[0] : null;

        if (existingModifier) {
          modifierKeyToId.set(
            `${modifierData.group_key}:${modifierData.modifier_key}`,
            existingModifier.id
          );
          // Update
          await this.modifierRepository.update(existingModifier.id, groupId, {
            display_order: modifierData.display_order,
            is_active: modifierData.is_active,
            // max_quantity handling?
          });
        } else {
          const createModifierDTO: CreateModifierDTO = {
            modifier_group_id: groupId,
            name: modifierData.name,
            display_order: modifierData.display_order ?? 0,
            is_active: modifierData.is_active ?? true,
          };

          const createdModifier = await this.modifierRepository.create(createModifierDTO);
          modifierKeyToId.set(
            `${modifierData.group_key}:${modifierData.modifier_key}`,
            createdModifier.id
          );
        }
      }

      // 4. Upsert Items
      for (const itemData of data.items) {
        // Resolve Category
        let categoryId = itemData.category_id;
        if (!categoryId && itemData.category_name) {
          categoryId = categoryNameToId.get(itemData.category_name.toLowerCase());
        }
        if (!categoryId) {
          // Skip or Error? User said "Match existing... Parent to establish hierarchy".
          // If Category not found, we cannot create Item properly.
          throw new ValidationError(
            `Category '${itemData.category_name}' not found for Item '${itemData.name}'. Ensure Category is created or imported first.`
          );
        }

        // Search for Existing Item by Name AND Category
        const existingItems = await this.itemRepository.findAll({
          name: itemData.name,
          category_id: categoryId,
        });

        // Use findAll with name/category filter if available, otherwise filter in memory
        // Assuming findAll supports these filters based on ItemFilters interface check.
        // If not, we iterate. Re-checking ItemFilters in Item.ts... yes, name and category_id are in ItemFilters.

        const existingItem = existingItems.items.length > 0 ? existingItems.items[0] : null;

        if (existingItem) {
          itemKeyToId.set(itemData.item_key, existingItem.id);
          // Update
          await this.itemRepository.update(existingItem.id, {
            description: itemData.description,
            base_price: itemData.base_price,
            is_active: itemData.is_active,
            is_available: itemData.is_available,
            is_sizeable: itemData.is_sizeable,
            is_customizable: itemData.is_customizable,
            sort_order: itemData.sort_order,
            // Don't override modifier_groups here yet, will link later
          });
        } else {
          // Create
          const createItemDTO: CreateItemDTO = {
            name: itemData.name,
            description: itemData.description,
            base_price: itemData.base_price ?? 0,
            category_id: categoryId,
            is_sizeable: itemData.is_sizeable,
            is_customizable: itemData.is_customizable ?? false,
            is_active: itemData.is_active ?? true,
            is_available: itemData.is_available ?? true,
            is_signature: itemData.is_signature ?? false,
            max_per_order: itemData.max_per_order,
            sort_order: itemData.sort_order ?? 0,
          };
          const createdItem = await this.itemRepository.create(createItemDTO);
          itemKeyToId.set(itemData.item_key, createdItem.id);
        }
      }

      // 6. Set default_size_id for items
      for (const [itemKey, sizeCode] of itemKeyToDefaultSizeCode.entries()) {
        const itemId = itemKeyToId.get(itemKey);
        const sizeId = sizeCodeToId.get(sizeCode);
        if (itemId && sizeId) {
          await this.itemRepository.update(itemId, {
            default_size_id: sizeId,
          });
        }
      }

      // 7. Link Items to Modifier Groups (Overwrite or Merge?)
      // User Upsert strategy usually implies updating configuration.
      // We will re-build the modifier_groups assignment based on import data.

      for (const itemData of data.items) {
        const itemId = itemKeyToId.get(itemData.item_key);
        if (!itemId) continue;

        // Find overrides/assignments for this item
        const itemOverrides = data.itemModifierOverrides.filter(
          (o) => o.item_key === itemData.item_key
        );

        // If no overrides/groups defined in import, skip update? Or clear?
        // Safer to skip unless specified.
        if (itemOverrides.length === 0) continue;

        const overridesByGroup = new Map<string, typeof itemOverrides>();
        for (const override of itemOverrides) {
          if (!overridesByGroup.has(override.group_key)) {
            overridesByGroup.set(override.group_key, []);
          }
          overridesByGroup.get(override.group_key)!.push(override);
        }

        const modifierGroups = Array.from(overridesByGroup.keys())
          .map((group_key, index) => {
            const groupId = groupKeyToId.get(group_key);
            if (!groupId) return null;

            const groupOverrides = overridesByGroup.get(group_key)!;
            const modifierOverrides = groupOverrides
              .map((override) => {
                const modifierId = modifierKeyToId.get(
                  `${override.group_key}:${override.modifier_key}`
                );
                if (!modifierId) return null;

                return {
                  modifier_id: modifierId,
                  prices_by_size: override.prices_by_size,
                  quantity_levels: override.quantity_levels,
                };
              })
              .filter((o) => o !== null) as any[];

            return {
              modifier_group_id: groupId,
              display_order: index,
              modifier_overrides: modifierOverrides.length > 0 ? modifierOverrides : undefined,
            };
          })
          .filter((g) => g !== null) as any[];

        if (modifierGroups.length > 0) {
          await this.itemRepository.update(itemId, {
            modifier_groups: modifierGroups,
          });
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
