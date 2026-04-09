const { z } = require('zod');

const uuidSchema = z.string().uuid('Application ID must be a valid UUID');

function validateUuidParam(paramName) {
  return (req, res, next) => {
    const result = uuidSchema.safeParse(req.params[paramName]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid route parameter',
          details: [
            {
              field: paramName,
              message: result.error.issues[0].message,
            },
          ],
        },
      });
    }

    next();
  };
}

module.exports = { validateUuidParam };
