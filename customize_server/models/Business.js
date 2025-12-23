import mongoose from 'mongoose';
import validator from 'validator';

const businessSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: [true, 'Please provide a business ID'],
            unique: true,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide the business owner'],
        },
        name: {
            type: String,
            required: [true, 'Please provide a business name'],
            maxlength: [100, 'Business name cannot be more than 100 characters'],
            trim: true,
        },
        legal_name: {
            type: String,
            required: [true, 'Please provide a legal business name'],
            maxlength: [100, 'Legal name cannot be more than 100 characters'],
            trim: true,
        },
        primary_content_name: {
            type: String,
            required: [true, 'Please provide a primary contact name'],
            maxlength: [100, 'Contact name cannot be more than 100 characters'],
            trim: true,
        },
        primary_content_email: {
            type: String,
            required: [true, 'Please provide a primary contact email'],
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
            trim: true,
        },
        primary_content_phone: {
            type: String,
            required: [true, 'Please provide a primary contact phone'],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            select: false,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        // Keep existing fields for backward compatibility
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        address: {
            street: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            zipCode: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
            },
        },
        logo: {
            type: String,
            trim: true,
        },
        // Deprecated - use owner instead
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        // New Fields
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                index: '2dsphere',
            },
        },
        google_maps_verification: {
            type: Boolean,
            default: false,
        },
        social_media: {
            facebook: { type: String, trim: true },
            instagram: { type: String, trim: true },
            whatsapp: { type: String, trim: true },
            tiktok: { type: String, trim: true },
        },
        header_info: {
            type: String,
            trim: true,
        },
        footer_text: {
            type: String,
            trim: true,
        },
        messages: {
            closed_message: { type: String, trim: true },
            not_accepting_orders_message: { type: String, trim: true },
        },
        timezone: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Middleware to filter out inactive businesses by default
businessSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});

const Business = mongoose.model('Business', businessSchema);

export default Business;
