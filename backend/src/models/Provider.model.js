import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  priceType: { type: String, enum: ['fixed', 'starting', 'range'], default: 'starting' },
  priceMax: { type: Number, default: null },
  image: { type: String, default: '' },
});

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, default: '' },
  shopPhone: { type: String, default: '' },
  shopAddress: { type: String, default: '' },
  shopCity: { type: String, default: '' },
  shopState: { type: String, default: '' },
  shopWebsite: { type: String, default: '' },
  bio: { type: String, default: '' },
  experience: { type: Number, default: 0 }, // years
  primaryCategory: {
    type: String,
    enum: ['plumber', 'electrician', 'carpenter', 'ac_technician', 'painter', 'maid', 'cook', 'driver'],
    required: true,
  },
  additionalCategories: [{
    type: String,
    enum: ['plumber', 'electrician', 'carpenter', 'ac_technician', 'painter', 'maid', 'cook', 'driver'],
  }],
  services: [serviceSchema],
  serviceArea: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  coverageRadius: { type: Number, default: 5 },
  profileImage: { type: String, default: '' },
  shopImages: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: true }, // mock
  isApproved: { type: Boolean, default: false }, // admin approves
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String, default: '' },
  vouchedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  completedJobs: { type: Number, default: 0 },
  cancelledJobs: { type: Number, default: 0 },
  neighborShares: { type: Number, default: 0 },
  tagStats: {
    onTime: { type: Number, default: 0 },
    transparent: { type: Number, default: 0 },
    noSurprises: { type: Number, default: 0 },
    workDone: { type: Number, default: 0 },
    wouldCallAgain: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  availability: { type: Boolean, default: true },
  workingHours: {
    monday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    friday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isOff: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isOff: { type: Boolean, default: true } },
  },
  isProfileComplete: { type: Boolean, default: false },
  totalEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
}, { timestamps: true });

providerSchema.index({ serviceArea: '2dsphere' });
providerSchema.index({ primaryCategory: 1, isApproved: 1, isBlocked: 1, availability: 1 });

// Recalculate trust score
providerSchema.methods.recalculateTrustScore = function () {
  const stats = this.tagStats;
  if (stats.totalReviews === 0) { this.trustScore = 0; return; }
  const total = stats.onTime + stats.transparent + stats.noSurprises + stats.workDone + stats.wouldCallAgain;
  const max = stats.totalReviews * 5;
  this.trustScore = Math.round((total / max) * 100);
};

const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
