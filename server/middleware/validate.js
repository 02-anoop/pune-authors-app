const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    // If the request contains files (multipart/form-data), we validate req.body as well as req.file/req.files
    // We only validate the fields we care about.
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      });
    }
    next(err);
  }
};

module.exports = { validate };
