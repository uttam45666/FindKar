import Notification from '../../models/Notification.model.js';

export const getNotifications = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
  return { notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) };
};

export const markRead = async (userId, notificationId) => {
  await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true });
  return { success: true };
};

export const markAllRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { count };
};
