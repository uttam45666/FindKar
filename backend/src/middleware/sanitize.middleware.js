const stripHtml = (value) => value.replace(/<[^>]*>?/gm, '').trim();

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const safe = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.includes('$') || key.includes('.')) {
        continue;
      }
      safe[key] = sanitizeValue(val);
    }
    return safe;
  }

  if (typeof value === 'string') {
    return stripHtml(value);
  }

  return value;
};

export const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
};
