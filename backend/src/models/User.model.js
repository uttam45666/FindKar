import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, default: null },
  phone: { type: String, required: true, trim: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  address: {
    line: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  profileImage: { type: String, default: '' },
  sessions: [{
    sessionId: { type: String, required: true },
    deviceInfo: { type: String, default: 'Unknown device' },
    ipAddress: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Compound unique index: email + role (allows same email across roles)
userSchema.index({ email: 1, role: 1 }, { unique: true });
userSchema.index({ phone: 1, role: 1 }, { unique: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.sessions;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
