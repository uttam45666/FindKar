import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import User from '../../models/User.model.js';
import { createNotification } from '../../utils/notification.helper.js';
import AppError from '../../utils/AppError.js';
import logger from '../../config/logger.js';

// In-memory OTP store: key = `${phone}_${role}`, value = { otp, expiresAt }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (user, sessionId) => jwt.sign(
  { id: user._id, role: user.role, sid: sessionId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const getClientMeta = (req = {}) => {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || '';
  return {
    deviceInfo: req.get?.('user-agent') || 'Unknown device',
    ipAddress: ip,
  };
};

const createSessionForUser = async (user, req = {}) => {
  const sessionId = randomUUID();
  const { deviceInfo, ipAddress } = getClientMeta(req);

  user.sessions.push({
    sessionId,
    deviceInfo,
    ipAddress,
    createdAt: new Date(),
    lastActiveAt: new Date(),
  });

  await user.save();
  return sessionId;
};

export const checkUsername = async (username) => {
  logger.debug('auth.checkUsername.start', { username: username?.toLowerCase?.() });
  const exists = await User.findOne({ username: username.toLowerCase() });
  logger.debug('auth.checkUsername.complete', { available: !exists });
  return { available: !exists };
};

export const sendOTP = async ({ phone, role, userId }) => {
  let resolvedPhone = phone;

  if (userId) {
    const user = await User.findById(userId).select('phone role');
    if (!user) throw new AppError('User not found', 404, true);
    if (role && user.role !== role) throw new AppError('Role mismatch for this user', 400, true);
    resolvedPhone = user.phone;
  }

  if (!resolvedPhone) throw new AppError('Phone is required', 400, true);

  const otp = generateOTP();
  const key = `${resolvedPhone}_${role}`;
  otpStore.set(key, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  logger.info('auth.otp.generated', {
    role,
    phoneMasked: `${String(resolvedPhone).slice(0, 2)}******${String(resolvedPhone).slice(-2)}`,
    expiresInSeconds: 600,
  });

  const response = { success: true, message: 'OTP sent' };
  if ((process.env.NODE_ENV || 'development') === 'development') {
    response.otp = otp;
  }
  return response;
};

export const registerUser = async ({ fullName, username, email, password, phone, role, address }, req = {}) => {
  logger.info('auth.register.start', { email: email?.toLowerCase?.(), role });
  // Check if email+role combo exists
  const existingEmail = await User.findOne({ email: email.toLowerCase(), role });
  if (existingEmail) throw new AppError('Email already registered for this role', 409, true);

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) throw new AppError('Username already taken', 409, true);

  const user = await User.create({
    fullName, username: username.toLowerCase(),
    email: email.toLowerCase(), password, phone, role,
    address: address || {},
    isPhoneVerified: true, // set after OTP in flow
  });

  await createNotification({
    userId: user._id,
    type: 'platform_update',
    title: 'Welcome to Findkar!',
    message: `Welcome ${fullName}! Your account has been created successfully.`,
    icon: 'home',
  });

  const sessionId = await createSessionForUser(user, req);
  const token = signToken(user, sessionId);
  logger.info('auth.register.complete', { userId: user._id.toString(), role: user.role });
  return { token, sessionId, user: user.toSafeObject() };
};

export const loginWithEmail = async ({ email, password, role }) => {
  logger.info('auth.login.start', { email: email?.toLowerCase?.(), role });
  const user = await User.findOne({ email: email.toLowerCase(), role });
  if (!user) throw new AppError('No account found with this email for the selected role', 404, true);
  if (!user.isActive) throw new AppError('Account has been deactivated', 403, true);
  const valid = await user.comparePassword(password);
  if (!valid) throw new AppError('Incorrect password', 401, true);
  logger.info('auth.login.passwordVerified', { userId: user._id.toString(), role: user.role });
  return { userId: user._id, phoneMasked: `${String(user.phone).slice(0, 2)}******${String(user.phone).slice(-2)}`, requiresOTP: true };
};

export const verifyOTPAndLogin = async ({ phone, otp, role, userId }, req = {}) => {
  logger.info('auth.verifyOtp.start', { role, hasUserId: Boolean(userId) });
  // For demo: accept any 6-digit OTP, or match stored one
  const key = `${phone}_${role}`;
  const stored = otpStore.get(key);

  let valid = false;
  if (stored && stored.otp === otp && Date.now() < stored.expiresAt) {
    valid = true;
    otpStore.delete(key);
  } else if (otp && otp.length === 6) {
    // Demo fallback: accept any 6-digit OTP
    valid = true;
  }

  if (!valid) throw new AppError('Invalid or expired OTP', 401, true);

  let user;
  if (userId) {
    user = await User.findById(userId);
  } else {
    user = await User.findOne({ phone, role });
  }
  if (!user) throw new AppError('User not found', 404, true);
  if (!user.isActive) throw new AppError('Account deactivated', 403, true);

  user.isPhoneVerified = true;
  await user.save();

  const sessionId = await createSessionForUser(user, req);
  const token = signToken(user, sessionId);
  logger.info('auth.verifyOtp.complete', { userId: user._id.toString(), role: user.role });
  return { token, sessionId, user: user.toSafeObject() };
};

export const verifyForPasswordReset = async ({ email, phone, otp, role }) => {
  logger.info('auth.reset.verify.start', { email: email?.toLowerCase?.(), role });
  const key = `${phone}_${role}`;
  const stored = otpStore.get(key);
  let valid = stored && stored.otp === otp && Date.now() < stored.expiresAt;
  if (!valid && otp && otp.length === 6) valid = true; // demo fallback

  if (!valid) throw new AppError('Invalid OTP', 401, true);
  otpStore.delete(key);

  const user = await User.findOne({ email: email.toLowerCase(), role });
  if (!user) throw new AppError('User not found', 404, true);

  const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });
  logger.info('auth.reset.verify.complete', { userId: user._id.toString(), role: user.role });
  return { resetToken };
};

export const resetPassword = async ({ resetToken, newPassword }) => {
  logger.info('auth.resetPassword.start');
  const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  if (decoded.purpose !== 'reset') throw new AppError('Invalid reset token', 401, true);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found', 404, true);
  user.password = newPassword;
  user.sessions = [];
  await user.save();
  logger.info('auth.resetPassword.complete', { userId: user._id.toString() });
  return { success: true };
};

export const listSessions = async (userId, currentSessionId) => {
  const user = await User.findById(userId).select('sessions');
  if (!user) throw new AppError('User not found', 404, true);

  const sessions = (user.sessions || [])
    .sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt))
    .map((s) => ({
      sessionId: s.sessionId,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.sessionId === currentSessionId,
    }));

  return {
    sessions,
    total: sessions.length,
    otherCount: Math.max(sessions.length - 1, 0),
  };
};

export const logoutSessions = async ({ userId, currentSessionId, mode = 'current', sessionIds = [] }) => {
  const user = await User.findById(userId).select('sessions');
  if (!user) throw new AppError('User not found', 404, true);

  let removed = 0;

  if (mode === 'all') {
    removed = user.sessions.length;
    user.sessions = [];
  } else if (mode === 'selected') {
    const selected = new Set(sessionIds || []);
    const before = user.sessions.length;
    user.sessions = user.sessions.filter((s) => !selected.has(s.sessionId));
    removed = before - user.sessions.length;
  } else {
    const before = user.sessions.length;
    user.sessions = user.sessions.filter((s) => s.sessionId !== currentSessionId);
    removed = before - user.sessions.length;
  }

  await user.save();

  logger.info('auth.logout.complete', {
    userId: userId.toString(),
    mode,
    removed,
    remaining: user.sessions.length,
  });

  return {
    message: 'Logout successful',
    removed,
    remaining: user.sessions.length,
  };
};
