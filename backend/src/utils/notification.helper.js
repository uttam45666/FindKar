import Notification from '../models/Notification.model.js';

export const createNotification = async ({ userId, type, title, message, relatedId = '', icon = 'bell' }) => {
  try {
    await Notification.create({ userId, type, title, message, relatedId, icon });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

export const notifyBookingStatus = async ({ booking, customerUserId, providerUserId, status }) => {
  const messages = {
    confirmed: {
      customer: { title: 'Booking Confirmed', message: 'Your booking has been confirmed by the provider.', icon: 'check-circle' },
      provider: { title: 'New Booking Accepted', message: 'You have accepted a new booking.', icon: 'briefcase' },
    },
    departed: {
      customer: { title: 'Provider On The Way', message: 'The provider has departed and is heading to your location.', icon: 'truck' },
      provider: null,
    },
    arrived: {
      customer: { title: 'Provider Arrived', message: 'The provider has arrived. Share the OTP to begin work.', icon: 'map-pin' },
      provider: null,
    },
    in_progress: {
      customer: { title: 'Work In Progress', message: 'Work has started at your location.', icon: 'tool' },
      provider: { title: 'Work Started', message: 'You have started the job. Complete it well!', icon: 'tool' },
    },
    completed: {
      customer: { title: 'Job Completed', message: 'Your service is complete. Please leave a review!', icon: 'star' },
      provider: { title: 'Job Completed', message: 'Job marked as complete. Earnings updated.', icon: 'dollar-sign' },
    },
    cancelled: {
      customer: { title: 'Booking Cancelled', message: 'Your booking has been cancelled.', icon: 'x-circle' },
      provider: { title: 'Booking Cancelled', message: 'A booking has been cancelled.', icon: 'x-circle' },
    },
  };

  const map = messages[status];
  if (!map) return;

  const bookingId = booking._id.toString();

  if (map.customer && customerUserId) {
    await createNotification({ userId: customerUserId, type: `booking_${status}`, ...map.customer, relatedId: bookingId });
  }
  if (map.provider && providerUserId) {
    await createNotification({ userId: providerUserId, type: `booking_${status}`, ...map.provider, relatedId: bookingId });
  }
};
