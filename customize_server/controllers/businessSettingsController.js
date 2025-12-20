import Business from '../models/Business.js';
import BusinessSettings from '../models/BusinessSettings.js';

// Helper to verify ownership
const verifyBusinessOwnership = async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required for this operation',
    });
  }

  let businessId = req.headers['x-business-id'];

  if (!businessId) {
    console.log('No x-business-id header, attempting fallback for user:', req.user._id);
    const firstBusiness = await Business.findOne({ owner: req.user._id }).lean();
    if (firstBusiness) {
      console.log('Found fallback business:', firstBusiness._id);
      businessId = firstBusiness._id;
    } else {
      console.log('No businesses found for user');
      // For GET requests, we can proceed with businessId = null and handle it in the controller
      if (req.method === 'GET') {
        req.business = null;
        return next();
      }
      return res.status(400).json({
        status: 'error',
        message: 'x-business-id header is required and no default business found',
      });
    }
  }

  const business = await Business.findOne({
    _id: businessId,
    owner: req.user._id,
  }).lean();

  if (!business) {
    if (req.method === 'GET') {
      req.business = null;
      return next();
    }
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
    // 1. Verify ownership helper call
    await verifyBusinessOwnership(req, res, async () => {
      let settings = null;

      if (req.business) {
        // 2. Fetch settings for specific business
        settings = await BusinessSettings.findOne({
          business: req.business._id,
        }).lean();
      }

      // 3. Fallback to ANY settings in the DB if none found for this user/business
      if (!settings) {
        console.log('No specific settings found, attempting to find any settings in the DB as fallback');
        settings = await BusinessSettings.findOne().lean();
      }

      // 4. Ultimate fallback to default structure if DB is empty
      if (!settings) {
        console.log('No settings found in DB at all, returning basic default structure');
        settings = {
          siteTitle: 'XRT System',
          currency: 'USD',
          options: {
            logo: {},
            currency: 'USD',
            siteTitle: 'XRT System',
            contactDetails: {
              contact: '',
              website: ''
            }
          }
        };
      }

      res.status(200).json({
        status: 'success',
        data: {
          settings,
        },
      });
    });
  } catch (err) {
    console.error('Error in getBusinessSettings:', err);
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
