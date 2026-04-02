const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required'
    }),

  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.required': 'Type is required and must be either income or expense'
    }),

  category: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Category is required',
      'string.max': 'Category cannot exceed 100 characters',
      'any.required': 'Category is required'
    }),

  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be in format YYYY-MM-DD',
      'any.required': 'Date is required'
    }),

  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    })
});

const updateRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),

  type: Joi.string()
    .valid('income', 'expense')
    .optional(),

  category: Joi.string()
    .min(1)
    .max(100)
    .optional(),

  date: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  description: Joi.string()
    .max(1000)
    .optional()
});

const filterRecordsSchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense')
    .optional(),

  category: Joi.string()
    .max(100)
    .optional(),

  startDate: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  endDate: Joi.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  minAmount: Joi.number()
    .positive()
    .optional(),

  maxAmount: Joi.number()
    .positive()
    .optional(),

  userId: Joi.string()
    .optional()
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  filterRecordsSchema
};
