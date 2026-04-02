const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required(),

  password: Joi.string()
    .min(6)
    .max(255)
    .required(),

  role: Joi.string()
    .valid('viewer', 'analyst', 'admin')
    .required(),

  status: Joi.string()
    .valid('active', 'inactive')
    .optional()
});

const updateUserSchema = Joi.object({
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
    .optional(),

  status: Joi.string()
    .valid('active', 'inactive')
    .optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
