import { Role, User } from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

// Create a new custom role
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *         - displayName
 *       properties:
 *         name:
 *           type: string
 *           description: Unique role identifier
 *           example: "content-manager"
 *         displayName:
 *           type: string
 *           description: Human-readable role name
 *           example: "Content Manager"
 *         description:
 *           type: string
 *           description: Role description
 *           example: "Can manage content but not users"
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of permissions for this role
 *           example: ["content:read", "content:create", "content:update"]
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role (Admin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       $ref: '#/components/schemas/Role'
 *       400:
 *         description: Validation error or duplicate role name
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        status: 'error',
        message: 'Role with this name already exists',
      });
    }

    const role = await Role.create({
      name,
      displayName,
      description,
      permissions,
      createdBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isSystem: { $ne: true } })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        roles,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const { displayName, description, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { displayName, description, permissions },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found',
      });
    }

    // Check if it's a system role
    if (role.isSystem) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot modify system roles',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found',
      });
    }

    // Check if it's a system role
    if (role.isSystem) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete system roles',
      });
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ customRole: req.params.id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete role that is assigned to users',
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Assign role to user
export const assignRoleToUser = async (req, res) => {
  try {
    const { roleId } = req.body;
    const userId = req.params.id;

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found',
      });
    }

    // Check if user exists
    const user = await User.findByIdAndUpdate(
      userId,
      { customRole: roleId },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Remove role from user
export const removeRoleFromUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { customRole: null },
      { new: true, runValidators: false }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Get users with specific role
export const getUsersWithRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const users = await User.find({ customRole: roleId })
      .select('name email role customRole permissions isApproved isBanned')
      .populate('customRole', 'name displayName permissions');

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
