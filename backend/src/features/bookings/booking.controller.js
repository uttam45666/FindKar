import * as bookingService from './booking.service.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ success: true, booking });
  } catch (err) { next(err); }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getCustomerBookings(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getProviderBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getProviderBookings(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id, req.user.role);
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.user._id, req.params.id, req.body.status, req.body);
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const booking = await bookingService.verifyOTP(req.user._id, req.params.id, req.body.otp);
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelByCustomer(req.user._id, req.params.id, req.body.cancelReason);
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};

export const triggerSOS = async (req, res, next) => {
  try {
    const result = await bookingService.triggerSOS(req.user._id, req.params.id, req.body.location);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getActiveBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getActiveBooking(req.user._id, req.user.role);
    res.json({ success: true, booking });
  } catch (err) { next(err); }
};
