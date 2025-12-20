import Withdraw from '../models/Withdraw.js';
import Business from '../models/Business.js';

// Get all withdraws (Admin)
export const getAllWithdraws = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const withdraws = await Withdraw.find()
            .populate('business', 'name owner')
            .populate('requestedBy', 'name email')
            .populate('processedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Withdraw.countDocuments();

        res.status(200).json({
            status: 'success',
            data: withdraws,
            paginatorInfo: {
                total,
                count: withdraws.length,
                currentPage: page,
                lastPage: Math.ceil(total / limit),
                perPage: limit,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new withdraw request (Business Owner)
export const createWithdraw = async (req, res) => {
    try {
        const { amount, businessId, notes } = req.body;

        // Verify business ownership
        const business = await Business.findOne({
            _id: businessId,
            owner: req.user._id
        });

        if (!business) {
            return res.status(403).json({
                message: 'You are not authorized to request a withdraw for this business'
            });
        }

        const withdraw = await Withdraw.create({
            business: businessId,
            amount,
            notes,
            requestedBy: req.user._id,
        });

        res.status(201).json({
            status: 'success',
            data: withdraw,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update withdraw status (Admin)
export const updateWithdrawStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const withdraw = await Withdraw.findById(id);

        if (!withdraw) {
            return res.status(404).json({ message: 'Withdraw request not found' });
        }

        withdraw.status = status;
        withdraw.processedBy = req.user._id;
        withdraw.processedAt = Date.now();

        if (notes) {
            withdraw.notes = notes; // Ideally append or handle admin notes separately if needed
        }

        await withdraw.save();

        res.status(200).json({
            status: 'success',
            data: withdraw,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get my withdraws (Business Owner)
export const getMyWithdraws = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        // Find businesses owned by user
        const businesses = await Business.find({ owner: req.user._id });
        const businessIds = businesses.map(b => b._id);

        const withdraws = await Withdraw.find({ business: { $in: businessIds } })
            .populate('business', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Withdraw.countDocuments({ business: { $in: businessIds } });

        res.status(200).json({
            status: 'success',
            data: withdraws,
            paginatorInfo: {
                total,
                count: withdraws.length,
                currentPage: page,
                lastPage: Math.ceil(total / limit),
                perPage: limit,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
