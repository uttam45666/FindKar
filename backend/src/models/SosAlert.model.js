import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  location: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, enum: ['active', 'resolved', 'false_alarm'], default: 'active' },
  adminNotes: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

const SosAlert = mongoose.model('SosAlert', sosAlertSchema);
export default SosAlert;
