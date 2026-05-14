const success = (res, message, data = {}, statusCode = 200, meta) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const error = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, error };
