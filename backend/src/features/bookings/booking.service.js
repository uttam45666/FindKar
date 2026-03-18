import Booking from '../../models/Booking.model.js';
import Provider from '../../models/Provider.model.js';
import User from '../../models/User.model.js';
import SosAlert from '../../models/SosAlert.model.js';
import { notifyBookingStatus, createNotification } from '../../utils/notification.helper.js';

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export const createBooking = async (customerId, data) => {
  const { providerId, serviceType, scheduledAt, address, city, state, pincode, problemDescription, alternateContact } = data;

  const provider = await Provider.findById(providerId);
  if (!provider) throw new Error('Provider not found');
  if (!provider.isApproved || provider.isBlocked) throw new Error('Provider is not available');
  if (!provider.availability) throw new Error('Provider is currently offline');

  // Check provider has no active booking
  const activeProviderBooking = await Booking.findOne({
    providerId,
    status: { $in: ['confirmed', 'departed', 'arrived', 'in_progress'] },
  });
  if (activeProviderBooking) throw new Error('Provider is currently busy with another job');

  // Check customer active bookings (max 2)
  const activeCustomerBookings = await Booking.countDocuments({
    customerId,
    status: { $in: ['pending', 'confirmed', 'departed', 'arrived', 'in_progress'] },
  });
  if (activeCustomerBookings >= 2) throw new Error('You already have 2 active bookings');

  const booking = await Booking.create({
    customerId, providerId, serviceType, scheduledAt,
    address, city, state, pincode: pincode || '',
    problemDescription: problemDescription || '',
    alternateContact: alternateContact || '',
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Booking placed by customer' }],
  });

  const providerUser = await User.findById(provider.userId);
  if (providerUser) {
    await createNotification({
      userId: providerUser._id,
      type: 'booking_placed',
      title: 'New Booking Request',
      message: `New booking request for ${serviceType}. Please confirm or decline.`,
      relatedId: booking._id.toString(),
      icon: 'briefcase',
    });
  }

  return booking;
};

export const getCustomerBookings = async (customerId, { status, page = 1, limit = 10 }) => {
  const query = { customerId };
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate({ path: 'providerId', populate: { path: 'userId', select: 'fullName phone profileImage' } })
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getProviderBookings = async (providerUserId, { status, page = 1, limit = 10 }) => {
  const provider = await Provider.findOne({ userId: providerUserId });
  if (!provider) throw new Error('Provider profile not found');

  const query = { providerId: provider._id };
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customerId', 'fullName phone profileImage address')
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)),
    Booking.countDocuments(query),
  ]);
  return { bookings, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getBookingById = async (bookingId, userId, role) => {
  const booking = await Booking.findById(bookingId)
    .populate('customerId', 'fullName phone profileImage address')
    .populate({ path: 'providerId', populate: { path: 'userId', select: 'fullName phone profileImage' } });
  if (!booking) throw new Error('Booking not found');

  // Access control
  if (role === 'customer' && booking.customerId._id.toString() !== userId.toString()) {
    throw new Error('Access denied');
  }
  if (role === 'provider') {
    const provider = await Provider.findOne({ userId });
    if (!provider || booking.providerId._id.toString() !== provider._id.toString()) {
      throw new Error('Access denied');
    }
  }
  return booking;
};

export const updateBookingStatus = async (providerUserId, bookingId, status, extra = {}) => {
  const provider = await Provider.findOne({ userId: providerUserId });
  if (!provider) throw new Error('Provider not found');

  const booking = await Booking.findOne({ _id: bookingId, providerId: provider._id });
  if (!booking) throw new Error('Booking not found');

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['departed', 'cancelled'],
    departed: ['arrived'],
    arrived: ['in_progress'],
    in_progress: ['completed'],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw new Error(`Cannot transition from ${booking.status} to ${status}`);
  }

  // Cancellation: not allowed after departed
  if (status === 'cancelled' && ['departed', 'arrived', 'in_progress'].includes(booking.status)) {
    throw new Error('Cannot cancel after departing');
  }

  booking.status = status;
  booking.statusHistory.push({ status, note: extra.note || `Status updated to ${status}` });

  // Generate OTP when arrived
  if (status === 'arrived') {
    booking.otp = generateOTP();
  }

  // Handle completion
  if (status === 'completed') {
    if (!extra.jobAmount) throw new Error('Job amount is required to mark as complete');
    booking.jobAmount = extra.jobAmount;
    booking.platformFee = Math.round(extra.jobAmount * 0.05 * 100) / 100;
    booking.completedAt = new Date();
    provider.completedJobs += 1;
    provider.totalEarnings += booking.jobAmount;
    await provider.save();
  }

  if (status === 'cancelled') {
    booking.cancelReason = extra.cancelReason || '';
    booking.cancelledBy = 'provider';
    booking.cancelledAt = new Date();
    // Affect provider score
    provider.cancelledJobs += 1;
    await provider.save();
  }

  await booking.save();
  await notifyBookingStatus({
    booking,
    customerUserId: booking.customerId,
    providerUserId: provider.userId,
    status,
  });

  return booking;
};

export const verifyOTP = async (providerUserId, bookingId, otp) => {
  const provider = await Provider.findOne({ userId: providerUserId });
  if (!provider) throw new Error('Provider not found');

  const booking = await Booking.findOne({ _id: bookingId, providerId: provider._id });
  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'arrived') throw new Error('OTP can only be verified when status is arrived');
  if (booking.otp !== otp) throw new Error('Incorrect OTP');

  booking.otpVerified = true;
  booking.status = 'in_progress';
  booking.statusHistory.push({ status: 'in_progress', note: 'OTP verified, work started' });
  await booking.save();

  await notifyBookingStatus({
    booking,
    customerUserId: booking.customerId,
    providerUserId: provider.userId,
    status: 'in_progress',
  });

  return booking;
};

export const cancelByCustomer = async (customerId, bookingId, cancelReason) => {
  const booking = await Booking.findOne({ _id: bookingId, customerId });
  if (!booking) throw new Error('Booking not found');

  const cancellableStatuses = ['pending', 'confirmed'];
  if (!cancellableStatuses.includes(booking.status)) {
    throw new Error('Booking cannot be cancelled at this stage');
  }

  booking.status = 'cancelled';
  booking.cancelReason = cancelReason || 'Cancelled by customer';
  booking.cancelledBy = 'customer';
  booking.cancelledAt = new Date();
  booking.statusHistory.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await booking.save();

  const provider = await Provider.findById(booking.providerId);
  if (provider) {
    await notifyBookingStatus({
      booking,
      customerUserId: customerId,
      providerUserId: provider.userId,
      status: 'cancelled',
    });
  }
  return booking;
};

export const triggerSOS = async (customerId, bookingId, location) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  if (booking.customerId.toString() !== customerId.toString()) throw new Error('Access denied');

  booking.sosTriggered = true;
  booking.sosTimestamp = new Date();
  booking.sosLocation = location || '';
  await booking.save();

  const provider = await Provider.findByIdAndUpdate(
    booking.providerId,
    { isBlocked: true, blockedReason: 'Auto-blocked due to SOS trigger' },
    { new: true }
  );

  const sosAlert = await SosAlert.create({
    bookingId: booking._id,
    customerId,
    providerId: booking.providerId,
    location: location || '',
    address: booking.address,
    status: 'active',
  });

  // Notify all admins
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      type: 'sos_alert',
      title: '🚨 SOS ALERT',
      message: `SOS triggered for booking #${booking._id.toString().slice(-6).toUpperCase()}. Provider auto-blocked.`,
      relatedId: sosAlert._id.toString(),
      icon: 'alert-triangle',
    });
  }

  return { booking, sosAlert };
};

export const getActiveBooking = async (userId, role) => {
  let query = {};
  if (role === 'customer') {
    query = { customerId: userId, status: { $in: ['pending', 'confirmed', 'departed', 'arrived', 'in_progress'] } };
  } else if (role === 'provider') {
    const provider = await Provider.findOne({ userId });
    if (!provider) return null;
    query = { providerId: provider._id, status: { $in: ['confirmed', 'departed', 'arrived', 'in_progress'] } };
  }
  const booking = await Booking.findOne(query)
    .populate('customerId', 'fullName phone profileImage address')
    .populate({ path: 'providerId', populate: { path: 'userId', select: 'fullName phone profileImage' } })
    .sort({ createdAt: -1 });
  return booking;
};
