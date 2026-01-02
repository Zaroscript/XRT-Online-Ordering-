import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../../domain/entities/Role';

export interface RoleDocument extends Omit<Role, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ isSystem: 1 });

export const RoleModel = mongoose.model<RoleDocument>('Role', RoleSchema);

