import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  tags: {
    onTime: { type: Boolean, default: false },
    transparent: { type: Boolean, default: false },
    noSurprises: { type: Boolean, default: false },
    workDone: { type: Boolean, default: false },
    wouldCallAgain: { type: Boolean, default: false },
  },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 500 },
  complaint: { type: String, default: '', maxlength: 1000 },
  providerReply: { type: String, default: '' },
  providerRepliedAt: { type: Date, default: null },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
