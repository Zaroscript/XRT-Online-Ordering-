import mongoose from 'mongoose';

const withdrawSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: [true, 'Please provide the business'],
        },
        amount: {
            type: Number,
            required: [true, 'Please provide the withdrawal amount'],
            min: [1, 'Amount must be at least 1'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot be more than 500 characters'],
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide the user who requested the withdrawal'],
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        processedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Indexes for faster querying
withdrawSchema.index({ business: 1, status: 1 });
withdrawSchema.index({ status: 1 });

const Withdraw = mongoose.model('Withdraw', withdrawSchema);

export default Withdraw;
