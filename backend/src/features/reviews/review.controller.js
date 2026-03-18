import * as reviewService from './review.service.js';

export const submitReview = async (req, res, next) => {
  try {
    const { bookingId, tags, comment } = req.body;
    const review = await reviewService.submitReview(req.user._id, bookingId, tags, comment);
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

export const replyToReview = async (req, res, next) => {
  try {
    const review = await reviewService.replyToReview(req.user._id, req.params.id, req.body.reply);
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

export const getProviderReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProviderReviews(req.params.providerId, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
