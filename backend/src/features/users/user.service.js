import User from '../../models/User.model.js';
import { upload, cloudinary } from '../../config/cloudinary.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const updateProfile = async (userId, updates) => {
  const allowed = ['fullName', 'phone', 'address', 'profileImage'];
  const filtered = {};
  allowed.forEach(k => { if (updates[k] !== undefined) filtered[k] = updates[k]; });
  const user = await User.findByIdAndUpdate(userId, filtered, { new: true, runValidators: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

export const uploadProfileImage = async (userId, file) => {
  if (!file) throw new Error('No file uploaded');
  const user = await User.findByIdAndUpdate(
    userId,
    { profileImage: file.path },
    { new: true }
  ).select('-password');
  return user;
};

export const getAllUsers = async ({ page = 1, limit = 20, role, search }) => {
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { fullName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { username: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  return { users, total, page: Number(page), pages: Math.ceil(total / limit) };
};
