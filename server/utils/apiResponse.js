/**
 * Standardized API response helpers - consistent format across all routes
 */
function success(res, data = null, message = null, statusCode = 200) {
  const body = { success: true };
  if (data !== null) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

function error(res, code, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: { code, message }
  });
}

module.exports = { success, error };
