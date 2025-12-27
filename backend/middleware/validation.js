import Joi from 'joi';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    req.body = value;
    next();
  };
};

// Validation schemas
export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    role: Joi.string().valid('buyer', 'seller').required(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    company_name: Joi.string().max(255).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
    new_password: Joi.string().min(8).required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    company_name: Joi.string().max(255).optional(),
  }),

  createEnquiry: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().max(5000).optional(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).optional(),
    budget_min: Joi.number().positive().optional(),
    budget_max: Joi.number().positive().optional(),
    quote_deadline: Joi.date().iso().optional(),
    project_start_date: Joi.date().iso().optional(),
    delivery_date: Joi.date().iso().optional(),
  }),

  createQuotation: Joi.object({
    total_price: Joi.number().positive().required(),
    delivery_days: Joi.number().integer().positive().optional(),
    warranty_period: Joi.string().max(50).optional(),
    payment_terms: Joi.string().max(500).optional(),
    notes: Joi.string().max(2000).optional(),
  }),
};



