const { z } = require('./commonSchemas');

const login = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8)
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

module.exports = { login };
