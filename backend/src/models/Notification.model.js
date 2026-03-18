import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'booking_placed', 'booking_confirmed', 'booking_departed', 'booking_arrived',
      'booking_in_progress', 'booking_completed', 'booking_cancelled',
      'review_received', 'review_reply', 'sos_alert', 'sos_resolved',
      'admin_message', 'platform_update', 'provider_approved', 'provider_blocked',
      'otp_generated', 'account_update',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  icon: { type: String, default: 'bell' },
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
