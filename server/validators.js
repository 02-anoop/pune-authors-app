const { z } = require('zod');

const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().optional(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date format"),
  location: z.string().min(2, "Location is required"),
  duration: z.string().min(1, "Duration is required"),
  eventType: z.string().min(2, "Event type is required"),
  registrationFee: z.coerce.number().min(0, "Registration fee cannot be negative"),
  feeType: z.string().min(2, "Fee type is required")
});

module.exports = { eventSchema };
