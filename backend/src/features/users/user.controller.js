import * as userService from './user.service.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user._id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user._id, req.body);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    const user = await userService.uploadProfileImage(req.user._id, req.file);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
