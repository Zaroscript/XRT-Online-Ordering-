import { IItemRepository } from '../../repositories/IItemRepository';
import { IImageStorage } from '../../services/IImageStorage';
import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { Item, UpdateItemDTO } from '../../entities/Item';
import { ValidationError } from '../../../shared/errors/AppError';

export class UpdateItemUseCase {
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
    id: string,
    itemData: UpdateItemDTO,
    files?: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<Item> {
    const existingItem = await this.itemRepository.findById(id);

    if (!existingItem) {
      throw new ValidationError('Item not found');
    }

    // Validate modifier_overrides structure if provided
    if (itemData.modifier_groups) {
      this.validateModifierOverrides(itemData.modifier_groups);
    }

    // Business rule validation for is_sizeable and default_size_id
    const isSizeable =
      itemData.is_sizeable !== undefined ? itemData.is_sizeable : existingItem.is_sizeable;
    const defaultSizeId =
      itemData.default_size_id !== undefined
        ? itemData.default_size_id
        : existingItem.default_size_id;

    // If changing is_sizeable to true, ensure at least one size exists for the business
    if (itemData.is_sizeable === true && !existingItem.is_sizeable) {
      const sizes = await this.itemSizeRepository.findAll({});
      if (sizes.length === 0) {
        throw new ValidationError(
          'Cannot set is_sizeable to true. At least one size must exist. Create sizes first using POST /sizes'
        );
      }
    }

    if (isSizeable) {
      // If item is sizable:
      // - default_size_id must reference an existing size of this business (if provided)
      if (defaultSizeId) {
        const defaultSize = await this.itemSizeRepository.findById(defaultSizeId);
        if (!defaultSize) {
          throw new ValidationError('default_size_id must reference an existing size');
        }
        if (!defaultSize.is_active) {
          throw new ValidationError('default_size_id must reference an active size');
        }
      }
    } else {
      // If item is not sizable:
      // - base_price is required (unless it's being updated)
      // - default_size_id must be null/undefined
      if (itemData.is_sizeable === false && defaultSizeId) {
        throw new ValidationError('default_size_id cannot be set when is_sizeable is false');
      }
      if (
        itemData.is_sizeable === false &&
        itemData.base_price === undefined &&
        !existingItem.base_price &&
        existingItem.base_price !== 0
      ) {
        throw new ValidationError('base_price is required when is_sizeable is false');
      }
    }

    let imageUrl: string | undefined = existingItem.image;
    let imagePublicId: string | undefined = existingItem.image_public_id;

    if (files && files['image'] && files['image'][0]) {
      // Delete old image if exists
      if (existingItem.image_public_id) {
        await this.imageStorage.deleteImage(existingItem.image_public_id);
      }

      const uploadResult = await this.imageStorage.uploadImage(
        files['image'][0],
        `xrttech/items/global`
      );
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const updateData: any = {
      ...itemData,
      image: imageUrl,
      image_public_id: imagePublicId,
      // Remove sizes array if provided (sizes are now managed separately)
      sizes: undefined,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    return await this.itemRepository.update(id, updateData);
  }
}
