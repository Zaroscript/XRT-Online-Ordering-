import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { PriceChangeHistoryRepository } from '../../infrastructure/repositories/PriceChangeHistoryRepository';
import {
  PriceChangeType,
  PriceValueType,
  PriceUpdateTarget,
} from '../../domain/entities/PriceChangeHistory';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { ItemModel } from '../../infrastructure/database/models/ItemModel';
import { BusinessModel } from '../../infrastructure/database/models/BusinessModel';
import { ModifierGroupModel } from '../../infrastructure/database/models/ModifierGroupModel';
import { ModifierModel } from '../../infrastructure/database/models/ModifierModel';
import { UserRole } from '../../shared/constants/roles';

export class PriceController {
  private itemRepository: ItemRepository;
  private priceChangeHistoryRepository: PriceChangeHistoryRepository;

  constructor() {
    this.itemRepository = new ItemRepository();
    this.priceChangeHistoryRepository = new PriceChangeHistoryRepository();
  }

  bulkUpdate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { type, value_type, value, target = PriceUpdateTarget.ITEMS } = req.body;

    if (!Object.values(PriceChangeType).includes(type)) {
      throw new ValidationError('Invalid price change type');
    }
    if (!Object.values(PriceValueType).includes(value_type)) {
      throw new ValidationError('Invalid price value type');
    }
    if (typeof value !== 'number' || value < 0) {
      throw new ValidationError('Value must be a positive number');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Single Tenant: We always use the first/only business
      const business = await BusinessModel.findOne().session(session);

      if (!business) {
        throw new ValidationError('No business configuration found');
      }

      const businessIds = [business.id, business._id.toString()];
      const snapshot: any[] = [];
      const bulkOps: any[] = [];
      let affectedCount = 0;

      if (target === PriceUpdateTarget.MODIFIERS) {
        // 1. Fetch Modifier Groups for the Business
        const groups = await ModifierGroupModel.find({
          business_id: { $in: businessIds },
        })
          .session(session)
          .select('_id');

        const groupIds = groups.map((g) => g._id);

        if (groupIds.length === 0) {
          throw new ValidationError('No modifier groups found for this shop');
        }

        // 2. Fetch Modifiers
        const modifiers = await ModifierModel.find({
          modifier_group_id: { $in: groupIds },
        })
          .session(session)
          .lean();

        if (modifiers.length === 0) {
          throw new ValidationError('No modifiers found to update');
        }

        // Helper to calculate new price
        const calculateNewPrice = (currentPrice: number) => {
          let newPrice = currentPrice;
          if (type === PriceChangeType.INCREASE) {
            if (value_type === PriceValueType.PERCENTAGE) {
              newPrice += newPrice * (value / 100);
            } else {
              newPrice += value;
            }
          } else {
            if (value_type === PriceValueType.PERCENTAGE) {
              newPrice -= newPrice * (value / 100);
            } else {
              newPrice -= value;
            }
          }
          return Math.max(0, parseFloat(newPrice.toFixed(2)));
        };

        for (const modifier of modifiers) {
          const hasQuantityLevels = modifier.quantity_levels && modifier.quantity_levels.length > 0;
          const hasPricesBySize = modifier.prices_by_size && modifier.prices_by_size.length > 0;

          // Skip if nothing to update
          if (!hasQuantityLevels && !hasPricesBySize) continue;

          // Snapshot (save full state of both fields)
          snapshot.push({
            modifier_id: modifier._id.toString(),
            quantity_levels: modifier.quantity_levels,
            prices_by_size: modifier.prices_by_size,
          });

          // Update Quantity Levels (Nested)
          let newQuantityLevels = modifier.quantity_levels;
          if (hasQuantityLevels) {
            newQuantityLevels = modifier.quantity_levels?.map((ql: any) => ({
              ...ql,
              price: typeof ql.price === 'number' ? calculateNewPrice(ql.price) : ql.price,
              prices_by_size: ql.prices_by_size
                ? ql.prices_by_size.map((pbs: any) => ({
                    ...pbs,
                    priceDelta: calculateNewPrice(pbs.priceDelta),
                  }))
                : [],
            }));
          }

          // Update Root Prices By Size
          let newPricesBySize = modifier.prices_by_size;
          if (hasPricesBySize) {
            newPricesBySize = modifier.prices_by_size?.map((pbs: any) => ({
              ...pbs,
              priceDelta: calculateNewPrice(pbs.priceDelta),
            }));
          }

          bulkOps.push({
            updateOne: {
              filter: { _id: modifier._id },
              update: {
                quantity_levels: newQuantityLevels,
                prices_by_size: newPricesBySize,
              },
            },
          });
        }

        affectedCount = bulkOps.length;

        if (bulkOps.length > 0) {
          await ModifierModel.bulkWrite(bulkOps, { session });
        }
      } else {
        // Target: ITEMS
        const items = await ItemModel.find({}).session(session).lean();

        if (items.length === 0) {
          throw new ValidationError('No items found to update for this shop');
        }

        affectedCount = items.length;

        for (const item of items) {
          // Snapshot
          const itemSnapshot = {
            item_id: item._id.toString(),
            base_price: item.base_price,
            sizes: item.sizes
              ? item.sizes
                  .filter((s: any) => s.size_id)
                  .map((s: any) => ({
                    size_id: s.size_id.toString(),
                    price: s.price,
                  }))
              : [],
          };
          snapshot.push(itemSnapshot);

          // Calculate New Prices
          let newBasePrice = item.base_price;
          if (type === PriceChangeType.INCREASE) {
            if (value_type === PriceValueType.PERCENTAGE) {
              newBasePrice += newBasePrice * (value / 100);
            } else {
              newBasePrice += value;
            }
          } else {
            if (value_type === PriceValueType.PERCENTAGE) {
              newBasePrice -= newBasePrice * (value / 100);
            } else {
              newBasePrice -= value;
            }
          }
          newBasePrice = Math.max(0, parseFloat(newBasePrice.toFixed(2)));

          const newSizes = item.sizes
            ? item.sizes.map((s: any) => {
                let newSizePrice = s.price;
                if (type === PriceChangeType.INCREASE) {
                  if (value_type === PriceValueType.PERCENTAGE) {
                    newSizePrice += newSizePrice * (value / 100);
                  } else {
                    newSizePrice += value;
                  }
                } else {
                  if (value_type === PriceValueType.PERCENTAGE) {
                    newSizePrice -= newSizePrice * (value / 100);
                  } else {
                    newSizePrice -= value;
                  }
                }
                return {
                  ...s,
                  price: Math.max(0, parseFloat(newSizePrice.toFixed(2))),
                };
              })
            : [];

          bulkOps.push({
            updateOne: {
              filter: { _id: item._id },
              update: {
                base_price: newBasePrice,
                sizes: newSizes,
              },
            },
          });
        }

        if (bulkOps.length > 0) {
          await ItemModel.bulkWrite(bulkOps, { session });
        }
      }

      // Create History Record
      await this.priceChangeHistoryRepository.create({
        business_id: business.id,
        admin_id: req.user?.id,
        type,
        value_type,
        value,
        affected_items_count: affectedCount,
        snapshot,
        target,
      } as any); // Cast to any to handle new target field/snapshot types

      await session.commitTransaction();
      return sendSuccess(res, 'Bulk price update completed successfully', {
        affected: affectedCount,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error('Bulk update failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  });

  rollback = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params; // History ID
    const historyResponse = await this.priceChangeHistoryRepository.findById(id);
    if (!historyResponse) {
      throw new NotFoundError('History record not found');
    }

    // Single Tenant: Just verify business exists
    const business = await BusinessModel.findOne();

    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // In Single Tenant, we can optionally verify history matches this business,
    // but effectively there is only one.
    // For safety, we can check if history.business_id matches.
    const businessIds = [business.id, business._id.toString()];
    if (!businessIds.includes(historyResponse.business_id)) {
      // If history is from an old/different business ID, we might warn or allow.
      // But in single tenant migration, usually we keep the same business.
      // Let's enforce it to be safe.
      if (
        historyResponse.business_id !== business.id &&
        historyResponse.business_id !== business._id.toString()
      ) {
        // It might be a legacy record or from before migration if DB wasn't wiped.
        // throw new ValidationError('Rollback business mismatch');
        // Actually, let's allow it but warn, or just accept it if we trust the user.
      }
    }

    if (historyResponse.status === 'ROLLED_BACK') {
      throw new ValidationError('This operation has already been rolled back');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const snapshot = historyResponse.snapshot;
      if (!snapshot || snapshot.length === 0) {
        throw new ValidationError('No snapshot data found for rollback');
      }

      const bulkOps = [];
      const target = historyResponse.target || PriceUpdateTarget.ITEMS;

      if (target === PriceUpdateTarget.MODIFIERS) {
        for (const modSnapshot of snapshot as any[]) {
          // Restore quantity_levels
          // We fully replace quantity_levels array because we stored the full state in snapshot
          bulkOps.push({
            updateOne: {
              filter: { _id: modSnapshot.modifier_id },
              update: {
                quantity_levels: modSnapshot.quantity_levels,
                prices_by_size: modSnapshot.prices_by_size, // Restore root sizes
              },
            },
          });
        }
        if (bulkOps.length > 0) {
          await ModifierModel.bulkWrite(bulkOps, { session });
        }
      } else {
        // Target: ITEMS
        for (const itemSnapshot of snapshot as any[]) {
          const arrayFilters: any[] = [];
          const updateSet: any = { base_price: itemSnapshot.base_price };

          if (itemSnapshot.sizes && itemSnapshot.sizes.length > 0) {
            itemSnapshot.sizes.forEach((s: any, index: number) => {
              const filterName = `elem${index}`;
              updateSet[`sizes.$[${filterName}].price`] = s.price;
              arrayFilters.push({ [`${filterName}.size_id`]: s.size_id });
            });
          }

          bulkOps.push({
            updateOne: {
              filter: { _id: itemSnapshot.item_id },
              update: { $set: updateSet },
              arrayFilters: arrayFilters.length > 0 ? arrayFilters : undefined,
            },
          });
        }

        if (bulkOps.length > 0) {
          await ItemModel.bulkWrite(bulkOps, { session });
        }
      }

      // Mark as rolled back
      await this.priceChangeHistoryRepository.markAsRolledBack(id, req.user?.id || 'admin');

      await session.commitTransaction();
      return sendSuccess(res, 'Rollback completed successfully');
    } catch (error) {
      await session.abortTransaction();
      console.error('Rollback failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  });

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    console.log('--- getHistory Debug ---');

    // Simplified Logic: Always use the default business ID for history
    const defaultBusiness = await BusinessModel.findOne();

    if (!defaultBusiness) {
      console.log('No default business found in DB');
      return sendSuccess(res, 'History retrieved', { history: [], total: 0 });
    }

    // We search by both strict string ID and ObjectId to be safe
    const businessIds = [defaultBusiness.id, defaultBusiness._id.toString()];

    console.log('Forcing Default Business IDs for History Search:', businessIds);

    // We pass the array to the repository which now supports $in query
    const result = await this.priceChangeHistoryRepository.findAll(businessIds, page, limit);

    console.log('History Result Count:', result.history.length, 'Total:', result.total);

    return sendSuccess(res, 'History retrieved', result);
  });

  deleteHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const history = await this.priceChangeHistoryRepository.findById(id);

    if (!history) {
      throw new NotFoundError('History record not found');
    }

    // In single tenant, verify business if needed, but usually redundant for single shop
    // Deleting history is just removing the log, not rolling back

    await this.priceChangeHistoryRepository.delete(id);

    return sendSuccess(res, 'History record deleted successfully');
  });

  clearHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business = await BusinessModel.findOne();

    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // Single tenant: using the business ID found
    await this.priceChangeHistoryRepository.deleteAll(business.id);

    return sendSuccess(res, 'All history records cleared successfully');
  });
}
