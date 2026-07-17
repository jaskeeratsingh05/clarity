const mongoose = require('mongoose');
const { createError } = require('./errorHandler');

/**
 * Validates that a route parameter is a valid MongoDB ObjectId.
 * Usage: router.get('/:id', validateObjectId('id'), handler)
 */
const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    const value = req.params[param];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return next(createError(`Invalid ID format for parameter: ${param}`, 400));
    }
  }
  next();
};

module.exports = { validateObjectId };
