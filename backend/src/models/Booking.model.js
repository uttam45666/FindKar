import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  serviceType: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, default: '' },
  problemDescription: { type: String, default: '' },
  alternateContact: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'departed', 'arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  otp: { type: String, default: null }, // generated when arrived
  otpVerified: { type: Boolean, default: false },
  trackingToken: { type: String, default: () => uuidv4() },
  jobAmount: { type: Number, default: null },
  platformFee: { type: Number, default: null },
  sosTriggered: { type: Boolean, default: false },
  sosTimestamp: { type: Date, default: null },
  sosLocation: { type: String, default: '' },
  reviewed: { type: Boolean, default: false },
  cancelReason: { type: String, default: '' },
  cancelledBy: { type: String, enum: ['customer', 'provider', null], default: null },
  cancelledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
}, { timestamps: true });

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ trackingToken: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
