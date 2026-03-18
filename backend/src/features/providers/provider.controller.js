import * as providerService from './provider.service.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const provider = await providerService.getMyProviderProfile(req.user._id);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const setupProfile = async (req, res, next) => {
  try {
    const provider = await providerService.setupProviderProfile(req.user._id, req.body);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const updateWorkingHours = async (req, res, next) => {
  try {
    const provider = await providerService.updateWorkingHours(req.user._id, req.body.workingHours);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const toggleAvailability = async (req, res, next) => {
  try {
    const result = await providerService.toggleAvailability(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const addService = async (req, res, next) => {
  try {
    const services = await providerService.addService(req.user._id, req.body);
    res.json({ success: true, services });
  } catch (err) { next(err); }
};

export const updateService = async (req, res, next) => {
  try {
    const services = await providerService.updateService(req.user._id, req.params.serviceId, req.body);
    res.json({ success: true, services });
  } catch (err) { next(err); }
};

export const deleteService = async (req, res, next) => {
  try {
    const services = await providerService.deleteService(req.user._id, req.params.serviceId);
    res.json({ success: true, services });
  } catch (err) { next(err); }
};

export const uploadImages = async (req, res, next) => {
  try {
    const provider = await providerService.uploadProviderImages(req.user._id, req.files, req.query.type || 'shop');
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const getListings = async (req, res, next) => {
  try {
    const result = await providerService.getProviderListings(req.query);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getProviderById = async (req, res, next) => {
  try {
    const result = await providerService.getProviderById(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const vouchForProvider = async (req, res, next) => {
  try {
    const provider = await providerService.vouchForProvider(req.user._id, req.params.id);
    res.json({ success: true, provider });
  } catch (err) { next(err); }
};

export const incrementShare = async (req, res, next) => {
  try {
    const result = await providerService.incrementShare(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};
