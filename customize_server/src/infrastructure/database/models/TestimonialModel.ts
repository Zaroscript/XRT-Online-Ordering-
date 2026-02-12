import mongoose, { Schema, Document } from 'mongoose';
import { Testimonial } from '../../../domain/entities/Testimonial';

export interface TestimonialDocument extends Omit<Testimonial, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const TestimonialSchema = new Schema<TestimonialDocument>(
  {
    name: { type: String, required: true },
    feedback: { type: String, required: true },
    image: { type: String },
    role: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const TestimonialModel = mongoose.model<TestimonialDocument>(
  'Testimonial',
  TestimonialSchema
);
