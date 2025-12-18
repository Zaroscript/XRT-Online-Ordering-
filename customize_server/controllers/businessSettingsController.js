import Business from '../models/Business.js';
import BusinessSettings from '../models/BusinessSettings.js';

// Helper to verify ownership
const verifyBusinessOwnership = async (req, res, next) => {
  const businessId = req.headers['x-business-id'];

  if (!businessId) {
    return res.status(400).json({
      status: 'error',
      message: 'x-business-id header is required',
    });
  }

  const business = await Business.findOne({
    _id: businessId,
    owner: req.user._id,
  });

  if (!business) {
    return res.status(404).json({
      status: 'error',
      message: 'Business not found or access denied',
    });
  }

  req.business = business;
  next();
};

/**
 * @desc    Get business settings
 * @route   GET /api/v1/business-settings
 * @access  Private
 */
export const getBusinessSettings = async (req, res) => {
  try {
    // 1. Verify ownership
    await verifyBusinessOwnership(req, res, async () => {
      // 2. Fetch settings
      const settings = await BusinessSettings.findOne({
        business: req.business._id,
      });

      if (!settings) {
        return res.status(404).json({
          status: 'error',
          message: 'Settings not found for this business',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          settings,
        },
      });
    });
  } catch (err) {
    // Check if headers requested but not sent (handled in helper) or other errors
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};

/**
 * @desc    Update business settings
 * @route   PATCH /api/v1/business-settings
 * @access  Private
 */
export const updateBusinessSettings = async (req, res) => {
  try {
    // 1. Verify ownership
    await verifyBusinessOwnership(req, res, async () => {
      // 2. Update settings
      const settings = await BusinessSettings.findOneAndUpdate(
        { business: req.business._id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!settings) {
        return res.status(404).json({
          status: 'error',
          message: 'Settings not found for this business',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          settings,
        },
      });
    });
  } catch (err) {
    if (!res.headersSent) {
      res.status(400).json({
        status: 'error',
        message: err.message,
      });
    }
  }
};
