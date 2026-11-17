import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditLog } from '../models/System.js';

const JWT_SECRET = process.env.JWT_SECRET || 'moon_light_villa_super_secret_jwt_key_2026';

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    // Super Admin has access to everything
    if (req.user.role === 'Super Admin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user.role}' is not authorized to access this module.`
    });
  };
};

export const createAuditLog = async ({ req, action, module, targetId, details }) => {
  try {
    await AuditLog.create({
      user: req?.user?._id || null,
      userName: req?.user?.name || 'Public / System',
      userRole: req?.user?.role || 'Guest',
      action,
      module,
      targetId: targetId ? String(targetId) : '',
      details: details || {},
      ipAddress: req?.ip || req?.headers['x-forwarded-for'] || ''
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};
