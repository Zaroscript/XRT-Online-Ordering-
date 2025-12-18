import Business from '../models/Business.js';
import BusinessSettings from '../models/BusinessSettings.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Create a new business
 * @route   POST /api/v1/businesses
 * @access  Private
 */
export const createBusiness = async (req, res) => {
  try {
    const {
      name,
      legal_name,
      primary_content_name,
      primary_content_email,
      primary_content_phone,
      address,
      location,
      google_maps_verification,
      social_media,
      header_info,
      footer_text,
      messages,
      timezone,
    } = req.body;

    // Create business
    const business = await Business.create({
      id: uuidv4(),
      owner: req.user._id,
      name,
      legal_name,
      primary_content_name,
      primary_content_email,
      primary_content_phone,
      address,
      location,
      google_maps_verification,
      social_media,
      header_info,
      footer_text,
      messages,
      timezone,
    });

    // Automatically create default settings for the business
    await BusinessSettings.create({
      business: business._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        business,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @desc    Get all businesses owned by the current user
 * @route   GET /api/v1/businesses
 * @access  Private
 */
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user._id });

    res.status(200).json({
      status: 'success',
      results: businesses.length,
      data: {
        businesses,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @desc    Get single business by ID
 * @route   GET /api/v1/businesses/:id
 * @access  Private
 */
export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found or access denied',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        business,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

/**
 * @desc    Update business
 * @route   PATCH /api/v1/businesses/:id
 * @access  Private
 */
export const updateBusiness = async (req, res) => {
  try {
    const changes = { ...req.body };
    delete changes.id;
    delete changes.owner;
    delete changes.created_at;

    const business = await Business.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      changes,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!business) {
      return res.status(404).json({
        status: 'error',
        message: 'Business not found or access denied',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        business,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};
