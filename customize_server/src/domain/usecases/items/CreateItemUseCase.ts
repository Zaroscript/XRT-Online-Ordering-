import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { Item, CreateItemDTO } from '../../entities/Item';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateItemUseCase {
  constructor(
    private itemRepository: IItemRepository,
    private imageStorage: IImageStorage,
    private itemSizeRepository: IItemSizeRepository
  ) {}

  private validateModifierOverrides(modifier_groups?: any[]): void {
    if (!modifier_groups || modifier_groups.length === 0) {
      return;
    }

    for (const mg of modifier_groups) {
      if (!mg.modifier_overrides || mg.modifier_overrides.length === 0) {
        continue;
      }

      // Validate each modifier override structure
      for (const override of mg.modifier_overrides) {
        if (!override.modifier_id) {
          throw new ValidationError('modifier_id is required in modifier_overrides');
        }

        // Validate prices_by_size if provided
        if (override.prices_by_size && Array.isArray(override.prices_by_size)) {
          const sizeCodes = override.prices_by_size.map((ps: any) => ps.sizeCode);
          const uniqueSizeCodes = new Set(sizeCodes);
          if (sizeCodes.length !== uniqueSizeCodes.size) {
            throw new ValidationError(
              'Duplicate size codes in prices_by_size for modifier override'
            );
          }

          const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
          for (const sizeCode of sizeCodes) {
            if (!validSizes.includes(sizeCode)) {
              throw new ValidationError(
                `Invalid size code: ${sizeCode}. Must be one of: S, M, L, XL, XXL`
              );
            }
          }

          for (const ps of override.prices_by_size) {
            if (typeof ps.priceDelta !== 'number') {
              throw new ValidationError('priceDelta must be a number in prices_by_size');
            }
          }
        }

        // Validate quantity_levels if provided
        if (override.quantity_levels && Array.isArray(override.quantity_levels)) {
          const defaultCount = override.quantity_levels.filter(
            (ql: any) => ql.is_default === true
          ).length;
          if (defaultCount > 1) {
            throw new ValidationError(
              'Only one quantity level can be set as default in modifier override'
            );
          }

          for (const ql of override.quantity_levels) {
            if (typeof ql.quantity !== 'number' || ql.quantity < 1) {
              throw new ValidationError('quantity must be a positive number in quantity_levels');
            }
          }
        }

        // Validate max_quantity if provided
        if (
          override.max_quantity !== undefined &&
          (typeof override.max_quantity !== 'number' || override.max_quantity < 1)
        ) {
          throw new ValidationError('max_quantity must be a positive number');
        }

        // Validate is_default if provided
        if (override.is_default !== undefined && typeof override.is_default !== 'boolean') {
          throw new ValidationError('is_default must be a boolean');
        }
      }
    }
  }

  async execute(
    itemData: CreateItemDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Item> {
    // Validate modifier_overrides structure
    this.validateModifierOverrides(itemData.modifier_groups);

    // Business rule validation for is_sizeable
    const isSizeable = itemData.is_sizeable ?? false;

    if (isSizeable) {
      // If item is sizable, base_price should be ignored (not validated, just noted)
      // Items must be created first, then sizes added via separate endpoint
      // default_size_id can be set later after sizes are created
      if (itemData.default_size_id) {
        // If default_size_id is provided, validate it exists and belongs to this item
        // But since item doesn't exist yet, we can't validate this at creation time
        // This validation will happen when sizes are added
      }
    } else {
      // If item is not sizable:
      // - base_price is required and used
      // - default_size_id must be null/undefined
      if (!itemData.base_price && itemData.base_price !== 0) {
        throw new ValidationError('base_price is required when is_sizeable is false');
      }
      if (itemData.default_size_id) {
        throw new ValidationError('default_size_id cannot be set when is_sizeable is false');
      }
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (files && files['image'] && files['image'][0]) {
      const uploadResult = await this.imageStorage.uploadImage(
        files['image'][0],
        `xrttech/items/global`
      );
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const finalItemData: any = {
      ...itemData,
      image: imageUrl || itemData.image,
      image_public_id: imagePublicId || itemData.image_public_id,
      sort_order: itemData.sort_order ?? 0,
      is_active: itemData.is_active ?? true,
      is_available: itemData.is_available ?? true,
      is_signature: itemData.is_signature ?? false,
      // Remove sizes array if provided (sizes are now managed separately)
      sizes: undefined,
    };

    // Remove undefined fields
    Object.keys(finalItemData).forEach(
      (key) => finalItemData[key] === undefined && delete finalItemData[key]
    );

    return await this.itemRepository.create(finalItemData);
  }
}
