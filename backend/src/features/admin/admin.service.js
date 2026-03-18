import User from '../../models/User.model.js';
import Provider from '../../models/Provider.model.js';
import Booking from '../../models/Booking.model.js';
import SosAlert from '../../models/SosAlert.model.js';
import Review from '../../models/Review.model.js';
import { createNotification } from '../../utils/notification.helper.js';

export const getDashboardStats = async () => {
  const [
    totalUsers, totalProviders, totalBookings,
    activeBookings, completedBookings, cancelledBookings,
    pendingApproval, activeSOS, totalRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Provider.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: { $in: ['confirmed', 'departed', 'arrived', 'in_progress'] } }),
    Booking.countDocuments({ status: 'completed' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Provider.countDocuments({ isApproved: false, isBlocked: false }),
    SosAlert.countDocuments({ status: 'active' }),
    Booking.aggregate([
      { $match: { status: 'completed', platformFee: { $ne: null } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
  ]);

  const revenueAmount = totalRevenue[0]?.total || 0;

  // Bookings per category
  const bookingsByCategory = await Booking.aggregate([
    { $lookup: { from: 'providers', localField: 'providerId', foreignField: '_id', as: 'provider' } },
    { $unwind: '$provider' },
    { $group: { _id: '$provider.primaryCategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('customerId', 'fullName')
    .populate({ path: 'providerId', populate: { path: 'userId', select: 'fullName' } })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    totalUsers, totalProviders, totalBookings,
    activeBookings, completedBookings, cancelledBookings,
    pendingApproval, activeSOS,
    platformRevenue: revenueAmount,
    bookingsByCategory,
    recentBookings,
  };
};

export const getProviders = async ({ page = 1, limit = 20, status, search, category }) => {
  const query = {};
  if (status === 'pending') { query.isApproved = false; query.isBlocked = false; }
  else if (status === 'approved') { query.isApproved = true; query.isBlocked = false; }
  else if (status === 'blocked') { query.isBlocked = true; }
  if (category) query.primaryCategory = category;

  const skip = (page - 1) * limit;
  let providerQuery = Provider.find(query)
    .populate('userId', 'fullName email phone profileImage createdAt')
    .sort({ createdAt: -1 })
    .skip(skip).limit(Number(limit));

  if (search) {
    const users = await User.find({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }).select('_id');
    const userIds = users.map(u => u._id);
    query.userId = { $in: userIds };
  }

  const [providers, total] = await Promise.all([
    Provider.find(query)
      .populate('userId', 'fullName email phone profileImage createdAt')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Provider.countDocuments(query),
  ]);

  return { providers, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const approveProvider = async (providerId, adminId) => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    { isApproved: true, isBlocked: false },
    { new: true }
  ).populate('userId', 'fullName email');

  if (!provider) throw new Error('Provider not found');

  await createNotification({
    userId: provider.userId._id,
    type: 'provider_approved',
    title: 'Profile Approved!',
    message: 'Your provider profile has been approved. You can now receive bookings.',
    icon: 'check-circle',
  });

  return provider;
};

export const blockProvider = async (providerId, reason, adminId) => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    { isBlocked: true, isApproved: false, blockedReason: reason || 'Blocked by admin', availability: false },
    { new: true }
  ).populate('userId');

  if (!provider) throw new Error('Provider not found');

  // Cancel all active bookings
  await Booking.updateMany(
    { providerId, status: { $in: ['pending', 'confirmed', 'departed'] } },
    { status: 'cancelled', cancelReason: 'Provider blocked by admin', cancelledBy: 'provider', cancelledAt: new Date() }
  );

  await createNotification({
    userId: provider.userId._id,
    type: 'provider_blocked',
    title: 'Account Suspended',
    message: `Your provider account has been suspended. Reason: ${reason || 'Policy violation'}`,
    icon: 'slash',
  });

  return provider;
};

export const unblockProvider = async (providerId) => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    { isBlocked: false, blockedReason: '' },
    { new: true }
  ).populate('userId');
  if (!provider) throw new Error('Provider not found');

  await createNotification({
    userId: provider.userId._id,
    type: 'provider_approved',
    title: 'Account Reinstated',
    message: 'Your provider account has been reinstated. You can now receive bookings.',
    icon: 'check-circle',
  });

  return provider;
};

export const getCustomers = async ({ page = 1, limit = 20, search, status }) => {
  const query = { role: 'customer' };
  if (status === 'active') query.isActive = true;
  if (status === 'blocked') query.isActive = false;
  if (search) query.$or = [
    { fullName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  return { users, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const toggleUserActive = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};

export const getAllBookings = async ({ page = 1, limit = 20, status, search }) => {
  const query = {};
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customerId', 'fullName phone')
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'fullName phone' } })
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getSOSAlerts = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [alerts, total] = await Promise.all([
    SosAlert.find(query)
      .populate('customerId', 'fullName phone profileImage address')
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'fullName phone profileImage' }
      })
      .populate('bookingId')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    SosAlert.countDocuments(query),
  ]);
  return { alerts, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const resolveSOSAlert = async (alertId, adminId, status, notes) => {
  const alert = await SosAlert.findByIdAndUpdate(
    alertId,
    { status, adminNotes: notes || '', resolvedAt: new Date(), resolvedBy: adminId },
    { new: true }
  ).populate('customerId', 'fullName phone').populate({ path: 'providerId', populate: { path: 'userId' } });
  if (!alert) throw new Error('SOS alert not found');

  if (status === 'resolved' || status === 'false_alarm') {
    await createNotification({
      userId: alert.customerId._id,
      type: 'sos_resolved',
      title: status === 'resolved' ? 'SOS Resolved' : 'SOS Marked as False Alarm',
      message: `Your SOS alert has been reviewed by admin. Notes: ${notes || 'No notes'}`,
      relatedId: alertId,
      icon: 'shield',
    });
  }

  return alert;
};

export const getAnalytics = async () => {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [dailyBookings, categoryStats, revenueStats] = await Promise.all([
    Booking.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Provider.aggregate([
      { $group: { _id: '$primaryCategory', count: { $sum: 1 }, avgTrustScore: { $avg: '$trustScore' } } },
    ]),
    Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: last30Days } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$platformFee' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { dailyBookings, categoryStats, revenueStats };
};
