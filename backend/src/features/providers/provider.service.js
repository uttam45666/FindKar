import Provider from '../../models/Provider.model.js';
import User from '../../models/User.model.js';
import Review from '../../models/Review.model.js';
import { createNotification } from '../../utils/notification.helper.js';

export const getMyProviderProfile = async (userId) => {
  const provider = await Provider.findOne({ userId })
    .populate('userId', 'fullName email phone profileImage username')
    .populate('vouchedBy', 'shopName profileImage');
  return provider;
};

export const setupProviderProfile = async (userId, data) => {
  let provider = await Provider.findOne({ userId });
  if (!provider) {
    provider = new Provider({ userId, ...data });
  } else {
    Object.assign(provider, data);
  }
  // Check profile completeness
  provider.isProfileComplete = !!(
    provider.shopName && provider.primaryCategory &&
    provider.shopCity && provider.services?.length > 0
  );
  await provider.save();
  return provider;
};

export const updateWorkingHours = async (userId, workingHours) => {
  const provider = await Provider.findOneAndUpdate(
    { userId },
    { workingHours },
    { new: true }
  );
  if (!provider) throw new Error('Provider profile not found');
  return provider;
};

export const toggleAvailability = async (userId) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error('Provider profile not found');
  provider.availability = !provider.availability;
  await provider.save();
  return { availability: provider.availability };
};

export const addService = async (userId, serviceData) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error('Provider not found');
  provider.services.push(serviceData);
  await provider.save();
  return provider.services;
};

export const updateService = async (userId, serviceId, serviceData) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error('Provider not found');
  const svc = provider.services.id(serviceId);
  if (!svc) throw new Error('Service not found');
  Object.assign(svc, serviceData);
  await provider.save();
  return provider.services;
};

export const deleteService = async (userId, serviceId) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error('Provider not found');
  provider.services.pull(serviceId);
  await provider.save();
  return provider.services;
};

export const uploadProviderImages = async (userId, files, type) => {
  const provider = await Provider.findOne({ userId });
  if (!provider) throw new Error('Provider not found');
  const urls = files.map(f => f.path);
  if (type === 'profile') {
    provider.profileImage = urls[0];
    // also update user profile image
    await User.findByIdAndUpdate(userId, { profileImage: urls[0] });
  } else {
    provider.shopImages.push(...urls);
  }
  await provider.save();
  return provider;
};

export const getProviderListings = async ({ category, city, search, page = 1, limit = 12 }) => {
  const query = { isApproved: true, isBlocked: false, availability: true };
  if (category) query.primaryCategory = category;
  if (city) query.shopCity = { $regex: city, $options: 'i' };
  if (search) {
    query.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [providers, total] = await Promise.all([
    Provider.find(query)
      .populate('userId', 'fullName username profileImage')
      .sort({ trustScore: -1, completedJobs: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Provider.countDocuments(query),
  ]);
  return { providers, total, page: Number(page), pages: Math.ceil(total / limit) };
};

export const getProviderById = async (providerId) => {
  const provider = await Provider.findById(providerId)
    .populate('userId', 'fullName username profileImage phone')
    .populate('vouchedBy', 'shopName profileImage userId');
  if (!provider) throw new Error('Provider not found');

  const reviews = await Review.find({ providerId })
    .populate('customerId', 'fullName profileImage username')
    .sort({ createdAt: -1 })
    .limit(10);

  return { provider, reviews };
};

export const vouchForProvider = async (voucherUserId, targetProviderId) => {
  const voucherProvider = await Provider.findOne({ userId: voucherUserId });
  if (!voucherProvider) throw new Error('You must be a verified provider to vouch');
  if (!voucherProvider.isVerified) throw new Error('Only verified providers can vouch');

  const target = await Provider.findById(targetProviderId);
  if (!target) throw new Error('Target provider not found');

  const alreadyVouched = target.vouchedBy.includes(voucherProvider._id);
  if (alreadyVouched) throw new Error('You have already vouched for this provider');

  target.vouchedBy.push(voucherProvider._id);
  if (target.vouchedBy.length >= 1 && target.aadhaarVerified) {
    target.isVerified = true;
  }
  await target.save();

  const targetUser = await User.findById(target.userId);
  if (targetUser) {
    await createNotification({
      userId: targetUser._id,
      type: 'provider_approved',
      title: 'You received a vouch!',
      message: `${voucherProvider.shopName || 'A verified provider'} has vouched for you.`,
      relatedId: target._id.toString(),
      icon: 'shield',
    });
  }
  return target;
};

export const incrementShare = async (providerId) => {
  const provider = await Provider.findByIdAndUpdate(
    providerId,
    { $inc: { neighborShares: 1 } },
    { new: true }
  );
  return { neighborShares: provider.neighborShares };
};
