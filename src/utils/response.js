/**
 * Standardized API response helper
 */

const successResponse = (res, data, statusCode = 200, message = null) => {
  const response = {
    success: true,
    ...(data && { data }),
    ...(message && { message })
  };
  return res.status(statusCode).json(response);
};

const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, 201, message);
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse
};
