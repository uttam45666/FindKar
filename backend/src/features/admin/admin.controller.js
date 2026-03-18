import * as adminService from './admin.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) { next(err); }
};

export const getProviders = async (req, res, next) => {
  try {
    const result = await adminService.getProviders(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const approveProvider = async (req, res, next) => {
  try {
    const provider = await adminService.approveProvider(req.params.id, req.user._id);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const blockProvider = async (req, res, next) => {
  try {
    const provider = await adminService.blockProvider(req.params.id, req.body.reason, req.user._id);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const unblockProvider = async (req, res, next) => {
  try {
    const provider = await adminService.unblockProvider(req.params.id);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const getCustomers = async (req, res, next) => {
  try {
    const result = await adminService.getCustomers(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const toggleUserActive = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await adminService.getAllBookings(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getSOSAlerts = async (req, res, next) => {
  try {
    const result = await adminService.getSOSAlerts(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const resolveSOSAlert = async (req, res, next) => {
  try {
    const alert = await adminService.resolveSOSAlert(req.params.id, req.user._id, req.body.status, req.body.notes);
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await adminService.getAnalytics();
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
};
