import Review from '../../models/Review.model.js';
import Booking from '../../models/Booking.model.js';
import Provider from '../../models/Provider.model.js';
import { createNotification } from '../../utils/notification.helper.js';

export const submitReview = async (customerId, bookingId, tags, comment) => {
  const booking = await Booking.findOne({ _id: bookingId, customerId, status: 'completed' });
  if (!booking) throw new Error('Booking not found or not completed');
  if (booking.reviewed) throw new Error('Review already submitted for this booking');

  const existing = await Review.findOne({ bookingId });
  if (existing) throw new Error('Review already exists');

  const review = await Review.create({
    bookingId, customerId,
    providerId: booking.providerId,
    tags, comment: comment || '',
  });

  booking.reviewed = true;
  await booking.save();

  // Update provider tag stats
  const provider = await Provider.findById(booking.providerId);
  if (provider) {
    provider.tagStats.totalReviews += 1;
    if (tags.onTime) provider.tagStats.onTime += 1;
    if (tags.transparent) provider.tagStats.transparent += 1;
    if (tags.noSurprises) provider.tagStats.noSurprises += 1;
    if (tags.workDone) provider.tagStats.workDone += 1;
    if (tags.wouldCallAgain) provider.tagStats.wouldCallAgain += 1;
    provider.recalculateTrustScore();
    await provider.save();

    // Notify provider
    const providerUser = await import('../../models/User.model.js').then(m => m.default.findById(provider.userId));
    if (providerUser) {
      await createNotification({
        userId: providerUser._id,
        type: 'review_received',
        title: 'New Review Received',
        message: `A customer has left a review for your service.`,
        relatedId: review._id.toString(),
        icon: 'star',
      });
    }
  }

  return review;
};

export const replyToReview = async (providerUserId, reviewId, reply) => {
  const provider = await Provider.findOne({ userId: providerUserId });
  if (!provider) throw new Error('Provider not found');

  const review = await Review.findOne({ _id: reviewId, providerId: provider._id });
  if (!review) throw new Error('Review not found');
  if (review.providerReply) throw new Error('Already replied to this review');

  review.providerReply = reply;
  review.providerRepliedAt = new Date();
  await review.save();

  await createNotification({
    userId: review.customerId,
    type: 'review_reply',
    title: 'Provider Replied to Your Review',
    message: 'The provider has replied to your review.',
    relatedId: review._id.toString(),
    icon: 'message-circle',
  });

  return review;
};

export const getProviderReviews = async (providerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ providerId })
      .populate('customerId', 'fullName profileImage username')
      .sort({ createdAt: -1 })
      .skip(skip).limit(Number(limit)),
    Review.countDocuments({ providerId }),
  ]);
  return { reviews, total, page: Number(page), pages: Math.ceil(total / limit) };
};
