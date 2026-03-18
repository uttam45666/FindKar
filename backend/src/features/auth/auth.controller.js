import * as authService from './auth.service.js';

export const checkUsername = async (req, res, next) => {
  try {
    const result = await authService.checkUsername(req.params.username);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const sendOTP = async (req, res, next) => {
  try {
    const result = await authService.sendOTP(req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body, req);
    res.status(201).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const loginEmail = async (req, res, next) => {
  try {
    const result = await authService.loginWithEmail(req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const result = await authService.verifyOTPAndLogin(req.body, req);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const verifyForReset = async (req, res, next) => {
  try {
    const result = await authService.verifyForPasswordReset(req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const listSessions = async (req, res, next) => {
  try {
    const result = await authService.listSessions(req.user._id, req.sessionId);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    const result = await authService.logoutSessions({
      userId: req.user._id,
      currentSessionId: req.sessionId,
      mode: req.body.mode,
      sessionIds: req.body.sessionIds,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
