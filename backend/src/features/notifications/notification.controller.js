import * as notificationService from './notification.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user._id, req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const markRead = async (req, res, next) => {
  try {
    await notificationService.markRead(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const markAllRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
