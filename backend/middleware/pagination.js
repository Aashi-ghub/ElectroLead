// Pagination middleware - enforce max limit of 20
export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 20); // Max 20

  // Validate page number
  if (page < 1) {
    return res.status(400).json({ error: 'Page must be greater than 0' });
  }

  // Set validated pagination values
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};



