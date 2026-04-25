import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import {
  Order,
  OrderPrintStatus,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
  OrderStatus,
  OrderItem,
  OrderItemModifier,
} from '../../domain/entities/Order';
import { OrderModel, OrderDocument } from '../database/models/OrderModel';
import { Types } from 'mongoose';

export class OrderRepository implements IOrderRepository {
  private mapToDomain(doc: OrderDocument): Order {
    const obj = doc.toObject();

    // Map items strictly to Domain entities
    const mappedItems: OrderItem[] = obj.items.map((item: any) => ({
      id: item._id?.toString() || '',
      menu_item_id: item.menu_item_id?.toString() || '',
      size_id: item.size_id ? item.size_id.toString() : undefined,
      name_snap: item.name_snap,
      size_snap: item.size_snap,
      unit_price: item.unit_price,
      quantity: item.quantity,
      modifier_totals: item.modifier_totals,
      line_subtotal: item.line_subtotal,
      special_notes: item.special_notes,
      kitchen_section_snapshot: item.kitchen_section_snapshot ?? undefined,
      modifiers: (item.modifiers || []).map((mod: any) => ({
        id: mod._id?.toString() || '',
        modifier_id: mod.modifier_id?.toString() || '',
        name_snapshot: mod.name_snapshot,
        modifier_quantity_id: mod.modifier_quantity_id
          ? mod.modifier_quantity_id.toString()
          : undefined,
        quantity_label_snapshot: mod.quantity_label_snapshot,
        unit_price_delta: mod.unit_price_delta,
        selected_side: mod.selected_side ?? undefined,
      })),
    }));

    // If delivery info is missing, try to use populated customer data
    const populatedCustomer =
      (obj as any).customer_id_populated ||
      (typeof obj.customer_id === 'object' && obj.customer_id !== null
        ? (obj.customer_id as any)
        : null);

    const delivery = obj.delivery ? { ...obj.delivery } : undefined;
    // If no delivery, build one from populated customer for display purposes
    const effectiveDelivery =
      delivery ||
      (populatedCustomer
        ? {
            name: populatedCustomer.name || populatedCustomer.firstName || '',
            phone: populatedCustomer.phoneNumber || populatedCustomer.phone || '',
            address: populatedCustomer.address || undefined,
          }
        : undefined);

    return {
      id: obj._id?.toString() || '',
      business_id: obj.business_id?.toString() || '',
      customer_id:
        typeof obj.customer_id === 'object' && obj.customer_id !== null
          ? obj.customer_id
          : obj.customer_id?.toString() || '',
      order_number: obj.order_number,
      order_type: obj.order_type as any,
      service_time_type: obj.service_time_type as any,
      schedule_time: obj.schedule_time,
      ready_time: obj.ready_time,
      actual_ready_time: obj.actual_ready_time,
      status: obj.status as OrderStatus,
      created_at: obj.created_at,
      updated_at: obj.updated_at,
      cancelled_at: obj.cancelled_at,
      completed_at: obj.completed_at,
      cancelled_reason: obj.cancelled_reason,
      cancelled_by: obj.cancelled_by,
      money: {
        ...obj.money,
        payment_id: obj.money?.payment_id,
        payment_status: obj.money?.payment_status || obj.payment_status,
        coupon_code: obj.money?.coupon_code,
        rewards_points_used: obj.money?.rewards_points_used,
        card_type: obj.money?.card_type,
        last_4: obj.money?.last_4,
      },
      payment_status: obj.payment_status || obj.money?.payment_status,
      delivery: effectiveDelivery,
      notes: obj.notes,
      items: mappedItems,
      print_status: (obj.print_status || []).map((ps: any) => ({
        printer_id: ps.printer_id,
        status: ps.status,
        attempted_at: ps.attempted_at,
        error: ps.error,
      })),
    };
  }

  async create(orderData: CreateOrderDTO): Promise<Order> {
    // Generate order number (e.g., ORD-YYYYMMDD-XXXX)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const doc = new OrderModel({
      ...orderData,
      order_number: orderNumber,
      status: (orderData as any).status || 'pending',
    });

    const saved = await doc.save();
    return this.mapToDomain(saved);
  }

  private static readonly CUSTOMER_POPULATE = {
    path: 'customer_id',
    model: 'Customer',
    select: 'name phoneNumber email address',
  };

  async findById(id: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await OrderModel.findById(id).populate(OrderRepository.CUSTOMER_POPULATE).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ order_number: orderNumber }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  private static readonly SPECIAL_NEW = '__new__';
  private static readonly SPECIAL_INPROGRESS = '__inprogress__';
  private static readonly SPECIAL_SCHEDULED = '__scheduled__';

  private applyStatusFilter(query: any, status: string | string[]): void {
    const s = Array.isArray(status) ? status[0] : status;

    switch (s) {
      case OrderRepository.SPECIAL_NEW:
        query.status = 'pending';
        break;

      case OrderRepository.SPECIAL_INPROGRESS:
        query.status = { $in: ['accepted', 'inkitchen', 'ready', 'out of delivery'] };
        query.$or = [{ schedule_time: null }, { schedule_time: { $exists: false } }];
        break;

      case OrderRepository.SPECIAL_SCHEDULED:
        query.schedule_time = { $ne: null, $exists: true };
        query.status = {
          $in: ['accepted', 'inkitchen', 'ready', 'out of delivery'],
        };
        break;

      default:
        query.status = Array.isArray(status) ? { $in: status } : status;
        break;
    }
  }

  async findAll(filters: any): Promise<{ data: Order[]; total: number }> {
    const query: any = {};
    if (filters.status) {
      this.applyStatusFilter(query, filters.status);
    }
    if (filters.order_type) query.order_type = filters.order_type;
    if (filters.today_only) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.created_at = { $gte: startOfDay, $lte: endOfDay };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(query)
        .populate(OrderRepository.CUSTOMER_POPULATE)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  async findByCustomerId(
    customerId: string,
    filters: any
  ): Promise<{ data: Order[]; total: number }> {
    if (!Types.ObjectId.isValid(customerId)) return { data: [], total: 0 };

    const query: any = { customer_id: customerId };
    if (filters.status) {
      this.applyStatusFilter(query, filters.status);
    }
    if (filters.today_only) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.created_at = { $gte: startOfDay, $lte: endOfDay };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(query)
        .populate(OrderRepository.CUSTOMER_POPULATE)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  async updateStatus(id: string, updateData: UpdateOrderStatusDTO): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updates: any = { status: updateData.status };
    const unsets: any = {};

    if (updateData.ready_time) {
      updates.ready_time = updateData.ready_time;
    }

    if (updateData.clear_schedule) {
      unsets.schedule_time = 1;
    }

    if (updateData.status === 'completed') {
      updates.completed_at = new Date();
    } else if (updateData.status === 'canceled') {
      updates.cancelled_at = new Date();
      if (updateData.cancelled_reason != null)
        updates.cancelled_reason = updateData.cancelled_reason;
      if (updateData.cancelled_by != null) updates.cancelled_by = updateData.cancelled_by;
    }

    const updateOp: any = { $set: updates };
    if (Object.keys(unsets).length > 0) {
      updateOp.$unset = unsets;
    }

    const doc = await OrderModel.findByIdAndUpdate(id, updateOp, {
      new: true,
      runValidators: true,
    }).exec();

    return doc ? this.mapToDomain(doc) : null;
  }

  async updatePrintStatus(
    orderId: string,
    printerId: string,
    status: 'sent' | 'failed',
    error?: string
  ): Promise<Order | null> {
    if (!Types.ObjectId.isValid(orderId)) return null;
    const doc = await OrderModel.findById(orderId).exec();
    if (!doc) return null;
    const current = (doc.print_status || []) as OrderPrintStatus[];
    const filtered = current.filter((ps) => ps.printer_id !== printerId);
    filtered.push({
      printer_id: printerId,
      status: status as OrderPrintStatus['status'],
      attempted_at: new Date(),
      error: error ?? undefined,
    });
    doc.print_status = filtered as any;
    await doc.save();
    return this.mapToDomain(doc);
  }

  async clearPrintStatus(orderId: string, printerId?: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(orderId)) return null;
    const doc = await OrderModel.findById(orderId).exec();
    if (!doc) return null;
    const current = (doc.print_status || []) as OrderPrintStatus[];
    if (printerId) {
      doc.print_status = current.filter((ps) => ps.printer_id !== printerId) as any;
    } else {
      doc.print_status = [];
    }
    await doc.save();
    return this.mapToDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await OrderModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
