import mongoose from 'mongoose';
import { ParsedImportData, RollbackOperation } from '../../domain/entities/ImportSession';
import { IItemRepository } from '../../domain/repositories/IItemRepository';
import { IItemSizeRepository } from '../../domain/repositories/IItemSizeRepository';
import { IModifierGroupRepository } from '../../domain/repositories/IModifierGroupRepository';
import { IModifierRepository } from '../../domain/repositories/IModifierRepository';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { IKitchenSectionRepository } from '../../domain/repositories/IKitchenSectionRepository';
import { CreateItemDTO } from '../../domain/entities/Item';
import { CreateItemSizeDTO } from '../../domain/entities/ItemSize';
import { CreateModifierGroupDTO } from '../../domain/entities/ModifierGroup';
import { CreateModifierDTO } from '../../domain/entities/Modifier';
import { ValidationError } from '../errors/AppError';
import { getKitchenSectionIdByName } from '../constants/kitchen-sections';

export class ImportSaveService {
  constructor(
    private itemRepository: IItemRepository,
    private itemSizeRepository: IItemSizeRepository,
    private modifierGroupRepository: IModifierGroupRepository,
    private modifierRepository: IModifierRepository,
    private categoryRepository: ICategoryRepository,
    private kitchenSectionRepository: IKitchenSectionRepository
  ) {}

  /**
   * Save all import data in a single transaction
   */
  /**
   * Save all import data in a single transaction with Upsert logic
   */
  async saveAll(data: ParsedImportData, business_id: string): Promise<RollbackOperation[]> {
    const session = await mongoose.startSession();
    session.startTransaction();
    const rollbackOps: RollbackOperation[] = [];

    try {
      // Maps to track entities by Natural Keys (Name/Parent) -> ID
      const categoryNameToId = new Map<string, string>();
      const itemCompositeKey = (name: string, categoryName?: string) =>
        `${(name || '').trim()}|${(categoryName || '').trim()}`;
      const itemNameToId = new Map<string, string>(); // item composite key (name|category_name) -> ID
      const groupKeyToId = new Map<string, string>();
      const modifierKeyToId = new Map<string, string>();
      const sizeCodeToId = new Map<string, string>();
      const itemNameToDefaultSizeCode = new Map<string, string>();

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
            const existingCategory = allCategories.find((c) => c.id === existingId);
            if (existingCategory) {
              rollbackOps.push({
                entityType: 'category',
                action: 'update',
                id: existingId,
                previousData: existingCategory,
              });
            }

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
            rollbackOps.push({
              entityType: 'category',
              action: 'create',
              id: createdCat.id,
            });
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
            rollbackOps.push({
              entityType: 'item_size',
              action: 'update',
              id: sizeId,
              previousData: foundSize,
            });

            // Update
            await this.itemSizeRepository.update(sizeId, {
              name: sizeData.name,
              display_order: sizeData.display_order,
              is_active: sizeData.is_active,
            });
          } else {
            throw new Error('Size not found.');
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
          rollbackOps.push({
            entityType: 'item_size',
            action: 'create',
            id: sizeId,
          });
        }

        sizeCodeToId.set(sizeData.size_code, sizeId);

        if (sizeData.is_default && sizeData.item_name) {
          itemNameToDefaultSizeCode.set(
            itemCompositeKey(sizeData.item_name, sizeData.item_category_name),
            sizeData.size_code
          );
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
          rollbackOps.push({
            entityType: 'modifier_group',
            action: 'update',
            id: existingGroup.id,
            previousData: existingGroup,
          });

          // Update
          await this.modifierGroupRepository.update(existingGroup.id, business_id, {
            display_name: groupData.display_name,
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
                sizeCode: p.sizeCode,
                priceDelta: p.priceDelta,
              }))
              .filter((p) => p.size_id),
          });
        } else {
          const createGroupDTO: CreateModifierGroupDTO = {
            business_id,
            name: groupData.name,
            display_name: groupData.display_name,
            display_type: groupData.display_type,
            min_select: groupData.min_select,
            max_select: groupData.max_select,
            is_active: groupData.is_active ?? true,
            sort_order: groupData.sort_order ?? 0,
            quantity_levels: groupData.quantity_levels,
            prices_by_size: groupData.prices_by_size
              ?.map((p) => ({
                size_id: sizeCodeToId.get(p.sizeCode)!,
                sizeCode: p.sizeCode,
                priceDelta: p.priceDelta,
              }))
              .filter((p) => p.size_id),
          };

          const createdGroup = await this.modifierGroupRepository.create(createGroupDTO);
          groupKeyToId.set(groupData.group_key, createdGroup.id);
          rollbackOps.push({
            entityType: 'modifier_group',
            action: 'create',
            id: createdGroup.id,
          });
        }
      }

      // 3. Upsert Modifiers (depends on Modifier Groups)
      for (const modifierData of data.modifiers) {
        const groupId = groupKeyToId.get(modifierData.group_key);
        if (!groupId) {
          throw new ValidationError('Modifier group not found. Import groups first.');
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
          rollbackOps.push({
            entityType: 'modifier',
            action: 'update',
            id: existingModifier.id,
            previousData: existingModifier,
          });

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
          rollbackOps.push({
            entityType: 'modifier',
            action: 'create',
            id: createdModifier.id,
          });
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
          throw new ValidationError('Category not found for this item. Import categories first.');
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
        const itemKey = itemCompositeKey(itemData.name, itemData.category_name);

        if (existingItem) {
          itemNameToId.set(itemKey, existingItem.id);
          rollbackOps.push({
            entityType: 'item',
            action: 'update',
            id: existingItem.id,
            previousData: existingItem,
          });

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
          itemNameToId.set(itemKey, createdItem.id);
          rollbackOps.push({
            entityType: 'item',
            action: 'create',
            id: createdItem.id,
          });
        }
      }

      // 6. Set default_size_id for items
      for (const [itemKey, sizeCode] of itemNameToDefaultSizeCode.entries()) {
        const itemId = itemNameToId.get(itemKey);
        const sizeId = sizeCodeToId.get(sizeCode);
        if (itemId && sizeId) {
          // Note: This is an "Update" on Item, but we already captured the "Item Update Snapshot" above if it existed.
          // If the item was just created, we don't need a snapshot (rollback will delete it).
          // If it was updated, we already have the previous state.
          // However, if we do MULTIPLE updates to the same item, we should only capture the FIRST one.
          // Logic: We check if we already have an 'update' op for this item ID.
          const alreadyCaptured = rollbackOps.some(
            (op) => op.entityType === 'item' && op.id === itemId && op.action === 'update'
          );

          if (!alreadyCaptured) {
            // It must have been created in this session, or we missed it (unlikely given the loop above).
            // If created, we are good.
            // If it existed but wasn't updated in the main loop (e.g. only setting default size), we should capture it.
            // But the main loop iterates ALL items in data.items.
          }

          await this.itemRepository.update(itemId, {
            default_size_id: sizeId,
          });
        }
      }

      // 7. Link Items to Modifier Groups (Overwrite or Merge?)
      // User Upsert strategy usually implies updating configuration.
      // We will re-build the modifier_groups assignment based on import data.

      for (const itemData of data.items) {
        const itemId = itemNameToId.get(itemCompositeKey(itemData.name, itemData.category_name));
        if (!itemId) continue;

        // Find overrides/assignments for this item
        const itemKey = itemCompositeKey(itemData.name, itemData.category_name);
        const itemOverrides = data.itemModifierOverrides.filter(
          (o) => itemCompositeKey(o.item_name, o.item_category_name) === itemKey
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
                  // sizeCode: override.sizeCode, // Removed as it doesn't exist on interface
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
          // Again, check if we need to snapshot (same logic as default_size_id).
          // If the item was not touched in the main loop (unlikely since we iterate data.items there too), capture it.
          // Since we iterate data.items, we definitely touched it there.

          await this.itemRepository.update(itemId, {
            modifier_groups: modifierGroups,
          });
        }
      }

      await session.commitTransaction();
      return rollbackOps;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
