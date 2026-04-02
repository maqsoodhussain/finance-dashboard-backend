const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required'
    }),

  password: Joi.string()
    .min(6)
    .max(255)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password cannot exceed 255 characters',
      'any.required': 'Password is required'
    }),

  role: Joi.string()
    .valid('viewer', 'analyst', 'admin')
    .default('viewer')
    .optional()
});

const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .optional(),

  password: Joi.string()
    .min(6)
    .max(255)
    .optional(),

  role: Joi.string()
    .valid('viewer', 'analyst', 'admin')
    .optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};
